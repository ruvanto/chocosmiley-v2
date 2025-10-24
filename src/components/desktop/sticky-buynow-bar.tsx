// @/components/desktop/sticky-buynow-bar.tsx
'use client';

import { Button } from '../ui/button';
import type { SanityProduct } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface StickyBuyNowBarProps {
    product: SanityProduct;
    onAddToCart: () => void;
    onRemoveFromCart: () => void;
    quantity: number;
    onToggleCartPopup?: () => void;
    onBuyNow?: () => void;
}

export function StickyBuyNowBar({ product, onAddToCart, onRemoveFromCart, quantity, onToggleCartPopup, onBuyNow }: StickyBuyNowBarProps) {

    const handleBuyNowClick = () => {
        if (onBuyNow) {
            onBuyNow();
        } else if (onToggleCartPopup) {
            if (quantity === 0) {
                onAddToCart();
            }
            onToggleCartPopup();
        }
    };

    const isOutOfStock = product.isOutOfStock;

    const discountPercentage = product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
    ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
    : null;
    
    return (
        <div className="absolute bottom-0 left-0 right-0 md:h-auto lg:h-auto xl:h-[15%] animate-slide-up-fade-in" style={{ animationDuration: '0.2s', animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="bg-custom-purple-dark h-full w-full md:rounded-t-xl lg:rounded-t-2xl xl:rounded-t-3xl flex items-center justify-between xl:pr-6">
                <div className="flex items-center justify-between lg:gap-4 text-white w-full px-4 py-3 md:p-3 lg:p-4">
                    
                    {/* Left Side: Price Info */}
                    <div className="flex items-center justify-start flex-shrink-0 w-1/3">
                        <div className="flex flex-col items-start">
                           <p className="text-xl md:text-2xl lg:text-3xl font-bold text-custom-gold">₹{product.discountedPrice || 0}</p>
                           <div className="flex md:flex-col xl:flex-row items-start xl:items-baseline md:gap-0 xl:gap-2">
                               {product.mrp && product.discountedPrice && product.mrp > product.discountedPrice && (
                                   <p className="text-sm md:text-base text-white/50 line-through">
                                       ₹{product.mrp}
                                   </p>
                               )}
                               {discountPercentage && (
                                   <p className="md:text-xs lg:text-sm font-semibold text-green-400">{discountPercentage}% OFF</p>
                               )}
                           </div>
                        </div>
                    </div>


                    {/* Center: Action Buttons */}
                    <div className="flex-grow flex items-center justify-center">
                         {isOutOfStock ? (
                            <Button
                                size="lg"
                                className="rounded-full font-semibold text-sm w-full bg-gray-500 text-white cursor-not-allowed"
                                disabled
                            >
                                Out of Stock
                            </Button>
                        ) : (
                            <div className="flex flex-col md:flex-col xl:flex-row items-center justify-center gap-2 w-full max-w-xs md:max-w-sm">
                                {quantity === 0 ? (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full rounded-full font-semibold text-sm border-white/50 text-custom-purple-dark bg-white hover:bg-white/20 hover:text-white"
                                        onClick={onAddToCart}
                                    >
                                        Add to Cart
                                    </Button>
                                ) : (
                                    <div className="flex items-center justify-center w-full rounded-full h-11 border-2 border-white/50 bg-white overflow-hidden">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={onRemoveFromCart}
                                            className="h-full rounded-none text-custom-purple-dark hover:text-custom-purple-dark hover:bg-black/10 flex-1"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <div className="flex-1 text-center text-custom-purple-dark h-full flex items-center justify-center">
                                            <span className="font-bold px-1 text-base">{quantity}</span>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={onAddToCart}
                                            className="h-full rounded-none text-custom-purple-dark hover:text-custom-purple-dark hover:bg-black/10 flex-1"
                                            disabled={quantity >= 99}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                <Button
                                    size="lg"
                                    onClick={handleBuyNowClick}
                                    className="w-full rounded-full font-semibold text-sm bg-custom-gold text-custom-purple-dark hover:bg-custom-gold/90"
                                >
                                    Buy Now
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}