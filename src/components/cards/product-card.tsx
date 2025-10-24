// @/components/product-card.tsx
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { useAppContext } from '@/context/app-context';
import Link from 'next/link';

interface ProductCardProps {
  product: SanityProduct;
  onAddToCart: (product: SanityProduct) => void;
  onRemoveFromCart: (product: SanityProduct) => void;
  quantity: number;
  onProductClick: (e: React.MouseEvent, product: SanityProduct) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onRemoveFromCart,
  quantity,
  onProductClick,
}: ProductCardProps) {
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
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
    if (!isLiked) {
      setIsAnimatingLike(true);
    }
  };

  const discountPercentage = product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
    ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
    : null;
    
  const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');

  return (
    <Link 
      href={`/product/${product.slug.current}`}
      onClick={(e) => onProductClick(e, product)}
      className="relative w-full h-full bg-white/90 active:bg-custom-gold md:hover:bg-custom-gold rounded-2xl overflow-hidden cursor-pointer group border border-custom-gold md:border-white md:hover:border-custom-gold transition-colors duration-300 flex flex-col shadow-lg"
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[5/4] overflow-hidden">
        {isImageLoading && <div className="absolute inset-0 bg-black/5 animate-pulse" />}
        <Image
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={cn(
            "group-hover:scale-105 transition-all duration-500",
            isImageLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{ objectFit: 'cover' }}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
          onDragStart={(e) => e.preventDefault()}
          priority
        />
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm lg:text-lg">Out of Stock</span>
          </div>
        )}
        <button 
          onClick={handleLikeClick} 
          className="absolute top-0 right-0 z-10 p-2 rounded-bl-lg text-white hover:text-red-500 transition-colors"
          aria-label="Like product"
        >
          <Heart 
            key={String(isLiked)}
            onAnimationEnd={() => setIsAnimatingLike(false)}
            className={cn(
              "h-4 w-4 md:h-5 md:w-5 transition-all",
              isLiked ? 'text-red-500 fill-red-500' : 'text-white',
              isAnimatingLike && 'animate-heart-pop'
            )} 
          />
        </button>

        {discountPercentage && (
          <div className="absolute top-2 left-2 bg-custom-gold text-custom-purple-dark px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold z-10">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="flex flex-col p-2 xl:p-3 text-black flex-grow">
        <h3 className="font-bold text-xs md:text-sm lg:text-base leading-tight truncate">{product.name}</h3>
        <p className="text-[10px] md:text-xs text-black/70 mt-0.5 truncate">{subtitle}</p>
        
        <div className="flex-grow"></div>

        {/* Price & Buttons */}
        <div className="mt-2">
          {/* Mobile Layout */}
           <div className="xl:hidden">
            <div className="flex flex-col items-start gap-2">
              {product.discountedPrice !== undefined && (
                <div className="flex flex-col items-start">
                    {product.mrp && product.discountedPrice && product.mrp > product.discountedPrice && (
                        <p className="text-[10px] text-black/70 line-through">
                            ₹{product.mrp.toFixed(2)}
                        </p>
                    )}
                    <p className="font-bold text-sm text-custom-purple-dark -mt-1">
                        ₹{product.discountedPrice.toFixed(2)}
                    </p>
                </div>
              )}
              <div className="w-full">
                {product.isOutOfStock ? (
                  <Button
                    size="sm"
                    disabled
                    className="w-full h-7 rounded-xl bg-gray-400 text-white cursor-not-allowed text-xs"
                  >
                    OUT OF STOCK
                  </Button>
                ) : !isClient ? (
                  <Button
                    size="sm"
                    className="w-full h-7 rounded-xl bg-custom-purple-dark text-white hover:bg-custom-purple-dark/90 text-xs"
                    aria-label="Add to cart"
                  >
                    ADD
                  </Button>
                ) : quantity > 0 ? (
                   <div className="flex items-center justify-center h-7 w-full rounded-xl bg-custom-purple-dark text-white overflow-hidden">
                      <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-full rounded-none flex-1 hover:bg-black/20 text-white hover:text-white"><Minus className="w-4 h-4" /></Button>
                      <span className="font-bold text-sm flex-1 text-center bg-white text-custom-purple-dark">{quantity}</span>
                      <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-full rounded-none flex-1 hover:bg-black/20 text-white hover:text-white" disabled={quantity >= 99}><Plus className="w-4 h-4" /></Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleAddToCartClick}
                    className="w-full h-7 rounded-xl bg-custom-purple-dark text-white hover:bg-custom-purple-dark/90 text-xs"
                    aria-label="Add to cart"
                  >
                    ADD
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden xl:flex justify-between items-center">
            <div className="flex flex-col">
              {product.mrp && product.discountedPrice && product.mrp > product.discountedPrice && <p className="text-xs text-black/70 line-through">₹{product.mrp.toFixed(2)}</p>}
              {product.discountedPrice !== undefined && <p className="font-bold text-lg text-custom-purple-dark -mt-1">₹{product.discountedPrice.toFixed(2)}</p>}
            </div>
            <div className="flex-shrink-0">
              {product.isOutOfStock ? (
                  <Button
                    size="sm"
                    disabled
                    className="h-9 rounded-full bg-gray-400 text-white cursor-not-allowed px-3 text-xs"
                  >
                    OUT OF STOCK
                  </Button>
              ) : !isClient ? (
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-full bg-custom-purple-dark text-white hover:bg-custom-purple-dark/90"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
              ) : quantity > 0 ? (
                <div className="flex items-center justify-center h-9 w-28 rounded-full bg-custom-purple-dark text-white overflow-hidden">
                  <Button variant="ghost" size="icon" onClick={handleDecrement} className="h-full rounded-none flex-1 hover:bg-black/20 text-white hover:text-white"><Minus className="w-4 h-4" /></Button>
                  <span className="font-bold text-lg flex-1 text-center bg-white text-custom-purple-dark">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={handleIncrement} className="h-full rounded-none flex-1 hover:bg-black/20 text-white hover:text-white" disabled={quantity >= 99}><Plus className="w-4 h-4" /></Button>
                </div>
              ) : (
                 <Button
                    size="icon"
                    onClick={handleAddToCartClick}
                    className="h-9 w-9 rounded-full bg-custom-purple-dark text-white hover:bg-custom-purple-dark/90"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
