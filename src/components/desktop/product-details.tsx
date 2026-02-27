// @/components/product-details.tsx
'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { PortableText, PortableTextComponents } from '@portabletext/react';

interface ProductDetailsProps {
    product: SanityProduct;
    isLiked: boolean;
    onLikeToggle: () => void;
    isMobile?: boolean;
}


export function ProductDetails({ product, isLiked, onLikeToggle, isMobile = false }: ProductDetailsProps) {
    const [likeClickCount, setLikeClickCount] = useState(0);

    const handleLikeClick = () => {
        setLikeClickCount(prev => prev + 1);
        onLikeToggle();
    };
    
    const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');

    const customComponents: PortableTextComponents = {
        list: {
          // For bulleted lists
          bullet: ({ children }) => <ul className="list-disc space-y-1">{children}</ul>,
        },
        listItem: {
          // For each item in the list
          bullet: ({ children }) => <li className={cn(isMobile ? "text-xs" : "text-sm")}>{children}</li>,
        },
      };

    const chocolateCountText = product.numberOfChocolates
        ? `Contains ${product.numberOfChocolates} chocolate pieces`
        : null;

    return (
        <div className={cn("flex flex-col gap-4 h-full text-black")}>
            {/* Title and Like button */}
            <div className="flex justify-between items-start">
                <h1 className={cn("font-bold font-plex-sans-condensed", isMobile ? "text-2xl" : "text-3xl")}>{product.name}</h1>
                <div className="relative">
                    <button onClick={handleLikeClick} className="p-1">
                        <Heart 
                            key={likeClickCount}
                            className={cn(
                                "h-7 w-7 stroke-current transition-colors duration-300", 
                                isLiked ? 'text-red-500 fill-red-500' : 'text-black',
                                'animate-heart-pop'
                            )} 
                        />
                    </button>
                </div>
            </div>

            {/* FSSAI Logo and details */}
            <div className="flex flex-col gap-1 -mt-4 font-poppins font-normal">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                        <rect x="1" y="1" width="22" height="22" rx="0" stroke="#13811c" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="7" fill="#13811c"/>
                    </svg>
                  </div>
                  <p className={cn("font-normal font-poppins", isMobile ? "text-sm" : "text-base")}>{subtitle}</p>
              </div>
              {chocolateCountText && (
                  <p className={cn("font-normal font-poppins text-black/80", isMobile ? "text-xs" : "text-sm")}>{chocolateCountText}</p>
              )}
            </div>
            
            {product.isOutOfStock && (
                <p className="text-red-400 font-semibold text-base -mt-2">
                    This product is currently out of stock
                </p>
            )}

            {/* Best for */}
            {product.bestFor && (
                <div>
                    <p className={cn("font-semibold font-plex-sans-condensed", isMobile ? "text-sm" : "text-base")}>
                        <span className="font-semibold">Best for:</span> {product.bestFor}
                    </p>
                </div>
            )}

            {/* Product Description */}
            {product.description && (
                <div>
                    <div className={cn("font-medium font-plex-sans", isMobile ? "text-sm" : "text-base")}>
                       <PortableText value={product.description} />
                    </div>
                </div>
            )}

            {/* Ingredients */}
            {product.ingredients && (
            <div className="font-plex-sans-condensed text-base">
                <span className="font-semibold">Ingredients:</span>
                <PortableText value={product.ingredients} components={customComponents} />
            </div>
            )}
            
            {/* Allergen Alert */}
            {product.allergenAlert && (
                <div className={cn("font-semibold text-black font-plex-sans", isMobile ? "text-xs " : "text-sm")}>
                    <p>Allergen Alert:</p>
                    <div className="prose prose-sm list-disc list-inside pt-1 pl-5">
                        <PortableText value={product.allergenAlert} components={customComponents} />
                    </div>
                </div>
            )}
        </div>
    );
}
