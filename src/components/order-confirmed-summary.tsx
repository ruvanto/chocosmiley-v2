// @/components/order-confirmed-summary.tsx
'use client';

import type { Order, SanityProduct } from '@/types';
import { Separator } from './ui/separator';
import { OrderDetailsItemCard } from './cards/order-details-item-card';
import { BillDetails } from './bill-details';

interface OrderConfirmedSummaryProps {
    order: Order;
    products: SanityProduct[];
    isMobile: boolean;
}

export function OrderConfirmedSummary({ order, products, isMobile }: OrderConfirmedSummaryProps) {
    const productsByName = products.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, SanityProduct>);
    
    return (
        <div className="bg-white w-full rounded-2xl md:rounded-3xl text-black p-4 md:p-6 flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <h3 className="font-bold text-lg md:text-xl text-black">Your Order Summary</h3>
            </div>
            <Separator className="bg-black/10 my-2 md:my-3" />

            {/* Items List */}
            <div className="min-h-0 space-y-2">
                {order.items.map((item) => {
                   const product = productsByName[item.name];
                   if (!product) return null;
                   return (
                    <OrderDetailsItemCard
                        key={item.name}
                        item={item}
                        isMobile={isMobile}
                    />
                )})}
            </div>

            <Separator className="bg-black/10 my-2 md:my-3" />
            
            <div className="flex-shrink-0">
              <BillDetails order={order} showTotalPayable={true} variant="light" />
            </div>
        </div>
    );
}
