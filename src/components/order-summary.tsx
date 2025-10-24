// @/components/order-summary.tsx
'use client';

import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import type { CartItem, SanityProduct } from '@/types';
import { Button } from './ui/button';
import React from 'react';
import { AnimatedNumber } from './ui/animated-number';
import { ScrollArea } from './ui/scroll-area';

interface OrderSummaryProps {
  cart: Record<string, CartItem>;
  allProducts: SanityProduct[];
  isMobile?: boolean;
  onFinalizeOrder?: () => void;
  isLoading?: boolean;
}

const SummaryRow = ({ label, value, isBold = false, valueClassName, isAnimated = false, prefix }: { label: React.ReactNode, value: number, isBold?: boolean, valueClassName?: string, isAnimated?: boolean, prefix?: string }) => (
    <div className={cn("flex justify-between items-center text-sm", isBold ? "font-bold text-base" : "text-black/80")}>
        <span>{label}</span>
        {isAnimated ? (
          <AnimatedNumber value={value} prefix={prefix} className={valueClassName} />
        ) : (
          <span className={cn(valueClassName)}>{value < 0 ? `-₹${Math.abs(value).toFixed(2)}` : `+₹${value.toFixed(2)}`}</span>
        )}
    </div>
);

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
    
    let totalMrp = 0;
    let totalProductPrice = 0;
    let totalFlavoursCost = 0;

    const itemsWithPrices = cartItems.map(item => {
        const product = productsByName[item.name];
        if (!product) return null;

        const itemProductPrice = (product.discountedPrice || 0) * item.quantity;
        totalProductPrice += itemProductPrice;
        totalMrp += (product.mrp || product.discountedPrice || 0) * item.quantity;
        
        let itemFlavourCost = 0;
        const selectedFlavoursCount = item.flavours?.length || 0;
        if (selectedFlavoursCount > 0 && product.numberOfChocolates) {
            const flavourPieces: { [key: string]: number } = {};
            const baseCount = Math.floor(product.numberOfChocolates / selectedFlavoursCount);
            const remainder = product.numberOfChocolates % selectedFlavoursCount;

            (item.flavours || []).forEach((flavourName, index) => {
                flavourPieces[flavourName] = baseCount + (index < remainder ? 1 : 0);
            });

            item.flavours?.forEach(flavourName => {
                const flavour = product.availableFlavours?.find(f => f.name === flavourName);
                if (flavour) {
                    itemFlavourCost += (flavour.price || 0) * (flavourPieces[flavourName] || 0);
                }
            });
            itemFlavourCost *= item.quantity;
        }
        totalFlavoursCost += itemFlavourCost;

        return { ...item, totalPrice: itemProductPrice + itemFlavourCost };
    }).filter(item => item !== null);
    
    const totalDiscount = totalMrp > totalProductPrice ? totalMrp - totalProductPrice : 0;
    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstRate = 0.05;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;

    const summaryClasses = isMobile 
      ? "mt-6 bg-white/80 rounded-2xl p-4 shadow-lg text-black" 
      : "bg-white/80 text-black rounded-2xl p-4 flex flex-col border border-gray-200 h-full";
      
    const headerClasses = isMobile ? "font-bold text-lg text-center text-black mb-4" : "font-bold text-lg text-center mb-2 flex-shrink-0";
    const itemsListContainerClasses = isMobile ? "space-y-2 mb-4 p-2 rounded-lg max-h-32 overflow-y-auto bg-white/30 custom-scrollbar pr-2" : "space-y-2 mb-2 p-2 rounded-lg flex-grow min-h-0 bg-white/30";
    const scrollAreaClasses = isMobile ? "" : "custom-scrollbar pr-2";
    const finalizeButtonClasses = isMobile 
      ? "w-full mt-4 bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-10 text-base rounded-full"
      : "rounded-full font-bold md:text-sm lg:text-base bg-custom-gold text-custom-purple-dark md:h-9 md:px-5 xl:h-12 lg:px-8 hover:bg-custom-gold/90";
    
    return (
      <div ref={ref} className={summaryClasses}>
        <h3 className={headerClasses}>Order Summary</h3>

        <div className={itemsListContainerClasses}>
            <ScrollArea className={scrollAreaClasses}>
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
            </ScrollArea>
        </div>
          
        <div className={cn(!isMobile && "flex-shrink-0")}>
            <div className="space-y-1.5">
              <SummaryRow label="Total MRP" value={totalMrp} isAnimated prefix="₹"/>
              <SummaryRow label="Total Discount" value={totalDiscount} valueClassName='text-green-600' isAnimated prefix="-₹" />
              <Separator className="bg-black/10 my-1.5" />
              <SummaryRow label="Total Product Price" value={totalProductPrice} isAnimated prefix="₹"/>
              <SummaryRow label="Flavours & Fillings" value={totalFlavoursCost} isAnimated prefix="+₹"/>
              <Separator className="bg-black/10 my-1.5" />
              <SummaryRow label="Subtotal" value={subtotal} isBold isAnimated prefix="₹" />
              <SummaryRow label={<>GST <span className="font-normal text-black/60">(5%)</span></>} value={gstAmount} isAnimated prefix="+₹" />
              <div className="border-t border-black/20 my-2 h-[1.5px]" ></div>
              <SummaryRow label="Total Payable" value={total} isBold={true} isAnimated prefix="₹" />
            </div>

            {onFinalizeOrder && (
              isMobile ? (
                  <Button onClick={onFinalizeOrder} className={finalizeButtonClasses} isLoading={isLoading}>
                      Finalize Order
                  </Button>
              ) : (
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
              )
            )}
        </div>
      </div>
    );
  }
);
OrderSummary.displayName = 'OrderSummary';
