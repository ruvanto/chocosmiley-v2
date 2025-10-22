
// @/app/cart/cart-client-page.tsx
'use client';

import { useState, useEffect, type UIEvent, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/header';
import { BottomNavbar } from '@/components/bottom-navbar';
import { SparkleBackground } from '@/components/sparkle-background';
import { cn } from '@/lib/utils';
import { PopupsManager } from '@/components/popups/popups-manager';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileCartItemCard } from '@/components/mobile-cart-item-card';
import { MobileCartSummary } from '@/components/mobile-cart-summary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StaticSparkleBackground } from '@/components/static-sparkle-background';
import { FloatingCartFinalizeButton } from '@/components/floating-cart-finalize-button';
import { EmptyState } from '@/components/empty-state';
import { useAppContext } from '@/context/app-context';
import type { SanityProduct, ActiveView } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import CustomScreenLoader from '@/components/custom-screen-loader';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { client } from '@/lib/sanity';


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


export default function CartClientPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { cart, updateCart, clearCart, addOrder, isAuthenticated, setAuthPopup, isCartLoaded, setIsGlobalLoading, isProcessingOrder, setIsProcessingOrder, profileInfo } = useAppContext();
  const isMobile = useIsMobile();
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [productsInCart, setProductsInCart] = useState<SanityProduct[]>([]);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [isCartUpdating, setIsCartUpdating] = useState(false);

  const cartItems = Object.values(cart);
  const productNamesInCart = cartItems.map(item => item.name);


  useEffect(() => {
    setIsClient(true);
    setIsGlobalLoading(false);
  }, [setIsGlobalLoading]);
  
  useEffect(() => {
    let isMounted = true;
    const fetchProductDetails = async () => {
      // Don't show a full loader on quantity updates, only on initial load.
      if (isCartLoaded && !isCartUpdating) {
        setIsProductLoading(true);
      }
      
      if (productNamesInCart.length > 0) {
        const fetchedProducts = await getProductsForCart(productNamesInCart);
        if (isMounted) {
            setProductsInCart(fetchedProducts);
        }
      } else {
         if (isMounted) {
            setProductsInCart([]);
        }
      }
      if (isMounted) {
        setIsProductLoading(false);
        setIsCartUpdating(false);
      }
    };

    if (isCartLoaded) {
      fetchProductDetails();
    }
    
    return () => {
        isMounted = false;
    };
  }, [cart, isCartLoaded]);

  useEffect(() => {
    if (!isClient || !isMobile) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSummaryVisible(entry.isIntersecting);
      },
      { 
        rootMargin: "0px 0px -150px 0px",
        threshold: 0.01 
      } 
    );

    const currentRef = summaryRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isClient, isMobile, productsInCart]);

  const handleNavigation = (view: ActiveView) => {
    const newPath = view === 'home' ? '/' : `/${view}`;
    if (pathname === newPath) return;
    setIsGlobalLoading(true);
    router.push(newPath);
  };
  
  const handleProductClick = (product: SanityProduct) => {
    setIsGlobalLoading(true);
    router.push(`/product/${product.slug.current}`);
  };

  const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
    if (`/${view}` === pathname) return;
    setIsGlobalLoading(true);
    router.push(`/${view}`);
  }

  const handleQuantityChange = (productName: string, newQuantity: number) => {
    setIsCartUpdating(true);
    updateCart(productName, newQuantity);
  };

  const handleRemove = (productName: string) => {
    handleQuantityChange(productName, 0);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to place your order.",
        action: <ToastAction altText="Login" onClick={() => setAuthPopup('login')}>Login</ToastAction>,
      });
      return;
    }
    
    if (!profileInfo.name || !profileInfo.phone || !profileInfo.address) {
        toast({
            title: "Profile Incomplete",
            description: "Please complete your profile before placing an order.",
            action: (
                <ToastAction altText="Complete Profile" onClick={() => router.push('/profile')}>
                    Complete Profile
                </ToastAction>
            ),
        });
        return;
    }

    setIsProcessingOrder(true);
    const newOrderId = await addOrder(cart);

    if (newOrderId) {
      clearCart();
      router.push(`/order-confirmed?orderId=${newOrderId}`);
    } else {
      setIsProcessingOrder(false); // Make sure to stop processing on failure
    }
  };
  
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    const currentScrollTop = event.currentTarget.scrollTop;
    if (Math.abs(currentScrollTop - lastScrollTop) <= 10) {
      return;
    }

    if (currentScrollTop > lastScrollTop && currentScrollTop > 56) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
    setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
  };


  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const productsByName = productsInCart.reduce((acc, product) => {
    acc[product.name] = product;
    return acc;
  }, {} as Record<string, SanityProduct>);
  
  const isPageLoading = !isClient || !isCartLoaded || (cartItems.length > 0 && productsInCart.length !== cartItems.length);

  if (isPageLoading) {
    return (
      <CustomScreenLoader text="Just a moment, organizing your cart...." />
    );
  }

  return (
    <>
      {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
      <div className="flex flex-col min-h-screen">
        <Header
          onProfileOpenChange={setIsProfileOpen}
          isContentScrolled={true}
          onReset={() => {
            if (pathname === '/') return;
            setIsGlobalLoading(true);
            router.push('/');
          }}
          onNavigate={handleHeaderNavigate}
          activeView={'cart'}
          isEnquireOpen={isEnquireOpen}
          onEnquireOpenChange={setIsEnquireOpen}
        />
        <ProfileCompletionBanner isMobile={isMobile} />
        <main onScroll={handleScroll} className={cn(
          "flex-grow flex flex-col transition-all duration-300 relative min-h-0 md:pb-0",
          "pt-20 md:pb-0"
        )}>
          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center h-full px-4 pb-32">
              <EmptyState
                imageUrl="/icons/empty.png"
                title="Your Cart is Empty"
                description="Looks like you haven't added anything to your cart yet. Start exploring to find the perfect gift!"
                buttonText="Continue Shopping"
                onButtonClick={() => {
                  setIsGlobalLoading(true);
                  router.push('/');
                }}
              />
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="flex-grow overflow-y-auto no-scrollbar">
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="bg-white/80 rounded-2xl flex flex-col">
                      <div className="flex justify-between items-center p-4 border-b border-black/10 flex-shrink-0">
                        <p className="text-base font-bold text-black">Total Products: {cartItems.length}</p>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 text-white rounded-full hover:bg-red-600/90 text-xs h-8 px-3 disabled:opacity-50"
                              disabled={cartItems.length === 0}
                            >
                              Clear Cart
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove all items from your cart. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={clearCart}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <div className="overflow-y-auto no-scrollbar">
                        {cartItems.map((item, index) => {
                          const product = productsByName[item.name];
                          if (!product) return null; 
                          return (
                           <MobileCartItemCard
                              key={item.name}
                              item={item}
                              product={product}
                              onQuantityChange={handleQuantityChange}
                              onRemove={handleRemove}
                              isLastItem={index === cartItems.length - 1}
                              onProductClick={() => handleProductClick(product)}
                            />
                          )
                        })}
                      </div>
                    </div>
                    {cartItems.length > 0 && productsInCart.length > 0 && (
                      <MobileCartSummary ref={summaryRef} cart={cart} allProducts={productsInCart} onCheckout={handleCheckout} isLoading={isProcessingOrder || isCartUpdating} />
                    )}
                  </div>
                  <div className="h-16" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4 pt-32">
                  <h2 className="text-2xl font-bold text-white">Desktop Cart View</h2>
                  <p className="text-white/70 max-w-xs">
                    Can only be viewed in mobile.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
        <BottomNavbar activeView={'cart'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
      </div>

      <PopupsManager
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isEnquireOpen={isEnquireOpen}
      />
      {isMobile && cartItems.length > 0 && productsInCart.length > 0 && (
        <FloatingCartFinalizeButton
          cart={cart}
          allProducts={productsInCart}
          onCheckout={handleCheckout}
          isVisible={!isSummaryVisible}
          isLoading={isProcessingOrder || isCartUpdating}
        />
      )}
    </>
  );
}
