

// @/context/app-context.tsx
'use client';

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import type { SanityProduct, WishlistItem, OrderItem, Order } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import {
  onAuthStateChanged,
  signOutUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  addUserOrder,
  onUserOrdersSnapshotPaginated,
  getMoreUserOrders,
  onAllOrdersSnapshot,
  updateOrderStatus as updateOrderStatusInDb,
  rateOrder as rateOrderInDb,
  addCancellationReason,
  getMoreOrders,
  deleteUserAccount,
  onWishlistSnapshot,
  addToWishlist,
  removeFromWishlist,
  clearFirestoreWishlist,
  onCartSnapshot,
  updateUserCart,
} from '@/lib/firebase';
import { client } from '@/lib/sanity';
import type { User } from 'firebase/auth';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { ProgressBarComponent } from '@/components/progress-bar';
import { ProcessingOrderFallback, AuthLoadingFallback } from '@/components/loading-fallback';


export type CartItem = {
  name: string;
  quantity: number;
  flavours?: string[];
};

const defaultProfileInfo: ProfileInfo = {
    name: '',
    phone: '',
    email: '',
    address: '',
};

const WISHLIST_STORAGE_KEY = 'chocoSmileyWishlist';
const CART_STORAGE_KEY = 'chocoSmileyCart';
const FLAVOUR_SELECTIONS_STORAGE_KEY = 'chocoSmileyFlavourSelections';

export type Cart = Record<string, CartItem>;
type AuthPopupType = 'login' | 'signup' | 'completeDetails' | 'forgotPassword' | null;

interface AppContextType {
  profileInfo: ProfileInfo;
  updateProfileInfo: (newInfo: Partial<ProfileInfo>) => void;
  isProfileLoaded: boolean;
  
  likedProducts: WishlistItem[];
  isWishlistLoaded: boolean;
  toggleLike: (product: SanityProduct | null, productId: string) => void;
  clearWishlist: () => void;
  
  orders: Order[];
  isOrdersLoaded: boolean;
  loadMoreUserOrders: () => Promise<void>;
  hasMoreUserOrders: boolean;
  addOrder: (cart: Cart) => Promise<string | null>;
  clearOrders: () => void;
  reorder: (orderId: string) => void;
  
  allOrders: Order[];
  isAllOrdersLoaded: boolean;
  loadMoreOrders: () => Promise<void>;
  hasMoreOrders: boolean;
  updateOrderStatus: (uid: string, orderId: string, newStatus: Order['status'], cancelledBy?: 'user' | 'admin') => Promise<void>;
  adminStatusFilter: Order['status'] | 'All';
  handleAdminStatusFilterChange: (newFilter: Order['status'] | 'All') => void;

  cart: Cart;
  updateCart: (productName: string, quantity: number, flavours?: string[]) => void;
  clearCart: () => void;
  isCartLoaded: boolean;

  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  login: (user: User, isNewUser: boolean) => Promise<void>;
  logout: () => void;
  authPopup: AuthPopupType;
  setAuthPopup: (popup: AuthPopupType) => void;

  flavourSelection: {
    product: SanityProduct | null;
    isOpen: boolean;
    preselectedFlavours?: string[];
  };
  setFlavourSelection: (selection: { product: SanityProduct | null; isOpen: boolean; preselectedFlavours?: string[] }) => void;
  flavourSelections: Record<string, string[]>;
  toggleFlavourSelection: (productName: string, flavourName: string) => void;
  setFlavourSelectionsForProduct: (productName: string, flavours: string[]) => void;
  
  isGlobalLoading: boolean;
  setIsGlobalLoading: (isLoading: boolean) => void;
  isProcessingOrder: boolean;
  setIsProcessingOrder: (isProcessing: boolean) => void;
  isAuthenticating: boolean;
  setIsAuthenticating: (isAuthenticating: boolean, message?: string) => void;
}

