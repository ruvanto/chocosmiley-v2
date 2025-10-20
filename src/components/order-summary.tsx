
// @/components/order-summary.tsx
'use client';

import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { Button } from './ui/button';
import { OrderSummaryItem } from './order-summary-item';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AnimatedNumber } from './ui/animated-number';

interface OrderSummaryProps {
  cart: Record<string, { name: string; quantity: number; flavours?: string[] }>;
  allProducts: SanityProduct[];
  onFinalizeOrder: () => void;
  isLoading: boolean;
}


const SummaryRow = ({ label, value, isBold = false, valueClassName, isAnimated = false }: { label: React.ReactNode, value: number, isBold?: boolean, valueClassName?: string, isAnimated?: boolean }) => (
    <div className={cn("flex justify-between items-center text-sm", isBold ? "font-bold text-base" : "text-black/80")}>
        <span>{label}</span>
        {isAnimated ? (
          <AnimatedNumber value={value} prefix={value < 0 ? "-₹" : "₹"} className={valueClassName} />
        ) : (
          <span className={cn(valueClassName)}>{value < 0 ? `-₹${Math.abs(value).toFixed(2)}` : `₹${value.toFixed(2)}`}</span>
        )}
    </div>
);

export function OrderSummary({ cart, allProducts, onFinalizeOrder, isLoading }: OrderSummaryProps) {
  const cartItems = Object.values(cart);
  const router = useRouter();
  const productsByName = allProducts.reduce((acc, product) => {
    acc[product.name] = product;
    return acc;
  }, {} as Record<string, SanityProduct>);


  if (cartItems.length === 0) {
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

  return (
    <div className="bg-white/80 text-black rounded-2xl p-4 flex flex-col border border-gray-200 h-full">
        <h3 className="font-bold text-lg text-center mb-2 flex-shrink-0">Order Summary</h3>
        
        <div className="space-y-2 mb-2 p-2 rounded-lg flex-grow min-h-0 overflow-y-auto bg-white/30 custom-scrollbar pr-2">
            {itemsWithPrices.map((item, index) => {
                const product = productsByName[item!.name];
                if (!product) return null;
                return (
                    <React.Fragment key={item!.name}>
                        <OrderSummaryItem
                            product={product}
                            quantity={item!.quantity}
                            onClick={() => router.push(`/product/${product.slug.current}`)}
                        />
                        {index < itemsWithPrices.length - 1 && <Separator className="bg-black/10 my-1" />}
                    </React.Fragment>
                );
            })}
        </div>

        <div className="flex-shrink-0">
          <div className="space-y-1.5 pt-2">
            <SummaryRow label="Total MRP" value={totalMrp} isAnimated />
            <SummaryRow label="Total Discount" value={-totalDiscount} valueClassName='text-green-600' isAnimated />
            <Separator className="bg-black/10 my-1.5" />
            <SummaryRow label="Product Price" value={totalProductPrice} isAnimated />
            <SummaryRow label="Flavours & Fillings" value={totalFlavoursCost} isAnimated />
            <Separator className="bg-black/10 my-1.5" />
            <SummaryRow label="Subtotal" value={subtotal} isBold isAnimated />
            <SummaryRow label={<>GST <span className="font-normal text-black/60">(5%)</span></>} value={gstAmount} isAnimated />
          </div>
        
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
                    className="rounded-full font-bold md:text-sm lg:text-base bg-custom-gold text-custom-purple-dark md:h-9 md:px-5 xl:h-12 lg:px-8 hover:bg-custom-gold/90"
                    disabled={Object.keys(cart).length === 0}
                    isLoading={isLoading}
                >
                    Finalize Order
                </Button>
            </div>
          </div>
        </div>
    </div>
  );
}
