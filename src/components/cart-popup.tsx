
// @/components/cart-popup.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DesktopCartItemCard } from './desktop-cart-item-card';
import { Button } from './ui/button';
import Image from 'next/image';
import { OrderSummary } from './order-summary';
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
import type { SanityProduct } from '@/types';
import { EmptyState } from './empty-state';
import { useAppContext } from '@/context/app-context';
import { client } from '@/lib/sanity';
import { Loader } from './loader';
import { ScrollArea } from './ui/scroll-area';

interface CartPopupProps {
  onClose: () => void;
  onFinalizeOrder: () => void;
  onProductClick: (product: SanityProduct) => void;
}

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


export function CartPopup({ onClose, onFinalizeOrder, onProductClick }: CartPopupProps) {
  const { cart, updateCart, clearCart } = useAppContext();
  const [removingItems, setRemovingItems] = useState<string[]>([]);
  const router = useRouter();
  const [productsInCart, setProductsInCart] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cartItems = Object.values(cart);
  const productNamesInCart = cartItems.map(item => item.name);

  useEffect(() => {
    let isMounted = true;
    const fetchProductDetails = async () => {
      // Set loading to true only if we don't have product details yet.
      // This prevents the full loader on quantity updates.
      if (productsInCart.length === 0 && productNamesInCart.length > 0) {
        setIsLoading(true);
      } else if (productNamesInCart.length > 0) {
        setIsLoading(true); // Also set loading for quantity updates
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
        setIsLoading(false);
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);


  const productsByName = productsInCart.reduce((acc, product) => {
    acc[product.name] = product;
    return acc;
  }, {} as Record<string, SanityProduct>);


  const handleRemove = (productName: string) => {
    setRemovingItems(prev => [...prev, productName]);
  };

  const handleAnimationEnd = (productName: string) => {
    updateCart(productName, 0);
    setRemovingItems(prev => prev.filter(item => item !== productName));
  };

  const showInitialLoader = isLoading && productsInCart.length === 0 && productNamesInCart.length > 0;

  return (
    <div className={cn("bg-custom-purple-dark rounded-t-[40px] pt-4 text-white h-full overflow-hidden relative flex flex-col ring-4 ring-custom-gold animate-slide-up-fade-in")}>
      <div className="flex justify-between items-center mb-5 px-6">
        <div className="flex items-center rounded-3xl gap-3 bg-custom-gold border-none py-1 px-4">
            <Image src="/icons/cart.png" alt="Cart" width={20} height={20} />
            <h2 className="text-lg text-custom-purple-dark font-bold">My Cart</h2>
        </div>
        {cartItems.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-red-600 text-white border-none rounded-full hover:bg-red-500 hover:text-white text-sm h-9 px-4"
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
        )}
      </div>

      {showInitialLoader ? (
        <div className="flex-grow flex items-center justify-center h-full pb-16">
            <Loader />
        </div>
      ) : cartItems.length === 0 ? (
          <div className="flex-grow flex items-center justify-center h-full pb-16">
              <EmptyState
                  imageUrl="/icons/empty.png"
                  title="Your Cart is Empty"
                  description="Looks like you haven't added anything to your cart yet. Start exploring to find the perfect gift!"
                  onButtonClick={() => {
                      onClose();
                      router.push('/');
                  }}
                  showButton={false}
              />
          </div>
      ) : (
        <div className="flex h-full gap-4 flex-grow min-h-0 px-6 pb-4">
          {/* Left Section (Items) */}
          <div className="w-[60%] flex flex-col">
            <ScrollArea className="flex-grow pr-4 min-h-0 custom-scrollbar">
              <div className="space-y-4 pb-4">
                {cartItems.map((item) => {
                  const product = productsByName[item.name];
                  if (!product) return null; // Don't render if product details haven't loaded yet
                  return (
                    <DesktopCartItemCard
                      key={item.name}
                      item={item}
                      product={product}
                      onQuantityChange={(productName, quantity, flavours) => updateCart(productName, quantity, flavours)}
                      onRemove={() => handleRemove(item.name)}
                      isRemoving={removingItems.includes(item.name)}
                      onAnimationEnd={() => handleAnimationEnd(item.name)}
                      onProductClick={onProductClick}
                    />
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Section (Summary & Footer) */}
          <div className="w-[40%] flex flex-col pr-0">
              <OrderSummary cart={cart} allProducts={productsInCart} onFinalizeOrder={onFinalizeOrder} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
