
// @/components/featured-product-card.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { useAppContext } from '@/context/app-context';

interface FeaturedProductCardProps {
  product: SanityProduct;
  onAddToCart: (product: SanityProduct) => void;
  onRemoveFromCart: (product: SanityProduct) => void;
  quantity: number;
  onProductClick: (product: SanityProduct) => void;
  priority?: boolean;
}

export function FeaturedProductCard({
  product,
  onAddToCart,
  onRemoveFromCart,
  quantity,
  onProductClick,
  priority = false,
}: FeaturedProductCardProps) {
  const [isClient, setIsClient] = useState(false);
  const { likedProducts, toggleLike } = useAppContext();
  const isLiked = isClient && likedProducts.some(p => p._id === product._id);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFromCart(product);
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(product, product._id);
  }

  const discountPercentage = product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
    ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
    : null;
    
  const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');

  return (
    <div
      onClick={() => onProductClick(product)}
      className="relative w-full h-full bg-black/20 rounded-2xl overflow-hidden cursor-pointer group border border-white/20 hover:border-custom-gold/50 transition-colors duration-300"
    >
      <div className="absolute inset-0">
        {isImageLoading && <div className="absolute inset-0 bg-black/30 animate-pulse" />}
        <Image
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className={cn(
            "object-cover group-hover:scale-105 transition-all duration-500",
            isImageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
          onDragStart={(e) => e.preventDefault()}
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      <button 
        onClick={handleLikeClick} 
        className="absolute top-2 right-2 z-10 rounded-full text-white hover:text-red-500 transition-colors"
        aria-label="Like product"
      >
        <Heart 
          className={cn(
            "h-4 w-4 md:h-5 md:w-5 transition-all",
            isLiked ? 'text-red-500 fill-red-500' : 'text-white'
          )} 
        />
      </button>

      {discountPercentage && (
        <div className="absolute top-2 left-2 bg-custom-gold text-custom-purple-dark px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold">
          {discountPercentage}% OFF
        </div>
      )}

      <div className="relative h-full flex flex-col justify-end p-3 md:p-4 text-white">
        <h3 className="font-bold text-xs md:text-base leading-tight truncate">{product.name}</h3>
        <p className="text-[10px] md:text-xs text-white/80 mt-0.5 truncate">{subtitle}</p>
        
        <div className="flex justify-between items-center mt-1">
          {product.discountedPrice && (
            <div className="flex flex-col">
              {product.mrp && <p className="text-[10px] md:text-xs text-white/70 line-through">₹{product.mrp}</p>}
              <p className="font-bold text-sm md:text-lg text-custom-gold -mt-1">₹{product.discountedPrice}</p>
            </div>
          )}
          
          <div className="flex-shrink-0 flex justify-end">
             {!isClient ? (
                  <Button
                    size="icon"
                    onClick={handleAddToCartClick}
                    className="h-7 w-7 md:h-9 md:w-9 rounded-full bg-white text-custom-purple-dark hover:bg-gray-200"
                    aria-label="Add to cart"
                    disabled={product.isOutOfStock}
                  >
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                ) : product.isOutOfStock ? (
                   <Button
                      size="sm"
                      disabled
                      className="h-7 md:h-9 rounded-full bg-gray-400 text-white cursor-not-allowed px-2 md:px-3 text-[10px] md:text-xs"
                    >
                      OUT OF STOCK
                    </Button>
                ) : quantity > 0 ? (
                  <div className="flex items-center justify-center h-6 md:h-7 w-[90%] md:w-full rounded-xl bg-white text-white overflow-hidden">
                      <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-full rounded-none flex-1 hover:bg-black/20 text-custom-purple-dark hover:text-white"><Minus className="w-4 h-4" /></Button>
                      <span className="font-bold text-sm flex-1 text-center text-custom-purple-dark bg-white">{quantity}</span>
                      <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-full rounded-none flex-1 hover:bg-black/20 text-custom-purple-dark hover:text-white" disabled={quantity >= 99}><Plus className="w-4 h-4" /></Button>
                    </div>
                ) : (
                  <Button
                    size="icon"
                    onClick={handleAddToCartClick}
                    className="h-7 w-7 md:h-9 md:w-9 rounded-full bg-white text-custom-purple-dark hover:bg-gray-200"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
