// @/components/bill-details.tsx
'use client';

import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import type { Cart } from '@/context/app-context';
import type { SanityProduct } from '@/types';
import { AnimatedNumber } from './ui/animated-number';

interface BillDetailsProps {
  cart: Cart;
  allProducts: SanityProduct[];
  showTotalPayable?: boolean;
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

export function BillDetails({ cart, allProducts, showTotalPayable = false }: BillDetailsProps) {
    const productsByName = allProducts.reduce((acc, product) => {
      acc[product.name] = product;
      return acc;
    }, {} as Record<string, SanityProduct>);
    
    let totalMrp = 0;
    let totalProductPrice = 0;
    let totalFlavoursCost = 0;

    Object.values(cart).forEach(item => {
        const product = productsByName[item.name];
        if (product) {
            totalMrp += (product.mrp || product.discountedPrice || 0) * item.quantity;
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
    
    const totalDiscount = totalMrp - totalProductPrice;
    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstRate = 0.05;
    const gstAmount = subtotal * gstRate;
    const total = subtotal + gstAmount;

    return (
        <div className="space-y-1.5">
            <SummaryRow label="Total MRP" value={totalMrp} isAnimated prefix="₹"/>
            <SummaryRow label="Total Discount" value={totalDiscount} valueClassName='text-green-600' isAnimated prefix="-₹" />
            <Separator className="bg-black/10 my-1.5" />
            <SummaryRow label="Total Product Price" value={totalProductPrice} isAnimated prefix="₹"/>
            <SummaryRow label="Flavours & Fillings" value={totalFlavoursCost} isAnimated prefix="+₹"/>
            <Separator className="bg-black/10 my-1.5" />
            <SummaryRow label="Subtotal" value={subtotal} isBold isAnimated prefix="₹" />
            <SummaryRow label={<>GST <span className="font-normal text-black/60">(5%)</span></>} value={gstAmount} isAnimated prefix="+₹" />

            {showTotalPayable && (
                <>
                    <div className="border-t border-black/20 my-2 h-[1.5px]" ></div>
                    <SummaryRow label="Total Payable" value={total} isBold={true} isAnimated prefix="₹" />
                </>
            )}
        </div>
    );
}
