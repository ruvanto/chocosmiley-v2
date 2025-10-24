
// @/components/bill-details.tsx
'use client';

import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';
import type { Cart } from '@/context/app-context';
import type { SanityProduct, Order, OrderItem } from '@/types';
import { AnimatedNumber } from './ui/animated-number';

interface BillDetailsProps {
  order?: Order | null;
  cart?: Cart;
  allProducts?: SanityProduct[];
  showTotalPayable?: boolean;
  variant?: 'light' | 'dark';
}

const SummaryRow = ({ label, value, isBold = false, valueClassName, isAnimated = false, prefix, isTotalPayable = false, variant = 'light' }: { label: React.ReactNode, value: number, isBold?: boolean, valueClassName?: string, isAnimated?: boolean, prefix?: string, isTotalPayable?: boolean, variant?: 'light' | 'dark' }) => {
    const textColor = variant === 'dark' ? 'text-white' : 'text-black';
    const totalPayableColor = variant === 'dark' ? 'text-custom-gold' : 'text-black';
    const finalColor = isTotalPayable ? totalPayableColor : textColor;

    return (
        <div className={cn("flex justify-between items-center", isBold ? "font-bold text-base" : "text-sm", finalColor)}>
            <span>{label}</span>
            {isAnimated ? (
              <AnimatedNumber value={value} prefix={prefix} className={cn(valueClassName)} />
            ) : (
              <span className={cn(valueClassName)}>{prefix}{value.toFixed(2)}</span>
            )}
        </div>
    );
};

export function BillDetails({ order, cart, allProducts, showTotalPayable = false, variant = 'light' }: BillDetailsProps) {
    if (!order && (!cart || !allProducts)) {
        return null;
    }
    
    let totalMrp = 0;
    let totalProductPrice = 0;
    let totalFlavoursCost = 0;
    let subtotal = 0;
    let gstAmount = 0;
    let total = 0;
    let totalDiscount = 0;
    let itemsToDisplay: (OrderItem | { name: string; quantity: number; numberOfChocolates?: number; flavours?: { name: string; price: number; }[] })[] = [];
    
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
        }).filter(Boolean) as (OrderItem | { name: string; quantity: number; numberOfChocolates?: number; flavours?: { name: string; price: number; }[] })[];

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

    const separatorClass = variant === 'dark' ? "bg-white/20" : "bg-black/10";
    const subTextColor = variant === 'dark' ? "text-white/80" : "text-black/80";
    const lightTextColor = variant === 'dark' ? "text-white/60" : "text-black/60";
    const textColor = variant === 'dark' ? "text-white" : "text-black";
    const totalPayableColor = variant === 'dark' ? 'text-custom-gold' : 'text-black';

    return (
        <div className="space-y-1.5">
            <SummaryRow label="Total MRP" value={totalMrp} isAnimated={!!cart} prefix="₹" variant={variant} valueClassName={textColor}/>
            <SummaryRow label="Total Discount" value={totalDiscount} valueClassName="text-green-600" isAnimated={!!cart} prefix="-₹" variant={variant} />
            <Separator className={cn("my-1.5", separatorClass)} />
            <SummaryRow label="Total Product Price" value={totalProductPrice} isAnimated={!!cart} prefix="₹" variant={variant} valueClassName={textColor}/>
            <div className={cn("flex justify-between items-start text-sm", subTextColor)}>
                <span>Flavours &amp; Fillings:</span>
                {cart ? (
                     <AnimatedNumber value={totalFlavoursCost} prefix="+₹" className={subTextColor} />
                ) : (
                    <span className={cn("font-medium", subTextColor)}>+₹{totalFlavoursCost.toFixed(2)}</span>
                )}
            </div>

             {totalFlavoursCost > 0 && (
                <div className={cn("pl-4 text-xs space-y-1", lightTextColor)}>
                    {itemsToDisplay.map((item, itemIndex) => {
                        if (!item.flavours || item.flavours.length === 0) return null;

                        const selectedFlavoursCount = item.flavours.length;
                        const baseCount = item.numberOfChocolates ? Math.floor(item.numberOfChocolates / selectedFlavoursCount) : 0;
                        const remainder = item.numberOfChocolates ? item.numberOfChocolates % selectedFlavoursCount : 0;
                        
                        let originalFlavourOrder: string[] = [];
                        if (cart) {
                            originalFlavourOrder = Object.values(cart).find(ci => ci.name === item.name)?.flavours || [];
                        } else if (order) {
                            const orderItem = order.items.find(oi => oi.name === item.name);
                            originalFlavourOrder = orderItem?.flavours?.map(f => f.name) || [];
                        }

                        // Order flavors to match the distribution logic
                        const sortedItemFlavours = [...item.flavours].sort((a, b) => {
                            const indexA = originalFlavourOrder.indexOf(a.name);
                            const indexB = originalFlavourOrder.indexOf(b.name);
                            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;
                            return indexA - indexB;
                        });

                        return sortedItemFlavours.map((flavour, index) => {
                             if (flavour.price > 0) {
                                let pieces = baseCount + (index < remainder ? 1 : 0);
                                
                                const flavourTotal = flavour.price * pieces * item.quantity;

                                if (pieces > 0) {
                                    return (
                                        <div key={`${item.name}-${flavour.name}-${itemIndex}`} className="flex justify-between items-center">
                                            <span>{item.quantity}x {flavour.name} ({pieces} pcs)</span>
                                            <span>+₹{flavourTotal.toFixed(2)}</span>
                                        </div>
                                    );
                                }
                            }
                            return null;
                        });
                    })}
                </div>
            )}
            
            <Separator className={cn("my-1.5", separatorClass)} />
            <SummaryRow label={<>Subtotal</>} value={subtotal} isBold isAnimated={!!cart} prefix="₹" variant={variant} valueClassName={textColor} />
            <SummaryRow label={<span className={cn(subTextColor)}>GST (5%)</span>} value={gstAmount} isAnimated={!!cart} prefix="+₹" variant={variant} valueClassName={textColor} />

            {showTotalPayable && (
                <>
                    <div className={cn("my-2 h-[1.5px]", separatorClass)} ></div>
                    <SummaryRow label="Total Payable" value={total} isBold={true} isAnimated={!!cart} prefix="₹" variant={variant} valueClassName={totalPayableColor} isTotalPayable={true} />
                </>
            )}
        </div>
    );
}
