

// @/components/order-confirmed-summary.tsx
'use client';

import { cn } from '@/lib/utils';
import type { Order, OrderItem, SanityProduct } from '@/types';
import { Separator } from './ui/separator';
import { OrderConfirmedItemCard } from './order-confirmed-item-card';

interface OrderConfirmedSummaryProps {
    order: Order;
    products: SanityProduct[];
    isMobile: boolean;
}

const SummaryRow = ({ label, value, valueClass }: { label: string, value: string, valueClass?: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-black/70">{label}</span>
        <span className={cn("font-medium text-black", valueClass)}>{value}</span>
    </div>
);


export function OrderConfirmedSummary({ order, products, isMobile }: OrderConfirmedSummaryProps) {
    const productsByName = products.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, SanityProduct>);
    
    const totalMrp = order.items.reduce((acc, item) => {
        const itemMrp = item.mrp || 0;
        return acc + (itemMrp * item.quantity);
    }, 0);

    const totalDiscount = order.totalDiscount || 0;

    const totalProductPrice = order.items.reduce((acc, item) => {
        return acc + (item.finalProductPrice || 0);
    }, 0);
    
    const totalFlavoursCost = order.items.reduce((acc, item) => {
        return acc + ((item.finalSubtotal || 0) - (item.finalProductPrice || 0));
    }, 0);
    
    const subtotal = totalProductPrice + totalFlavoursCost;
    const gstAmount = order.total - subtotal;
    const totalPayable = order.total;
    

    return (
        <div className="bg-white w-full rounded-2xl md:rounded-3xl text-black p-4 md:p-6 flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg md:text-xl text-black">Your Order Summary</h3>
            </div>
            <Separator className="bg-black/10 my-2 md:my-3" />

            {/* Items List */}
            <div className="min-h-0 space-y-2">
                {order.items.map((item: OrderItem) => {
                   const product = productsByName[item.name];
                   if (!product) return null;
                   return (
                    <OrderConfirmedItemCard
                        key={item.name}
                        item={item}
                        isMobile={isMobile}
                    />
                )})}
            </div>

            <Separator className="bg-black/10 my-2 md:my-3" />
            
            {/* Financial Breakdown */}
            <div className="space-y-1.5 flex-shrink-0">
                <SummaryRow label="Total MRP" value={`₹${totalMrp.toFixed(2)}`} />
                <SummaryRow label="Total Discount" value={`- ₹${totalDiscount.toFixed(2)}`} valueClass="text-green-600" />
                <Separator className="bg-black/20 my-2" />
                <SummaryRow label="Product Price" value={`₹${totalProductPrice.toFixed(2)}`} />
                <div className="flex justify-between items-start">
                    <span className="text-sm text-black/70">Flavours & Fillings</span>
                    <span className="text-sm font-medium text-black">+₹{totalFlavoursCost.toFixed(2)}</span>
                </div>
                 {totalFlavoursCost > 0 && (
                    <div className="pl-4 text-xs space-y-1 text-black/60">
                        {order.items.map(item => {
                             const selectedFlavoursCount = item.flavours?.length || 0;
                             if (!item.numberOfChocolates || selectedFlavoursCount === 0) return null;

                             const baseCount = Math.floor(item.numberOfChocolates / selectedFlavoursCount);
                             const remainder = item.numberOfChocolates % selectedFlavoursCount;
                             
                             const distribution: Record<string, number> = {};
                             const itemFlavourNames = item.flavours?.map(f => f.name) || [];
                             
                             itemFlavourNames.forEach((name, index) => {
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
                <Separator className="bg-black/20 my-2" />
                <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
                <SummaryRow label={`GST (${order.gstPercentage}%)`} value={`+ ₹${gstAmount.toFixed(2)}`} />
                <Separator className="bg-black/20 my-2" />
                <div className="flex justify-between items-center text-custom-purple-dark text-base md:text-lg font-bold">
                    <span>Total Payable</span>
                    <span>₹{totalPayable.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
