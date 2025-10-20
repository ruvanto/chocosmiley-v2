

// @/components/product-info-card.tsx
'use client';

import type { SanityProduct } from '@/types';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { FlavoursSection } from './flavours-section';
import { Separator } from './ui/separator';
import { PortableText, PortableTextComponents } from '@portabletext/react';

type Cart = Record<string, {
  name: string;
  quantity: number;
  flavours?: string[];
}>;

interface ProductInfoCardProps {
    product: SanityProduct;
    isLiked: boolean;
    onLikeToggle: (productId: string) => void;
}

const SpecItem = ({ icon, text }: { icon: React.ReactNode, text: string | undefined }) => {
    if (!text) return null;
    return (
        <div className="flex items-center gap-2">
            <div className="text-custom-gold">{icon}</div>
            <span className="text-sm text-white/90">{text}</span>
        </div>
    );
};
const DetailSection = ({ title, children, isMobile }: { title: string, children: React.ReactNode, isMobile?: boolean }) => {
    if (!children) return null;
    return (
        <div>
            <h3 className={cn("font-bold font-plex-sans-condensed mb-1", isMobile ? "text-base" : "text-lg")}>{title}</h3>
            <div className={cn("font-medium font-plex-sans text-white/90", isMobile ? "text-sm" : "text-base")}>
                {children}
            </div>
        </div>
    );
};

export function ProductInfoCard({ product, isLiked, onLikeToggle }: ProductInfoCardProps) {
    
    const discountPercentage = product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
    ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
    : null;

    const handleLikeClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLikeToggle(product._id);
    };

    const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');

    const customComponents: PortableTextComponents = {
        list: {
          bullet: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
        },
        listItem: {
          bullet: ({ children }) => <li className="text-sm">{children}</li>,
        },
      };

    const chocolateCountText = product.numberOfChocolates
        ? `Contains ${product.numberOfChocolates} chocolate pieces`
        : null;

    return (
        <div className="bg-white/20 rounded-2xl p-4 mx-4 relative z-10">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                    <h1 className="text-2xl font-bold text-white font-plex-sans flex-1">{product.name}</h1>
                    <button onClick={handleLikeClick} className="p-1 flex-shrink-0">
                         <Heart 
                            className={cn(
                                "h-6 w-6 stroke-current transition-colors duration-300", 
                                isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                            )} 
                        />
                    </button>
                </div>

                 <div className="flex flex-col gap-1 -mt-2 font-poppins font-normal">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                              <rect x="1" y="1" width="22" height="22" rx="0" stroke="#13811c" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="7" fill="#13811c"/>
                          </svg>
                        </div>
                        <p className="font-normal font-poppins text-sm text-white/80">{subtitle}</p>
                    </div>
                    {chocolateCountText && (
                        <p className="font-normal font-poppins text-xs text-white/70">{chocolateCountText}</p>
                    )}
                 </div>
                
                <div className="flex items-baseline gap-2">
                    {product.discountedPrice && (
                        <p className="text-xl font-bold text-custom-gold">₹{product.discountedPrice}</p>
                    )}
                    {product.mrp && product.mrp > (product.discountedPrice || 0) && (
                        <p className="text-base text-white/50 line-through">₹{product.mrp}</p>
                    )}
                    {discountPercentage && (
                        <p className="text-sm font-semibold text-green-400">{discountPercentage}% OFF</p>
                    )}
                </div>

                {product.isOutOfStock && (
                  <p className="text-red-400 font-semibold text-sm -mt-2">
                    This product is currently out of stock
                  </p>
                )}
                
                <div className='mx-0 '>
                    <FlavoursSection
                        product={product}
                        isMobile={true}
                    />
                </div>

                <Separator className="bg-white/20 my-1" />

                <div className={cn("flex flex-col gap-3 text-white")}>

                    <DetailSection title="Best For" isMobile={true}>
                        {product.bestFor}
                    </DetailSection>

                    <Separator className="bg-white/20" />
                
                    <DetailSection title="Description" isMobile={true}>
                        {product.description && <PortableText value={product.description} components={customComponents} />}
                    </DetailSection>
        
                    <Separator className="bg-white/20" />
        
                    <DetailSection title="Ingredients" isMobile={true}>
                        {product.ingredients && <p>{product.ingredients}</p>}
                    </DetailSection>
        
                    <Separator className="bg-white/20" />
                    
                    <DetailSection title="Allergen Alert" isMobile={true}>
                        {product.allergenAlert && <PortableText value={product.allergenAlert} components={customComponents} />}
                    </DetailSection>
                </div>
            </div>
        </div>
    );
}
