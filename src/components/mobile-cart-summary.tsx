
// @/components/mobile-cart-summary.tsx
'use client';

import * as React from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { Separator } from './ui/separator';
import { OrderSummaryItem } from './order-summary-item';
import { AnimatedNumber } from './ui/animated-number';

interface MobileCartSummaryProps {
  cart: Record<string, { name: string; quantity: number; flavours?: string[] }>;
  allProducts: SanityProduct[];
  onCheckout: () => void;
  isLoading: boolean;
}

const SummaryRow = ({ label, value, isBold = false, valueClassName, isAnimated = false, prefix }: { label: React.ReactNode, value: number, isBold?: boolean, valueClassName?: string, isAnimated?: boolean, prefix?: string }) => (
    <div className={cn("flex justify-between items-center text-sm", isBold ? "font-bold text-base text-black" : "text-black/80")}>
        <span>{label}</span>
        {isAnimated ? (
          <AnimatedNumber value={value} prefix={prefix} className={valueClassName} />
        ) : (
          <span className={cn(valueClassName)}>{value < 0 ? `-₹${Math.abs(value).toFixed(2)}` : `₹${value.toFixed(2)}`}</span>
        )}
    </div>
);

export const MobileCartSummary = React.forwardRef<HTMLDivElement, MobileCartSummaryProps>(
  ({ cart, allProducts, onCheckout, isLoading }, ref) => {
    const cartItems = Object.values(cart);
    const productsByName = allProducts.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, SanityProduct>);


    if (cartItems.length === 0 || allProducts.length === 0) {
        return null;
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

    
    const totalDiscount = totalMrp - totalProductPrice;
    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstRate = 0.05;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;

    return (
      <div ref={ref} className="mt-6 bg-white/80 rounded-2xl p-4 shadow-lg text-black">
          <h3 className="font-bold text-lg text-center text-black mb-4">Order Summary</h3>

          <div className="space-y-2 mb-4 p-2 rounded-lg max-h-32 overflow-y-auto bg-white/30  custom-scrollbar pr-2">
            {itemsWithPrices.map((item, index) => {
                const product = productsByName[item!.name];
                if (!product) return null;
                return (
                    <React.Fragment key={item!.name}>
                        <OrderSummaryItem
                            product={product}
                            quantity={item!.quantity}
                            isMobile={true}
                        />
                        {index < itemsWithPrices.length - 1 && <Separator className="bg-black/10 my-1" />}
                    </React.Fragment>
                );
            })}
        </div>
          
          <div className="space-y-1.5">
              <SummaryRow label="Total MRP" value={totalMrp} isAnimated />
              <SummaryRow label="Total Discount" value={-totalDiscount} valueClassName='text-green-600' isAnimated />
              <Separator className="bg-black/10 my-1.5" />
              <SummaryRow label="Product Price" value={totalProductPrice} isAnimated />
              <SummaryRow label="Flavours & Fillings" value={totalFlavoursCost} isAnimated prefix="+"/>
              <Separator className="bg-black/10 my-1.5" />
              <SummaryRow label="Subtotal" value={subtotal} isBold isAnimated />
              <SummaryRow label={<>GST <span className="font-normal text-black/60">(5%)</span></>} value={gstAmount} isAnimated />
              <div className="border-t border-black/20 my-2 h-[1.5px]" ></div>
              <SummaryRow label="Total Payable" value={total} isBold={true} isAnimated />
          </div>

          <Button onClick={onCheckout} className="w-full mt-4 bg-custom-gold text-custom-purple-dark font-bold hover:bg-custom-gold/90 h-10 text-base rounded-full" isLoading={isLoading}>
              Finalize Order
          </Button>
      </div>
    );
  }
);
MobileCartSummary.displayName = 'MobileCartSummary';
