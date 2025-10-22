
// @/components/wishlist-item-card.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WishlistItem } from '@/types';
import Link from 'next/link';

interface WishlistItemCardProps {
  product: WishlistItem;
  onAddToCart: () => void;
  onUnlike: () => void;
  isInCart: boolean;
  isUnliking: boolean;
  onAnimationEnd: () => void;
  isLastItem: boolean;
  isMobile?: boolean;
}

export function WishlistItemCard({ product, onAddToCart, onUnlike, isInCart, isUnliking, onAnimationEnd, isMobile = false }: WishlistItemCardProps) {
  
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };
  
  const handleUnlikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUnlike();
  };

  const subtitle = product.subtitle;
  const isOutOfStock = product.isOutOfStock;

  if (isMobile) {
    return (
       <Link
        href={`/product/${product.slug.current}`}
        onAnimationEnd={onAnimationEnd}
        className={cn(
          "w-full bg-transparent p-3 text-black relative transition-all duration-300 overflow-hidden cursor-pointer block",
          isUnliking && 'animate-fade-out-slide-up',
        )}
      >
        <div className="flex gap-3 items-center">
          <div className="w-1/4 h-20 flex-shrink-0 relative">
            <Image
              src={product.coverImage || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 25vw, 10vw"
              className="rounded-lg object-cover"
              onDragStart={(e) => e.preventDefault()}
            />
          </div>

          <div className="flex flex-col justify-between flex-grow self-stretch min-w-0">
            <div>
              <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm leading-tight flex-1 truncate">{product.name}</h3>
                  <button onClick={handleUnlikeClick} className="flex-shrink-0">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  </button>
              </div>
              <p className="text-xs text-black/70 truncate">{subtitle}</p>
            </div>
            
            <div className="flex justify-between items-end gap-2">
                {product.discountedPrice && <p className="font-bold text-base text-custom-purple-dark mt-1 truncate">₹{product.discountedPrice}</p>}
                
                {isOutOfStock ? (
                  <Button
                    size="sm"
                    disabled
                    className="h-8 px-4 rounded-full bg-gray-400 text-white cursor-not-allowed text-xs"
                  >
                    OUT OF STOCK
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleAddToCartClick}
                    className={cn(
                      "rounded-full uppercase border-2 border-b-[3px] h-8 px-5 text-xs transition-colors duration-300 border-custom-purple-dark flex-shrink-0",
                      isInCart
                        ? 'bg-custom-purple-dark text-white'
                        : 'bg-transparent text-custom-purple-dark',
                      isInCart ? 'hover:bg-custom-purple-dark hover:text-white' : 'hover:bg-transparent hover:text-custom-purple-dark'
                    )}
                  >
                    {isInCart ? 'ADDED' : 'ADD'}
                  </Button>
                )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      href={`/product/${product.slug.current}`}
      onAnimationEnd={onAnimationEnd}
      className={cn(
        "bg-white/10 p-3 text-white w-full relative transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer block border border-white/20 hover:bg-white/20",
        isUnliking && 'animate-fade-out-slide-up',
      )}
    >
      <div className="flex gap-4 items-center">
        <div className="w-1/4 h-24 flex-shrink-0 relative">
          <Image
            src={product.coverImage || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 25vw, 15vw"
            className="rounded-lg object-cover"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>

        <div className="flex flex-col flex-grow self-stretch min-w-0">
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-lg leading-tight flex-1 truncate">{product.name}</h3>
                <button onClick={handleUnlikeClick} className="p-1 flex-shrink-0">
                  <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                </button>
            </div>
            <p className="text-sm text-white/70 truncate mt-1">{subtitle}</p>
            
            <div className="flex-grow"></div>

            <div className="flex justify-between items-end gap-2">
              {product.discountedPrice && <p className="font-bold text-xl text-custom-gold truncate">₹{product.discountedPrice}</p>}

              {isOutOfStock ? (
                <Button
                  size="sm"
                  disabled
                  className="h-9 px-4 rounded-full bg-gray-500 text-white cursor-not-allowed text-sm"
                >
                  OUT OF STOCK
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAddToCartClick}
                  className={cn(
                    "rounded-full uppercase h-9 px-6 text-sm transition-colors duration-300 flex-shrink-0",
                    isInCart
                      ? 'bg-custom-gold text-custom-purple-dark hover:bg-custom-gold/90'
                      : 'bg-transparent text-white border border-white hover:bg-white hover:text-custom-purple-dark'
                  )}
                >
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </Button>
              )}
            </div>
        </div>
      </div>
    </Link>
  );
}
