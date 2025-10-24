// @/components/order-summary.tsx
'use client';

import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import type { Cart } from '@/context/app-context';
import type { SanityProduct } from '@/types';
import { Button } from './ui/button';
import React from 'react';
import { AnimatedNumber } from './ui/animated-number';
import { ScrollArea } from './ui/scroll-area';
import { BillDetails } from './bill-details';

interface OrderSummaryProps {
  cart: Cart;
  allProducts: SanityProduct[];
  isMobile?: boolean;
  onFinalizeOrder?: () => void;
  isLoading?: boolean;
}

const SummaryItem = ({ product, quantity, isMobile = false }: { product: SanityProduct, quantity: number, isMobile?: boolean }) => {
  const price = product?.discountedPrice || 0;
  return (
    <div className={cn("bg-transparent w-full flex items-center justify-between text-black", isMobile ? "p-0" : "p-1")}>
        <div className="flex flex-col items-start gap-1 min-w-0">
            <h4 className={cn("font-medium truncate", isMobile ? "text-xs" : "text-sm")}>{product.name}</h4>
            <p className={cn("font-medium text-gray-600", isMobile ? "text-[10px]" : "text-xs")}>x{quantity}</p>
        </div>
        <div>
            <p className={cn("font-bold", isMobile ? "text-sm" : "text-base")}>₹{(price * quantity).toFixed(2)}</p>
        </div>
    </div>
  );
}

export const OrderSummary = React.forwardRef<HTMLDivElement, OrderSummaryProps>(
  ({ cart, allProducts, isMobile, onFinalizeOrder, isLoading }, ref) => {
    const cartItems = Object.values(cart);
    const productsByName = allProducts.reduce((acc, product) => {
      acc[product.name] = product;
      return acc;
    }, {} as Record<string, SanityProduct>);

    if (cartItems.length === 0 || allProducts.length === 0) {
      if (isMobile) return null;
      return (
          <div className="bg-white/10 text-white rounded-2xl p-6 h-full flex items-center justify-center border border-white/20">
              <p className="text-center text-white/70">Your order summary will appear here.</p>
          </div>
      );
    }
    
    const itemsWithPrices = cartItems.map(item => {
        const product = productsByName[item.name];
        if (!product) return null;
        return { ...item };
    }).filter(item => item !== null);
    
    let totalProductPrice = 0;
    let totalFlavoursCost = 0;

    Object.values(cart).forEach(item => {
        const product = productsByName[item.name];
        if (product) {
            totalProductPrice += (product.discountedPrice || 0) * item.quantity;
            
            const selectedFlavoursCount = item.flavours?.length || 0;
            if (selectedFlavoursCount > 0 && product.numberOfChocolates) {
                const baseCount = Math.floor(product.numberOfChocolates / selectedFlavoursCount);
                const remainder = product.numberOfChocolates % selectedFlavoursCount;
                
                let itemFlavourCost = 0;
                (item.flavours || []).forEach((flavourName, index) => {
                    const flavour = product.availableFlavours?.find(f => f.name === flavourName);
                    const pieces = baseCount + (index < remainder ? 1 : 0);
                    itemFlavourCost += (flavour?.price || 0) * pieces;
                });
                totalFlavoursCost += itemFlavourCost * item.quantity;
            }
        }
    });

    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstAmount = subtotal * 0.05;
    const total = subtotal + gstAmount;

    const summaryClasses = isMobile 
      ? "mt-6 bg-white/80 rounded-2xl p-4 shadow-lg text-black" 
      : "bg-white/80 text-black rounded-2xl p-4 flex flex-col border border-gray-200 h-full";
      
    const headerClasses = isMobile ? "font-bold text-lg text-center text-black mb-4" : "font-bold text-lg text-center mb-2 flex-shrink-0";
    
    const finalizeButtonClasses = isMobile 
      ? "w-full mt-4 bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-10 text-base rounded-full"
      : "rounded-full font-bold md:text-sm lg:text-base bg-custom-gold text-custom-purple-dark md:h-9 md:px-5 xl:h-12 lg:px-8 hover:bg-custom-gold/90";
    
    if (isMobile) {
        return (
          <div ref={ref} className={summaryClasses}>
            <h3 className={headerClasses}>Order Summary</h3>

            <div className="space-y-2 mb-4 p-2 rounded-lg max-h-32 overflow-y-auto bg-white/30 custom-scrollbar pr-2">
                {itemsWithPrices.map((item, index) => {
                    const product = productsByName[item!.name];
                    if (!product) return null;
                    return (
                        <React.Fragment key={item!.name}>
                            <SummaryItem
                                product={product}
                                quantity={item!.quantity}
                                isMobile={!!isMobile}
                            />
                            {index < itemsWithPrices.length - 1 && <Separator className="bg-black/10 my-1" />}
                        </React.Fragment>
                    );
                })}
            </div>
              
            <div>
                <BillDetails cart={cart} allProducts={allProducts} showTotalPayable={true} />

                {onFinalizeOrder && (
                  <Button onClick={onFinalizeOrder} className={finalizeButtonClasses} isLoading={isLoading}>
                      Finalize Order
                  </Button>
                )}
            </div>
          </div>
        )
    }

    return (
      <div ref={ref} className={cn(summaryClasses, "flex flex-col")}>
        <h3 className={headerClasses}>Order Summary</h3>

        <div className="flex-grow min-h-0 mb-4">
          <ScrollArea className="h-full custom-scrollbar">
              <div className="space-y-2 p-2 rounded-lg bg-white/30">
                  {itemsWithPrices.map((item, index) => {
                      const product = productsByName[item!.name];
                      if (!product) return null;
                      return (
                          <React.Fragment key={item!.name}>
                              <SummaryItem
                                  product={product}
                                  quantity={item!.quantity}
                                  isMobile={!!isMobile}
                              />
                              {index < itemsWithPrices.length - 1 && <Separator className="bg-black/10 my-1" />}
                          </React.Fragment>
                      );
                  })}
              </div>
          </ScrollArea>
        </div>
          
        <div className="flex-shrink-0">
            <BillDetails cart={cart} allProducts={allProducts} showTotalPayable={false} />

            {onFinalizeOrder && (
              <>
                <Separator className="bg-black/10 my-4 flex-shrink-0" />
                <div className="flex-shrink-0 md:flex">
                    <div className="flex items-center justify-between text-black w-full">
                        <div>
                            <p className="md:text-xs lg:text-sm text-black/80">Total Payable</p>
                            <AnimatedNumber value={total} prefix="₹" className="md:text-lg lg:text-2xl font-bold" />
                        </div>
                      
                        <Button
                            onClick={onFinalizeOrder}
                            size="lg"
                            className={finalizeButtonClasses}
                            disabled={Object.keys(cart).length === 0}
                            isLoading={isLoading}
                        >
                            Finalize Order
                        </Button>
                    </div>
                </div>
              </>
            )}
        </div>
      </div>
    );
  }
);
OrderSummary.displayName = 'OrderSummary';
