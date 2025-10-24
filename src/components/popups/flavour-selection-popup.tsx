

// @/components/flavour-selection-popup.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { X, CheckCircle2 } from "lucide-react";
import type { SanityFlavour } from "@/types";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/app-context";

interface FlavourCardProps {
  flavour: SanityFlavour;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  pieces: number;
}

const FlavourCard = ({ flavour, isSelected, isDisabled, onSelect, pieces }: FlavourCardProps) => {
    const [isImageLoading, setIsImageLoading] = useState(true);
    
    return (
        <div
            onClick={() => !isDisabled && onSelect()}
            className={cn(
                "relative w-28 md:w-full aspect-square bg-black/20 rounded-2xl p-2 flex flex-col items-center justify-end transition-all duration-300 border-2 flex-shrink-0",
                isSelected ? 'border-custom-gold' : 'border-transparent',
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}
        >
            {isImageLoading && <div className="absolute inset-0 bg-black/30 animate-pulse rounded-xl" />}
            <Image
                src={flavour.imageUrl}
                alt={flavour.name}
                fill
                sizes="150px"
                className={cn(
                    "object-cover rounded-xl z-0 transition-opacity duration-300",
                    isImageLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                onDragStart={(e) => e.preventDefault()}
            />
            <div className="absolute top-1.5 left-1.5 z-10 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                 +₹{(flavour.price || 0).toFixed(0)}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-xl" />
            
            {isSelected && (
                <div className="absolute top-2 right-2 z-10 text-custom-gold">
                    <CheckCircle2 className="h-5 w-5" fill="hsl(var(--background))" />
                </div>
            )}

            <p className="relative z-10 text-white text-xs text-center font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.8)] leading-tight px-1">
                {flavour.name}
            </p>
             {isSelected && pieces > 0 && (
                <p className="relative z-10 text-custom-gold text-[10px] font-bold">
                    ({pieces} pcs)
                </p>
            )}
        </div>
    );
}

interface FlavourSelectionPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (productName: string, flavours: string[]) => void;
}

export function FlavourSelectionPopup({ open, onOpenChange, onConfirm }: FlavourSelectionPopupProps) {
  const { flavourSelection, flavourSelections, toggleFlavourSelection } = useAppContext();
  const product = flavourSelection.product;
  const { toast } = useToast();
  
  const selectedFlavourNames = (product && flavourSelections[product.name]) || [];
  const selectedCount = selectedFlavourNames.length;

  const chocolateDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    if (!product || !product.numberOfChocolates || selectedCount === 0) return distribution;
    
    const baseCount = Math.floor(product.numberOfChocolates / selectedCount);
    const remainder = product.numberOfChocolates % selectedCount;
    
    selectedFlavourNames.forEach((flavourName, index) => {
        distribution[flavourName] = baseCount + (index < remainder ? 1 : 0);
    });

    return distribution;
  }, [product, selectedFlavourNames, selectedCount]);


  const handleToggleFlavour = (flavourName: string) => {
    if (!product) return;

    const isCurrentlySelected = selectedFlavourNames.includes(flavourName);
    
    if (!isCurrentlySelected && selectedCount >= 3) {
      toast({
          title: "Maximum Flavour Limit",
          description: "You can select up to 3 flavours per box.",
          variant: "destructive",
      });
      return;
    }
    toggleFlavourSelection(product.name, flavourName);
  };

  if (!product) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(product.name, selectedFlavourNames);
    onOpenChange(false);
  };

  const availableFlavours = product.availableFlavours || [];
  const hasFlavours = availableFlavours.length > 0;

  const isMaxFlavoursReached = selectedCount >= 3;

  const selectedFlavoursWithDetails = availableFlavours
    .filter(f => selectedFlavourNames.includes(f.name))
    .map(f => {
        const pieces = chocolateDistribution[f.name] || 0;
        return {
            ...f,
            pieces,
            totalPrice: (f.price || 0) * pieces
        }
    });
  
  const additionalCost = selectedFlavoursWithDetails.reduce((acc, f) => acc + f.totalPrice, 0);
  const finalPrice = (product.discountedPrice || 0) + additionalCost;
  
  const chocolateCountText = product.numberOfChocolates
    ? `Contains ${product.numberOfChocolates} chocolate pieces`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="justify-center p-0 w-[90vw] md:w-full max-w-2xl bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px] flex flex-col">
        <DialogHeader className="p-4 text-center border-b border-white/20 flex-shrink-0">
          <DialogTitle className="text-white text-lg md:text-xl">Select Your Flavours</DialogTitle>
          <DialogClose className="absolute right-3 top-2 md:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar px-4 pt-4 md:px-6 md:pt-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image 
                  src={product.images?.[0] || '/placeholder.png'} 
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-cover rounded-lg"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-base font-bold text-white leading-tight">{product.name}</h3>
                  <p className="text-sm font-semibold text-white/80">
                    ₹{product.discountedPrice?.toFixed(2) || '0.00'}
                  </p>
                  {product.numberOfChocolates && product.numberOfChocolates > 0 && (
                    <p className="text-xs text-white/70">{chocolateCountText}</p>
                  )}
              </div>
            </div>
            
            {hasFlavours ? (
              <>
                <p className="text-xs text-center text-white/70 mb-3">You can select up to 3 flavours. The chocolates will be divided equally.</p>
                <div className={cn(
                  "pb-3",
                  "flex gap-3 overflow-x-auto no-scrollbar md:grid md:grid-cols-5 md:gap-4 md:overflow-visible"
                )}>
                  {availableFlavours.map((flavour) => {
                      const isSelected = selectedFlavourNames.includes(flavour.name);
                      return (
                        <FlavourCard
                            key={flavour._id}
                            flavour={flavour}
                            isSelected={isSelected}
                            isDisabled={!isSelected && isMaxFlavoursReached}
                            onSelect={() => handleToggleFlavour(flavour.name)}
                            pieces={chocolateDistribution[flavour.name] || 0}
                        />
                      );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center text-white/70 py-8">This product doesn't have customizable flavours. You can add it directly to your cart.</p>
            )}
        </div>
        <div className="p-4 md:px-6 md:pb-6 flex-shrink-0 border-t border-white/20 mt-4">
            {additionalCost > 0 && (
                <div className="text-sm mb-3 text-white/90 space-y-1">
                    <div className="flex justify-between">
                        <span>Product Price</span>
                        <span className="font-semibold">₹{product.discountedPrice?.toFixed(2)}</span>
                    </div>
                    {selectedFlavoursWithDetails.map(f => (
                       <div key={f._id} className="flex justify-between items-center text-white/80 text-xs">
                            <span className="w-2/5 truncate">+ {f.name}</span>
                            <span className="w-1/5 text-center text-[10px]">{f.pieces} pcs x ₹{(f.price || 0).toFixed(0)}</span>
                            <span className="font-semibold w-2/5 text-right">+₹{(f.totalPrice).toFixed(2)}</span>

                        </div>
                    ))}
                    <Separator className="bg-white/20 !my-2" />
                    <div className="flex justify-between text-base font-bold text-custom-gold">
                        <span>Total Price</span>
                        <span>₹{finalPrice.toFixed(2)}</span>
                    </div>
                </div>
            )}
             
            <div className="flex items-center justify-center gap-4">
                <DialogClose asChild>
                    <Button 
                        variant="outline"
                        className="w-full sm:w-auto bg-transparent text-base text-white border-white/50 rounded-full px-8 hover:bg-white/10 hover:text-white"
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <Button 
                    onClick={handleConfirm} 
                    className="w-full sm:w-auto bg-custom-gold text-base text-custom-purple-dark rounded-full px-8 hover:bg-custom-gold/90 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={hasFlavours && selectedCount === 0}
                >
                    Confirm
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
