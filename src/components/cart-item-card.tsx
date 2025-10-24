
// @/components/cart-item-card.tsx
'use client';

import Image from 'next/image';
import { Plus, Minus, ChevronDown, Trash } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { SanityProduct, SanityFlavour } from '@/types';
import { useState, useMemo } from 'react';
import { AnimatedNumber } from './ui/animated-number';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from './ui/separator';

interface CartItemCardProps {
    item: { name: string; quantity: number; flavours?: string[] };
    product: SanityProduct;
    onQuantityChange: (productName: string, quantity: number, flavours?: string[]) => void;
    onRemove: (productName: string) => void;
    onProductClick: (product: SanityProduct) => void;
    isMobile: boolean;
    isLastItem?: boolean;
}

export function CartItemCard({ item, product, onQuantityChange, onRemove, onProductClick, isMobile, isLastItem = false }: CartItemCardProps) {
    const [isFlavourSheetOpen, setIsFlavourSheetOpen] = useState(false);

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuantityChange(item.name, item.quantity + 1, item.flavours);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuantityChange(item.name, Math.max(1, item.quantity - 1), item.flavours);
    };
    
    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(item.name);
    }
    
    const handleWrapperClick = (e: React.MouseEvent) => {
        // For desktop, let the Link component handle navigation
        // but call onProductClick to show loader etc.
        if (!isMobile) {
            e.preventDefault();
            onProductClick(product);
        }
    }

    const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');

    const availableFlavoursMap = useMemo(() => 
        product.availableFlavours?.reduce((acc, flavour) => {
            acc[flavour.name] = flavour;
            return acc;
        }, {} as Record<string, SanityFlavour>) || {},
    [product.availableFlavours]);

    const chocolateDistribution = useMemo(() => {
        const distribution: Record<string, number> = {};
        const selectedFlavours = item.flavours || [];
        const selectedCount = selectedFlavours.length;
        if (!product.numberOfChocolates || selectedCount === 0) return distribution;
        
        const baseCount = Math.floor(product.numberOfChocolates / selectedCount);
        const remainder = product.numberOfChocolates % selectedCount;

        selectedFlavours.forEach((flavourName, index) => {
            distribution[flavourName] = baseCount + (index < remainder ? 1 : 0);
        });
        
        return distribution;
    }, [item.flavours, product.numberOfChocolates]);


    const totalFlavourPrice = useMemo(() => {
        const selectedFlavours = item.flavours || [];
        if (selectedFlavours.length === 0) return 0;
        
        return selectedFlavours.reduce((acc, flavourName) => {
            const flavourDetails = availableFlavoursMap[flavourName];
            const pieces = chocolateDistribution[flavourName] || 0;
            const price = flavourDetails?.price || 0;
            return acc + (price * pieces);
        }, 0);
    }, [item.flavours, availableFlavoursMap, chocolateDistribution]);
        
    const itemPrice = ((product.discountedPrice || 0) + totalFlavourPrice) * item.quantity;
    const itemMrp = (product.mrp || product.discountedPrice || 0) * item.quantity;
    
    const sortedFlavoursForDisplay = useMemo(() => 
        (item.flavours && availableFlavoursMap)
        ? [...item.flavours].sort((a, b) => {
            const priceA = availableFlavoursMap[a]?.price || 0;
            const priceB = availableFlavoursMap[b]?.price || 0;
            return priceB - priceA;
        })
        : [],
    [item.flavours, availableFlavoursMap]);

    const discountPercentage = product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
    ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
    : null;
    
    const chocolateCountText = product.numberOfChocolates
    ? `Contains ${product.numberOfChocolates} chocolate pieces`
    : null;

    const desktopMotionVariants = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { 
        opacity: 0, 
        x: -50, 
        height: 0, 
        padding: 0, 
        margin: 0,
        transition: { duration: 0.3 }
      },
    };

    const Wrapper = isMobile ? 'div' : motion.li;
    const wrapperProps = isMobile 
        ? {} 
        : { layout: true, variants: desktopMotionVariants, initial: "initial", animate: "animate", exit: "exit" };

    return (
        <Wrapper {...wrapperProps}>
            <Link 
                href={`/product/${product.slug.current}`}
                onClick={handleWrapperClick}
                className={cn(
                    "w-full p-3 text-black relative transition-all duration-300 overflow-hidden block",
                    isMobile ? "bg-transparent" : "bg-white/80 rounded-2xl hover:bg-gray-50",
                    !isLastItem && isMobile && "border-b border-black/10"
                )}
            >
                <div className="flex gap-3">
                    {/* Left Column: Image and Quantity Stepper */}
                    <div className={cn("flex-shrink-0 flex flex-col items-center gap-2", isMobile ? 'w-1/4' : 'w-1/4')}>
                        <div className="cursor-pointer w-full aspect-square relative">
                          <Image
                              src={product.images?.[0] || "/placeholder.png"}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 25vw, 10vw"
                              className="rounded-lg object-cover w-full"
                              onDragStart={(e) => e.preventDefault()}
                          />
                        </div>
                        <div className={cn(
                            "flex items-center justify-between w-full rounded-full text-black h-8 overflow-hidden",
                            isMobile ? "bg-gray-200 max-w-[100px]" : "bg-gray-200"
                        )}>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleDecrement}
                                className="h-full rounded-none bg-gray-200 hover:bg-gray-300 text-black flex-1"
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-bold px-1 text-sm flex-1 text-center">{item.quantity}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleIncrement}
                                className="h-full rounded-none bg-gray-200 hover:bg-gray-300 text-black flex-1"
                                disabled={item.quantity >= 99}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col justify-between flex-grow self-stretch min-w-0">
                        <div>
                            <div className="flex justify-between items-start gap-2">
                                <h3 className={cn("font-bold leading-tight flex-1 truncate", isMobile ? "text-base" : "md:text-base xl:text-lg")}>{item.name}</h3>
                                <button onClick={handleRemove} className="text-black/80 hover:text-red-500 transition-colors flex-shrink-0">
                                    <Trash size={isMobile ? 18 : 16} />
                                </button>
                            </div>
                            <p className={cn("text-black/80 truncate mt-0", isMobile ? "text-xs" : "md:text-xs xl:text-sm")}>{subtitle}</p>
                        </div>

                        {sortedFlavoursForDisplay.length > 0 ? (
                            isMobile ? (
                                <Sheet open={isFlavourSheetOpen} onOpenChange={setIsFlavourSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" className="h-auto p-2 mt-1 text-custom-purple-dark text-xs rounded-lg hover:text-custom-purple-dark hover:bg-black/5 self-start" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFlavourSheetOpen(true); }}>
                                            <span>Selected Flavours</span>
                                            <ChevronDown className="h-4 w-4 text-custom-purple-dark" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="bg-custom-purple-dark text-white border-t-2 border-custom-gold rounded-t-3xl h-auto p-0">
                                        <SheetHeader className="p-4 border-b border-white/20">
                                          <SheetTitle className="text-white">Selected Flavours & Fillings</SheetTitle>
                                        </SheetHeader>
                                        {chocolateCountText && <p className='text-center text-sm text-white/80 pt-4'>{chocolateCountText}</p>}
                                        <div className="p-4 flex flex-wrap justify-center gap-3">
                                          {sortedFlavoursForDisplay.map((flavourName, index) => {
                                              const flavourDetails = availableFlavoursMap?.[flavourName];
                                              const price = flavourDetails?.price ?? 0;
                                              const pieces = chocolateDistribution[flavourName] || 0;
                                              const flavourTotal = pieces * price;
                                              return (
                                                <div key={index} className="bg-white/10 rounded-lg p-3 text-center w-28 flex flex-col items-center">
                                                  <p className="font-semibold text-sm leading-tight h-10 flex items-center justify-center">{flavourName}</p>
                                                  <Separator className="bg-white/20 my-1"/>
                                                  <p className="text-xs text-white/80">{pieces} pcs x ₹{price.toFixed(0)}</p>
                                                  <p className="font-bold text-custom-gold text-sm">+₹{flavourTotal.toFixed(2)}</p>
                                                </div>
                                              )
                                          })}
                                        </div>
                                        <p className="text-xs text-center text-white/70 pb-4">
                                            *Additional charges may apply for special flavours*
                                        </p>
                                    </SheetContent>
                                </Sheet>
                            ) : (
                               <div className="mt-1 mb-2 md:text-[10px] lg:text-xs xl:text-sm">
                                 <div className="bg-white/30 p-2 rounded-md">
                                   <p className="font-semibold text-xs mb-1">Selected Flavours:</p>
                                   <ul className="space-y-0.5">
                                    {sortedFlavoursForDisplay.map((flavourName, index) => {
                                        const flavourDetails = availableFlavoursMap?.[flavourName];
                                        const price = flavourDetails?.price ?? 0;
                                        const pieces = chocolateDistribution[flavourName] || 0;
                                        const flavourTotal = pieces * price;
                                        return (
                                        <li key={index} className="flex justify-between items-center text-black/80 text-xs">
                                            <span className="w-2/5 truncate">{flavourName}</span>
                                            <span className="w-1/5 text-center text-black/60 text-[10px]">{`${pieces} pcs x ₹${price.toFixed(0)}`}</span>
                                            <span className="w-2/5 font-semibold text-right">+₹{flavourTotal.toFixed(2)}</span>
                                        </li>
                                        );
                                    })}
                                   </ul>
                                 </div>
                               </div>
                            )
                        ) : (
                            chocolateCountText && <div className={cn("mt-1 text-black/60", isMobile ? "text-xs" : "md:text-[10px] lg:text-xs")}>{chocolateCountText}</div>
                        )}
                        
                        <div className="flex items-end justify-between mt-auto">
                            <div className="flex items-baseline gap-2">
                                {product.mrp && <p className={cn("line-through text-black/70 font-semibold", isMobile ? "text-xs" : "md:text-xs lg:text-sm")}>₹{itemMrp.toFixed(2)}</p>}
                                {discountPercentage && (
                                    <div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-md", isMobile ? "text-black bg-green-400" : "text-white bg-green-600/80")}>
                                        <svg className={cn("h-3 w-3", isMobile ? "md:h-3 md:w-3" : "lg:h-4 lg:w-4")} viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h12z"/></svg>
                                        <span className={cn("font-semibold", isMobile ? "text-xs" : "md:text-xs lg:text-sm")}>{discountPercentage}%</span>
                                    </div>
                                )}
                            </div>
                            <AnimatedNumber value={itemPrice} prefix="₹" className={cn("font-bold text-black", isMobile ? "text-base" : "md:text-sm lg:text-lg xl:text-xl")} />
                        </div>
                    </div>
                </div>
            </Link>
        </Wrapper>
    );
}
