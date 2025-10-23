

// @/components/mobile-cart-item-card.tsx
'use client';

import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { CartItem } from '@/context/app-context';
import type { SanityProduct, SanityFlavour } from '@/types';
import { useState, useMemo } from 'react';
import { Separator } from './ui/separator';
import { AnimatedNumber } from './ui/animated-number';
import Link from 'next/link';

interface MobileCartItemCardProps {
    item: CartItem;
    product: SanityProduct;
    onQuantityChange: (productName: string, newQuantity: number) => void;
    onRemove: (productName: string) => void;
    isLastItem: boolean;
    onProductClick: () => void;
}

export function MobileCartItemCard({ item, product, onQuantityChange, onRemove, isLastItem, onProductClick }: MobileCartItemCardProps) {
    const [isFlavourSheetOpen, setIsFlavourSheetOpen] = useState(false);
    
    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(item.name);
    }
    
    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuantityChange(item.name, item.quantity + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.quantity > 1) {
            onQuantityChange(item.name, item.quantity - 1);
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        if (!isFlavourSheetOpen) {
            if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                e.preventDefault();
                onProductClick();
            }
        }
    }
    
    const subtitle = [product.weight, product.composition, product.packageType].filter(Boolean).join(' | ');
    const discountPercentage = product.mrp && product.discountedPrice && product.mrp > product.discountedPrice
    ? Math.round(((product.mrp - product.discountedPrice) / product.mrp) * 100)
    : null;

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

    const sortedFlavoursForDisplay = useMemo(() => 
        (item.flavours && availableFlavoursMap)
        ? [...item.flavours].sort((a, b) => {
            const priceA = availableFlavoursMap[a]?.price || 0;
            const priceB = availableFlavoursMap[b]?.price || 0;
            return priceB - priceA;
        })
        : [],
    [item.flavours, availableFlavoursMap]);

    const chocolateCountText = product.numberOfChocolates
    ? `Contains ${product.numberOfChocolates} chocolate pieces`
    : null;

    return (
        <div
            className={cn(
                "w-full bg-transparent p-3 text-black relative transition-all duration-300 overflow-hidden block",
                !isLastItem && "border-b border-black/10"
            )}
        >
            <div className="flex gap-3">
                {/* Left Column: Image and Quantity Stepper */}
                <div className="w-1/4 flex-shrink-0 flex flex-col items-center gap-2">
                    <Link href={`/product/${product.slug.current}`} onClick={handleImageClick} className="cursor-pointer w-full">
                      <Image
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="rounded-lg object-cover w-full aspect-square"
                          data-ai-hint="chocolate box"
                          onDragStart={(e) => e.preventDefault()}
                      />
                    </Link>
                    <div className="flex items-center justify-between w-full max-w-[100px] rounded-full text-black h-8 bg-gray-200 overflow-hidden">
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
                    {/* Top part: Title and Delete Icon */}
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-base leading-tight flex-1 truncate">{item.name}</h3>
                            <button onClick={handleRemove} className="text-black/80 hover:text-red-500 transition-colors flex-shrink-0">
                                <FaTrash size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-black/80 truncate mt-0">{subtitle}</p>
                    </div>

                    {/* Flavours Button */}
                    {sortedFlavoursForDisplay.length > 0 ? (
                        <Sheet open={isFlavourSheetOpen} onOpenChange={setIsFlavourSheetOpen}>
                            <SheetTrigger asChild>
                            <Button variant="ghost" className="h-auto p-2 mt-1 text-custom-purple-dark text-xs rounded-lg hover:text-custom-purple-dark hover:bg-black/5 self-start" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFlavourSheetOpen(true); }}>
                                <span>Selected Flavours</span>
                                <ChevronDown className="h-4 w-4 text-custom-purple-dark" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent 
                                side="bottom" 
                                className="bg-custom-purple-dark text-white border-t-2 border-custom-gold rounded-t-3xl h-auto p-0"
                            >
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
                    ) : chocolateCountText ? (
                        <div className="mt-2 text-xs text-black/60">
                            {chocolateCountText}
                        </div>
                    ) : null}

                    {/* Bottom part: Price and Discount */}
                    <div className="flex items-end justify-between mt-auto">
                        <div className="flex items-baseline gap-2">
                        {product.mrp && <p className="text-xs line-through text-black/70 font-semibold">₹{product.mrp.toFixed(2)}</p>}
                        {discountPercentage && (
                        <div className="flex items-center gap-1 text-black bg-green-400 px-1.5 py-0.5 rounded-md">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h12z"/></svg>
                            <span className="text-xs font-semibold">{discountPercentage}%</span>
                        </div>
                        )}
                        </div>
                        <AnimatedNumber value={itemPrice} prefix="₹" className="text-base font-bold text-black" />
                    </div>
                </div>
            </div>
        </div>
    );
}
