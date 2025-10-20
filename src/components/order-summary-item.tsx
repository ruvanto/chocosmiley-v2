// @/components/order-summary-item.tsx
'use client';

import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';

interface OrderSummaryItemProps {
    product: SanityProduct;
    quantity: number;
    isMobile?: boolean;
    onClick?: () => void;
}

export function OrderSummaryItem({ product, quantity, isMobile = false, onClick }: OrderSummaryItemProps) {
  const price = product?.discountedPrice || 0;
  return (
    <div 
      className={cn("bg-transparent w-full flex items-center justify-between text-black", onClick && "cursor-pointer", isMobile ? "p-0" : "p-1")}
      onClick={onClick}
    >
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
