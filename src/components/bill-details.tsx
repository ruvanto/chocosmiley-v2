
// @/components/bill-details.tsx
'use client';

import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import type { Cart } from '@/context/app-context';
import type { SanityProduct, Order } from '@/types';
import { AnimatedNumber } from './ui/animated-number';

interface BillDetailsProps {
  order: Order | null;
  cart?: Cart;
  allProducts?: SanityProduct[];
  showTotalPayable?: boolean;
}

const SummaryRow = ({ label, value, isBold = false, valueClassName, isAnimated = false, prefix, isTotalPayable = false }: { label: React.ReactNode, value: number, isBold?: boolean, valueClassName?: string, isAnimated?: boolean, prefix?: string, isTotalPayable?: boolean }) => (
    <div className={cn("flex justify-between items-center", isBold ? "font-bold text-base" : "text-sm")}>
        <span className={cn(isTotalPayable && "text-custom-gold")}>{label}</span>
        {isAnimated ? (
          <AnimatedNumber value={value} prefix={prefix} className={cn(valueClassName, isTotalPayable && "text-custom-gold")} />
        ) : (
          <span className={cn(valueClassName, isTotalPayable && "text-custom-gold")}>{value < 0 ? `-₹${Math.abs(value).toFixed(2)}` : `+₹${value.toFixed(2)}`}</span>
        )}
    </div>
);

export function BillDetails({ order, cart, allProducts, showTotalPayable = false }: BillDetailsProps) {
    if (!order && (!cart || !allProducts)) {
        return null; // Cannot compute without either an order or a cart
    }

    let totalMrp = 0;
    let totalProductPrice = 0;
    let totalFlavoursCost = 0;
    let subtotal = 0;
    let gstAmount = 0;
    let total = 0;
    let totalDiscount = 0;
    let itemsToDisplay: { name: string; quantity: number; numberOfChocolates?: number; flavours?: { name: string; price: number; }[] }[] = [];
    
    if (cart && allProducts) {
        // Calculation logic for cart view
        const productsByName = allProducts.reduce((acc, product) => {
            acc[product.name] = product;
            return acc;
        }, {} as Record<string, SanityProduct>);
        
        itemsToDisplay = Object.values(cart).map(item => {
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
                 return {
                    name: product.name,
                    quantity: item.quantity,
                    numberOfChocolates: product.numberOfChocolates,
                    flavours: product.availableFlavours?.filter(f => item.flavours?.includes(f.name))
                };
            }
            return null;
        }).filter(Boolean) as any;

        totalDiscount = totalMrp - totalProductPrice;
        subtotal = totalProductPrice + totalFlavoursCost;
        gstAmount = subtotal * 0.05;
        total = subtotal + gstAmount;

    } else if (order) {
        // Calculation logic for existing order view
        itemsToDisplay = order.items;
        totalMrp = order.items.reduce((acc, item) => acc + (item.mrp || 0) * item.quantity, 0);
        totalProductPrice = order.items.reduce((acc, item) => acc + (item.finalProductPrice || 0), 0);
        totalFlavoursCost = order.items.reduce((acc, item) => acc + ((item.finalSubtotal || 0) - (item.finalProductPrice || 0)), 0);
        subtotal = totalProductPrice + totalFlavoursCost;
        totalDiscount = order.totalDiscount || 0;
        total = order.total;
        gstAmount = total - subtotal;
    }


    return (
        <div className="space-y-1.5">
            <SummaryRow label="Total MRP" value={totalMrp} isAnimated={!!cart} prefix="₹"/>
            <SummaryRow label="Total Discount" value={totalDiscount} valueClassName={cn(order ? "text-green-400" : "text-green-600")} isAnimated={!!cart} prefix="-₹" />
            <Separator className="my-1.5 bg-black/10" />
            <SummaryRow label="Total Product Price" value={totalProductPrice} isAnimated={!!cart} prefix="₹"/>
            <div className={cn("flex justify-between items-start text-sm", order ? "text-white/80" : "text-black/80")}>
                <span>Flavours &amp; Fillings:</span>
                {cart ? (
                     <AnimatedNumber value={totalFlavoursCost} prefix="+₹" />
                ) : (
                    <span className="font-medium">+₹{totalFlavoursCost.toFixed(2)}</span>
                )}
            </div>

            {totalFlavoursCost > 0 && (
                <div className={cn("pl-4 text-xs space-y-1", order ? "text-white/70" : "text-black/60")}>
                    {itemsToDisplay.map(item => {
                        const selectedFlavoursCount = item.flavours?.length || 0;
                        if (!item.numberOfChocolates || selectedFlavoursCount === 0) return null;

                        const baseCount = Math.floor(item.numberOfChocolates / selectedFlavoursCount);
                        const remainder = item.numberOfChocolates % selectedFlavoursCount;
                        
                        const sortedFlavours = item.flavours?.map(f => f.name).sort() || [];
                         const distribution: Record<string, number> = {};
                        sortedFlavours.forEach((name, index) => {
                            distribution[name] = baseCount + (index < remainder ? 1 : 0);
                        });

                         return item.flavours?.map((flavour) => {
                             const pieces = distribution[flavour.name] || 0;
                             if (flavour.price > 0 && pieces > 0) {
                                 const flavourTotal = flavour.price * pieces * item.quantity;
                                 return (
                                     <div key={`${item.name}-${flavour.name}`} className="flex justify-between items-center">
                                         <span>{item.quantity}x {flavour.name} ({pieces} pcs)</span>
                                         <span>+₹{flavourTotal.toFixed(2)}</span>
                                     </div>
                                 );
                             }
                             return null;
                         });
                    })}
                </div>
            )}
            
            <Separator className="my-1.5 bg-black/10" />
            <SummaryRow label="Subtotal" value={subtotal} isBold isAnimated={!!cart} prefix="₹" />
            <SummaryRow label={<>GST <span className={cn("font-normal", order ? "text-white/60" : "text-black/60")}>(5%)</span></>} value={gstAmount} isAnimated={!!cart} prefix="+₹" />

            {showTotalPayable && (
                <>
                    <div className="my-2 h-[1.5px] border-t border-black/20" ></div>
                    <SummaryRow label="Total Payable" value={total} isBold={true} isAnimated={!!cart} prefix="₹" isTotalPayable={true} />
                </>
            )}
        </div>
    );
}