export type ProfileInfo = {
    name: string;
    phone: string;
    email: string;
    address: string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

async function getProductsForCart(productNames: string[]): Promise<SanityProduct[]> {
    if (productNames.length === 0) return [];
    const query = `*[_type == "product" && name in $productNames]{
        _id, name, slug, mrp, discountedPrice, weight, packageType, composition, isOutOfStock, "images": images[].asset->url,
        "availableFlavours": availableFlavours[]-> | order(orderRank) { _id, name, "imageUrl": image.asset->url, "price": coalesce(price, 0) },
        numberOfChocolates
    }`;
    const products = await client.fetch(query, { productNames });
    return products;
}

export function AppContextProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>(defaultProfileInfo);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const [localWishlist, setLocalWishlist] = useLocalStorage<WishlistItem[]>(WISHLIST_STORAGE_KEY, []);
  const [firestoreWishlist, setFirestoreWishlist] = useState<WishlistItem[]>([]);
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);
  const likedProducts = isAuthenticated ? firestoreWishlist : localWishlist;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoaded, setIsOrdersLoaded] = useState(false);
  const [lastUserOrderSnapshot, setLastUserOrderSnapshot] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreUserOrders, setHasMoreUserOrders] = useState(true);

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isAllOrdersLoaded, setIsAllOrdersLoaded] = useState(false);
  const [lastOrderSnapshot, setLastOrderSnapshot] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [adminStatusFilter, setAdminStatusFilter] = useState<Order['status'] | 'All'>('All');

  const [localCart, setLocalCart, isLocalCartLoaded] = useLocalStorage<Cart>(CART_STORAGE_KEY, {});
  const [firestoreCart, setFirestoreCart] = useState<Cart>({});
  const [isFirestoreCartLoaded, setIsFirestoreCartLoaded] = useState(false);
  const cart = isAuthenticated ? firestoreCart : localCart;
  const isCartLoaded = isAuthenticated ? isFirestoreCartLoaded : isLocalCartLoaded;
  
  const [flavourSelections, setFlavourSelections] = useLocalStorage<Record<string, string[]>>(
    FLAVOUR_SELECTIONS_STORAGE_KEY,
    {}
  );

  const [authPopup, setAuthPopup] = useState<AuthPopupType>(null);
  const [flavourSelection, setFlavourSelection] = useState<{ product: SanityProduct | null; isOpen: boolean; preselectedFlavours?: string[] }>({ product: null, isOpen: false, preselectedFlavours: [] });
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isAuthenticating, _setIsAuthenticating] = useState(false);
  const [authMessage, setAuthMessage] = useState("Signing you in...");

  const setIsAuthenticating = (authenticating: boolean, message?: string) => {
    _setIsAuthenticating(authenticating);
    if (message) {
        setAuthMessage(message);
    }
  };

  const loadMoreOrders = useCallback(async () => {
    if (!lastOrderSnapshot) {
        if (hasMoreOrders) setHasMoreOrders(false);
        return;
    }

    try {
        const { orders: newOrders, lastVisible } = await getMoreOrders(adminStatusFilter, lastOrderSnapshot);
        
        setAllOrders(prevOrders => [...prevOrders, ...newOrders]);
        setLastOrderSnapshot(lastVisible);
        setHasMoreOrders(!!lastVisible);

    } catch (error) {
        console.error("Failed to load more admin orders:", error);
    }
  }, [adminStatusFilter, hasMoreOrders, lastOrderSnapshot]);


 const handleAdminStatusFilterChange = useCallback((newFilter: Order['status'] | 'All') => {
    setAdminStatusFilter(newFilter);
    setIsAllOrdersLoaded(false);
     onAllOrdersSnapshot((initialAdminOrders, lastVisible) => {
          setAllOrders(initialAdminOrders);
          setLastOrderSnapshot(lastVisible);
          setHasMoreOrders(!!lastVisible);
          setIsAllOrdersLoaded(true);
     }, newFilter);
 }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;

    let unsubscribeUserOrders = () => {};
    let unsubscribeAdminOrders = () => {};
    let unsubscribeWishlist = () => {};
    let unsubscribeCart = () => {};

    const unsubscribeFromAuth = onAuthStateChanged(async (newUser) => {
        setIsProfileLoaded(false);
        setIsWishlistLoaded(false);
        setIsFirestoreCartLoaded(false);
        setUser(newUser);
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').toLowerCase().split(',').map(email => email.trim());
        const newIsAdmin = !!newUser?.email && adminEmails.includes(newUser.email.toLowerCase());
        setIsAuthenticated(!!newUser);
        setIsAdmin(newIsAdmin);

        unsubscribeUserOrders();
        unsubscribeAdminOrders();
        unsubscribeWishlist();
        unsubscribeCart();

        if (newUser) {
            let profile = await getUserProfile(newUser.uid);
            if (profile) {
                setProfileInfo(profile);
            }
            
            unsubscribeUserOrders = onUserOrdersSnapshotPaginated(newUser.uid, (initialUserOrders, lastVisible) => {
                setOrders(initialUserOrders);
                setLastUserOrderSnapshot(lastVisible);
                setHasMoreUserOrders(initialUserOrders.length === 5);
                setIsOrdersLoaded(true);
            });

            unsubscribeWishlist = onWishlistSnapshot(newUser.uid, (wishlist) => {
                setFirestoreWishlist(wishlist);
                setIsWishlistLoaded(true);
            });

            if (localWishlist.length > 0) {
              for (const item of localWishlist) {
                await addToWishlist(newUser.uid, item._id, {
                  name: item.name,
                  slug: item.slug,
                  subtitle: item.subtitle,
                  coverImage: item.coverImage,
                  discountedPrice: item.discountedPrice
                });
              }
              setLocalWishlist([]);
            }

            unsubscribeCart = onCartSnapshot(newUser.uid, (cartFromDb) => {
                const guestCartSize = Object.keys(localCart).length;
                if (guestCartSize > 0) {
                    const mergedCart = { ...cartFromDb, ...localCart };
                    updateUserCart(newUser.uid, mergedCart);
                    setFirestoreCart(mergedCart);
                    setLocalCart({}); // Clear local cart after merge
                } else {
                    setFirestoreCart(cartFromDb);
                }
                setIsFirestoreCartLoaded(true);
            });

            if (newIsAdmin) {
               unsubscribeAdminOrders = onAllOrdersSnapshot((initialAdminOrders, lastVisible) => {
                    setAllOrders(initialAdminOrders);
                    setLastOrderSnapshot(lastVisible);
                    setHasMoreOrders(!!lastVisible);
                    setIsAllOrdersLoaded(true);
               }, adminStatusFilter);
            } else {
                setAllOrders([]);
                setIsAllOrdersLoaded(true);
            }
        } else {
            setProfileInfo(defaultProfileInfo);
            setOrders([]);
            setAllOrders([]);
            setFirestoreWishlist([]);
            setFirestoreCart({});
            setIsOrdersLoaded(true);
            setIsAllOrdersLoaded(true);
            setIsWishlistLoaded(true);
            setIsFirestoreCartLoaded(true);
        }
        setIsProfileLoaded(true);
        setIsAuthLoaded(true);
    });

    return () => {
        unsubscribeFromAuth();
        unsubscribeUserOrders();
        unsubscribeAdminOrders();
        unsubscribeWishlist();
        unsubscribeCart();
    };
  }, [adminStatusFilter, localWishlist, setLocalWishlist, localCart, setLocalCart]);
  
  const loadMoreUserOrders = useCallback(async () => {
    if (!user || !lastUserOrderSnapshot || !hasMoreUserOrders) return;

    const { orders: newOrders, lastVisible } = await getMoreUserOrders(user.uid, lastUserOrderSnapshot);
    setOrders(prevOrders => [...prevOrders, ...newOrders]);
    setLastUserOrderSnapshot(lastVisible);
    setHasMoreUserOrders(newOrders.length === 5);
  }, [user, lastUserOrderSnapshot, hasMoreUserOrders]);


  const updateProfileInfo = useCallback(async (newInfo: Partial<ProfileInfo>) => {
    if (user) {
      try {
        await updateUserProfile(user.uid, newInfo);
        setProfileInfo(prev => ({ ...prev, ...newInfo }));
        toast({ title: "Profile Updated", variant: "success" });
      } catch (e) {
        console.error("Error updating profile in Firestore:", e);
        toast({
          title: "Error",
          description: "Could not save profile changes.",
          variant: "destructive"
        });
      }
    }
  }, [user, toast]);

  const toggleLike = useCallback(async (product: SanityProduct | null, productId: string) => {
    const isCurrentlyLiked = likedProducts.some(p => p._id === productId);

    if (isCurrentlyLiked) {
        if (user) {
            await removeFromWishlist(user.uid, productId);
        } else {
            setLocalWishlist(prev => prev.filter(p => p._id !== productId));
        }
    } else {
        if (!product) {
            console.error("Cannot 'like' a product without the full product details.");
            toast({
              title: "Could not save to wishlist",
              description: "Product details are missing.",
              variant: "destructive"
            });
            return;
        }

        const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');
        const wishlistItem: WishlistItem = {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            subtitle: subtitle,
            coverImage: product.images?.[0] || '/placeholder.png',
            discountedPrice: product.discountedPrice
        };

        if (user) {
            await addToWishlist(user.uid, product._id, wishlistItem);
        } else {
            setLocalWishlist(prev => [...prev, wishlistItem]);
        }
    }
  }, [user, likedProducts, localWishlist, setLocalWishlist, toast]);


  const clearWishlist = useCallback(async () => {
    if (user) {
      await clearFirestoreWishlist(user.uid);
    } else {
      setLocalWishlist([]);
    }
  }, [user, setLocalWishlist]);


  const addOrder = useCallback(async (cartForOrder: Cart): Promise<string | null> => {
    if (!user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to place an order.",
            variant: "destructive",
        });
        return null;
    }

    try {
        const productNames = Object.keys(cartForOrder);
        if (productNames.length === 0) {
            toast({ title: "Your cart is empty!", variant: "destructive" });
            return null;
        }

        const productsFromDb = await getProductsForCart(productNames);
        const productsByName = productsFromDb.reduce((acc, product) => {
            acc[product.name] = product;
            return acc;
        }, {} as Record<string, SanityProduct>);

        let totalMrp = 0;
        let totalProductPrice = 0;
        let totalFlavoursCost = 0;

        const orderItems: OrderItem[] = Object.values(cartForOrder).map(cartItem => {
            const product = productsByName[cartItem.name];
            if (!product) throw new Error(`Product details for ${cartItem.name} not found.`);

            const itemMrp = (product.mrp || product.discountedPrice || 0) * cartItem.quantity;
            const itemProductPrice = (product.discountedPrice || 0) * cartItem.quantity;
            
            let itemFlavourCost = 0;
            const flavoursWithPrices: { name: string; price: number; }[] = [];

            const selectedFlavoursCount = cartItem.flavours?.length || 0;
            if (selectedFlavoursCount > 0 && product.numberOfChocolates) {
                const baseCount = Math.floor(product.numberOfChocolates / selectedFlavoursCount);
                const remainder = product.numberOfChocolates % selectedFlavoursCount;
                
                let singleUnitFlavourCost = 0;
                (cartItem.flavours || []).forEach((flavourName, index) => {
                    const flavour = product.availableFlavours?.find(f => f.name === flavourName);
                    const pieces = baseCount + (index < remainder ? 1 : 0);
                    singleUnitFlavourCost += (flavour?.price || 0) * pieces;
                    flavoursWithPrices.push({ name: flavourName, price: flavour?.price || 0 });
                });
                itemFlavourCost = singleUnitFlavourCost * cartItem.quantity;
            }
            
            const itemSubtotal = itemProductPrice + itemFlavourCost;

            totalMrp += itemMrp;
            totalProductPrice += itemProductPrice;
            totalFlavoursCost += itemFlavourCost;
            
            return {
                name: product.name,
                quantity: cartItem.quantity,
                flavours: flavoursWithPrices,
                mrp: product.mrp,
                finalProductPrice: itemProductPrice,
                finalSubtotal: itemSubtotal,
                coverImage: product.images?.[0] || '/placeholder.png',
                numberOfChocolates: product.numberOfChocolates,
            };
        }).filter((item): item is OrderItem => item !== null);

        const subtotal = totalProductPrice + totalFlavoursCost;
        const totalDiscount = totalMrp - totalProductPrice;
        const gstRate = 0.05;
        const gstAmount = subtotal * gstRate;
        const total = subtotal + gstAmount;

        const newOrderData: Omit<Order, 'id' | 'uid' | 'date' | 'customOrderId'> = {
            items: orderItems,
            status: 'Order Requested',
            total: total > 0 ? total : 0,
            totalDiscount: totalDiscount,
            gstPercentage: gstRate * 100,
        };

        const newOrderId = await addUserOrder(user.uid, newOrderData);
        return newOrderId;
        
    } catch (error) {
        console.error("Error creating order:", error);
        toast({
            title: "Order Failed",
            description: "There was a problem creating your order. Please try again.",
            variant: "destructive",
        });
        return null;
    }
  }, [user, toast]);


  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  const updateCart = useCallback((productName: string, newQuantity: number, newFlavours?: string[]) => {
    const newCart = { ...cart };
    if (newQuantity <= 0) {
      delete newCart[productName];
    } else {
      const currentItem = newCart[productName] || { name: productName, quantity: 0 };
      newCart[productName] = {
        ...currentItem,
        quantity: newQuantity,
        flavours: newFlavours !== undefined ? newFlavours : (currentItem.flavours || []),
      };
    }

    if (user) {
      updateUserCart(user.uid, newCart);
    } else {
      setLocalCart(newCart);
    }
  }, [cart, user, setLocalCart]);

  const clearCart = useCallback(() => {
    if (user) {
      updateUserCart(user.uid, {});
    } else {
      setLocalCart({});
    }
  }, [user, setLocalCart]);


  const reorder = useCallback(async (orderId: string) => {
    const orderToReorder = orders.find(o => o.id === orderId);
    if (!orderToReorder) return;

    const productNames = orderToReorder.items.map(item => item.name);
    const productsFromDb = await getProductsForCart(productNames);
    const productsByName = productsFromDb.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, SanityProduct>);


    const outOfStockItems = orderToReorder.items.filter(item => {
        const product = productsByName[item.name];
        return !product || product.isOutOfStock;
    });

    const inStockOrderItems = orderToReorder.items.filter(item => {
        const product = productsByName[item.name];
        return product && !product.isOutOfStock;
    });

    if (inStockOrderItems.length > 0) {
        let newCart = { ...cart };
        inStockOrderItems.forEach(item => {
            const itemFlavours = item.flavours?.map(f => f.name) || [];
            if (newCart[item.name]) {
                newCart[item.name].quantity += item.quantity;
                const existingFlavours = newCart[item.name].flavours || [];
                newCart[item.name].flavours = [...new Set([...existingFlavours, ...itemFlavours])];
            } else {
                newCart[item.name] = { 
                    name: item.name,
                    quantity: item.quantity,
                    flavours: itemFlavours,
                };
            }
        });
        if (user) {
            updateUserCart(user.uid, newCart);
        } else {
            setLocalCart(newCart);
        }
    }

    if (outOfStockItems.length > 0) {
        toast({
            title: "Some Items Unavailable",
            description: `${outOfStockItems.map(p => p.name).join(', ')} are out of stock and were not added to the cart.`,
            variant: "default",
            duration: 5000,
        });
    } else if (inStockOrderItems.length > 0) {
        toast({
            title: "Order Added to Cart",
            variant: "success",
        });
    } else {
       toast({
            title: "All Items Out of Stock",
            description: "None of the items from this order could be added to your cart as they are all out of stock.",
            variant: "destructive",
            duration: 5000,
        });
    }

  }, [orders, cart, setLocalCart, user, toast]);

  const login = useCallback(async (loggedInUser: User, isNewUser: boolean) => {
    try {
        let profile = await getUserProfile(loggedInUser.uid);
        let needsDetails = false;

        if (isNewUser || !profile) {
            profile = {
                name: loggedInUser.displayName || '',
                email: loggedInUser.email || '',
                phone: loggedInUser.phoneNumber || '',
                address: '',
            };
            await createUserProfile(loggedInUser.uid, profile);
            needsDetails = true;
        } else {
            if (!profile.name || !profile.phone || !profile.address) {
                needsDetails = true;
            }
        }
        
        setProfileInfo(profile);
        
        if (needsDetails) {
            setAuthPopup('completeDetails');
        } else {
            setAuthPopup(null);
            toast({ title: "Logged In Successfully!", variant: "success" });
        }
    } finally {
        setIsAuthenticating(false);
    }
  }, [setIsAuthenticating, toast]);


  const logout = useCallback(async () => {
    try {
      await signOutUser();
      setAuthPopup(null); 
      toast({
        title: "Logged Out",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  const handleUpdateOrderStatus = async (uid: string, orderId: string, newStatus: Order['status'], cancelledBy?: 'user' | 'admin'): Promise<void> => {
    try {
      await updateOrderStatusInDb(uid, orderId, newStatus, cancelledBy);
      toast({
        title: "Status Updated",
        variant: 'success'
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the order status.",
        variant: 'destructive'
      });
    }
  };
  
  const rateOrder = async (uid: string, orderId: string, rating: number, feedback: string) => {
    // Optimistic UI update
    const previousOrders = orders;
    const previousAllOrders = allOrders;

    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, rating, feedback } : order
      )
    );
    setAllOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, rating, feedback } : order
      )
    );
    
    try {
      await rateOrderInDb(uid, orderId, rating, feedback);
    } catch (error) {
      console.error("Failed to rate order:", error);
      toast({
        title: "Rating Failed",
        description: "Could not submit your feedback. Your changes have been reverted.",
        variant: 'destructive'
      });
      // Revert optimistic update on failure
      setOrders(previousOrders);
      setAllOrders(previousAllOrders);
    }
  };

  const saveCancellationReason = async (uid: string, orderId: string, reason: string) => {
    try {
        const reasonToSave = reason === 'SKIPPED' ? 'Feedback not provided by customer.' : reason;
        await addCancellationReason(uid, orderId, reasonToSave);
    } catch (error) {
        console.error("Failed to save cancellation reason:", error);
        toast({
            title: "Feedback Failed",
            description: "Could not save your cancellation reason.",
            variant: 'destructive'
        });
    }
  };
  
  const toggleFlavourSelection = useCallback((productName: string, flavourName: string) => {
    let updatedFlavours: string[] = [];
    setFlavourSelections(prev => {
      const newSelections = { ...prev };
      const currentProductFlavours = newSelections[productName] || [];
      const flavourIndex = currentProductFlavours.indexOf(flavourName);

      if (flavourIndex > -1) {
        // Flavor is being removed
        updatedFlavours = currentProductFlavours.filter(f => f !== flavourName);
      } else {
        // Flavor is being added
        updatedFlavours = [...currentProductFlavours, flavourName];
      }
      
      if (updatedFlavours.length === 0) {
        delete newSelections[productName];
      } else {
        newSelections[productName] = updatedFlavours;
      }

      // If product is already in cart, update its flavours
      if (cart[productName]) {
        updateCart(productName, cart[productName].quantity, updatedFlavours);
      }

      return newSelections;
    });
  }, [setFlavourSelections, cart, updateCart]);
  
  const setFlavourSelectionsForProduct = useCallback((productName: string, flavours: string[]) => {
      setFlavourSelections(prev => {
          const newSelections = { ...prev };
          if (flavours.length > 0) {
              newSelections[productName] = flavours;
          } else {
              delete newSelections[productName];
          }
          return newSelections;
      });
  }, [setFlavourSelections]);


  const value: AppContextType = {
    profileInfo,
    updateProfileInfo,
    isProfileLoaded: isProfileLoaded && isAuthLoaded,
    likedProducts,
    isWishlistLoaded,
    toggleLike,
    clearWishlist,
    orders,
    addOrder,
    isOrdersLoaded,
    loadMoreUserOrders,
    hasMoreUserOrders,
    clearOrders,
    reorder,
    allOrders,
    isAllOrdersLoaded,
    loadMoreOrders,
    hasMoreOrders,
    updateOrderStatus: handleUpdateOrderStatus,
    adminStatusFilter,
    handleAdminStatusFilterChange,
    cart,
    updateCart,
    clearCart,
    isCartLoaded,
    
    isAuthenticated,
    user,
    isAdmin,
    login,
    logout,
    authPopup,
    setAuthPopup,
    flavourSelection,
    setFlavourSelection,
    flavourSelections,
    toggleFlavourSelection,
    setFlavourSelectionsForProduct,
    isGlobalLoading,
    setIsGlobalLoading,
    isProcessingOrder,
    setIsProcessingOrder,
    isAuthenticating,
    setIsAuthenticating,
  };

  return (
    <AppContext.Provider value={value}>
        {isGlobalLoading && <ProgressBarComponent />}
        {isProcessingOrder && <ProcessingOrderFallback />}
        {isAuthenticating && <AuthLoadingFallback message={authMessage} />}
        {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
}

export const AppContextConsumer = AppContext.Consumer;

    