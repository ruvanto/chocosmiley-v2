
// @/components/mobile/mobile-product-sticky-bar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MobileProductStickyBarProps {
  product: SanityProduct;
  quantity: number;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onBuyNow: () => void;
}

export function MobileProductStickyBar({
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
}: MobileProductStickyBarProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const discountPercentage =
    product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
      ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
      : null;

  return (
    <div className={cn(
        "fixed bottom-16 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-t border-white/20 p-2 px-3 transition-transform duration-300 ease-out",
        isClient ? "translate-y-0" : "translate-y-full"
      )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {product.discountedPrice && (
            <div className="flex flex-col items-start">
              {product.mrp && product.mrp > product.discountedPrice && (
                <p className="text-xs text-white/70 line-through">
                  ₹{product.mrp.toFixed(2)}
                </p>
              )}
              <p className="font-bold text-base text-custom-gold -mt-1">
                ₹{product.discountedPrice.toFixed(2)}
              </p>
              {discountPercentage && (
                <p className="text-[10px] font-semibold text-green-400">
                  {discountPercentage}% OFF
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {product.isOutOfStock ? (
             <Button
                size="sm"
                disabled
                className="h-10 flex-1 rounded-full bg-gray-400 text-white cursor-not-allowed px-2 text-sm"
              >
                OUT OF STOCK
              </Button>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-center h-10 w-28 rounded-full bg-white text-custom-purple-dark overflow-hidden border-2 border-white/50">
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemoveFromCart}
                className="h-full rounded-none flex-1 hover:bg-gray-200 text-custom-purple-dark hover:text-custom-purple-dark"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-bold text-base flex-1 text-center bg-white text-custom-purple-dark">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAddToCart}
                className="h-full rounded-none flex-1 hover:bg-gray-200 text-custom-purple-dark hover:text-custom-purple-dark"
                disabled={quantity >= 99}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onAddToCart}
              className="h-10 flex-1 rounded-full bg-white text-custom-purple-dark text-sm font-bold gap-1 hover:bg-white/90"
            >
              Add to Cart
            </Button>
          )}

          <Button
            onClick={onBuyNow}
            className="h-10 flex-1 rounded-full bg-custom-gold text-custom-purple-dark font-bold text-sm"
            disabled={product.isOutOfStock}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
