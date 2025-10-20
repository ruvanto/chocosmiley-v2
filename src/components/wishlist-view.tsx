// @/components/wishlist-view.tsx
'use client';

import { useState, useEffect } from 'react';
import type { SanityProduct, WishlistItem } from "@/types";
import { WishlistItemCard } from "./wishlist-item-card";
import { Button } from "./ui/button";
import { FaTrash } from "react-icons/fa";
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
import { EmptyState } from './empty-state';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Loader } from './loader';
import { client } from '@/lib/sanity';

interface WishlistViewProps {
  isMobile?: boolean;
}

export function WishlistView({ 
  isMobile = false,
}: WishlistViewProps) {
  const { 
    likedProducts, 
    toggleLike, 
    clearWishlist, 
    cart, 
    updateCart,
    setFlavourSelection,
    setIsGlobalLoading,
    isWishlistLoaded,
  } = useAppContext();
  
  const router = useRouter();
  const [unlikingItems] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Record<string, SanityProduct>>({});
  const [areProductsLoaded, setAreProductsLoaded] = useState(false);

  // Fetch product details for items in wishlist
  useEffect(() => {
    const fetchWishlistProductDetails = async () => {
        if (likedProducts.length === 0) {
            setAreProductsLoaded(true);
            return;
        }
        const productIds = likedProducts.map(p => p._id);
        const query = `*[_type == "product" && _id in $productIds]{
            ...,
            isOutOfStock,
            "images": images[].asset->url,
            availableFlavours[]->{_id, name, "imageUrl": image.asset->url, "price": coalesce(price, 0)},
        }`;
        try {
            const products: SanityProduct[] = await client.fetch(query, { productIds });
            const productsMap = products.reduce((acc, product) => {
                acc[product._id] = product;
                return acc;
            }, {} as Record<string, SanityProduct>);
            setAllProducts(productsMap);
        } catch (error) {
            console.error("Failed to fetch wishlist product details:", error);
        } finally {
            setAreProductsLoaded(true);
        }
    };

    if (isWishlistLoaded) {
        fetchWishlistProductDetails();
    }
  }, [isWishlistLoaded, likedProducts]);

  
  const handleUnlike = (product: WishlistItem) => {
    const fullProduct = allProducts[product._id];
    toggleLike(fullProduct || null, product._id);
  };
  
  const onAddToCart = (product: WishlistItem) => {
    const fullProduct = allProducts[product._id];
    const isInCart = !!cart[product.name];

    if (isInCart) {
        updateCart(product.name, 0); // This will remove it
    } else if (fullProduct && fullProduct.availableFlavours && fullProduct.availableFlavours.length > 0) {
        setFlavourSelection({ product: fullProduct, isOpen: true });
    } else {
        updateCart(product.name, 1);
    }
  };
  
  const handleExplore = () => {
    setIsGlobalLoading(true);
    router.push('/');
  }

  if (!isWishlistLoaded || !areProductsLoaded) {
    return (
      <div className="flex flex-col flex-grow items-center justify-center h-full pt-24">
        <Loader />
      </div>
    );
  }

  const enhancedLikedProducts = likedProducts.map(p => ({
    ...p,
    isOutOfStock: allProducts[p._id]?.isOutOfStock ?? false,
  }));

  if (isMobile) {
    return (
       <div className="flex flex-col min-h-0 px-4 pt-4">
        {enhancedLikedProducts.length > 0 ? (
          <div className="bg-white/80 rounded-2xl flex flex-col h-full mb-20">
            <div className="flex justify-between items-center p-4 border-b border-black/10 flex-shrink-0">
              <p className="text-base font-bold text-black">Total Products: {enhancedLikedProducts.length}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 text-white rounded-full hover:bg-red-600/90 text-xs h-8 px-3 disabled:opacity-50"
                    disabled={enhancedLikedProducts.length === 0}
                  >
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently remove all items from your wishlist.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={clearWishlist}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="overflow-y-auto no-scrollbar">
              {enhancedLikedProducts.map((product, index) => (
                <WishlistItemCard 
                  key={product._id}
                  product={product}
                  onUnlike={() => handleUnlike(product)}
                  onAddToCart={() => onAddToCart(product)}
                  isInCart={!!cart[product.name]}
                  isUnliking={unlikingItems.includes(product._id)}
                  onAnimationEnd={() => {}}
                  isLastItem={index === enhancedLikedProducts.length - 1}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center h-full pt-20">
            <EmptyState
              imageUrl="/icons/empty.png"
              title="Find a Sweet Treat to Save!"
              description="Your wishlist is where you can store all your favorite chocolates and come back to them later."
              buttonText="Explore Now"
              onButtonClick={handleExplore}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="p-8 pb-0 text-white h-full flex flex-col relative">
      <h2 className="text-3xl font-normal font-poppins self-start mb-6">My Wishlist</h2>
      
      {enhancedLikedProducts.length > 0 ? (
        <>
          <div className="flex-grow overflow-y-auto pr-4 pb-8 space-y-2 no-scrollbar">
            {enhancedLikedProducts.map(product => (
              <WishlistItemCard 
                key={product._id}
                product={product}
                onUnlike={() => handleUnlike(product)}
                onAddToCart={() => onAddToCart(product)}
                isInCart={!!cart[product.name]}
                isUnliking={unlikingItems.includes(product._id)}
                onAnimationEnd={() => {}}
                isLastItem={false}
              />
            ))}
          </div>
          <div className="absolute bottom-8 right-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  size="icon"
                  className="bg-red-600 hover:bg-red-700 shadow-lg h-14 w-14 rounded-full"
                  disabled={enhancedLikedProducts.length === 0}
                >
                  <FaTrash className="h-6 w-6" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently remove all items from your wishlist.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearWishlist}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center">
            <EmptyState
              imageUrl="/icons/empty.png"
              title="Find a Sweet Treat to Save!"
              description="Your wishlist is where you can store all your favorite chocolates and come back to them later."
              buttonText="Explore Now"
              onButtonClick={handleExplore}
              showButton={false}
            />
        </div>
      )}
    </div>
  );
}
