// @/components/order-confirmed-item-card.tsx
'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { OrderItem } from '@/types';
import { Separator } from './ui/separator';

interface OrderConfirmedItemCardProps {
    item: OrderItem;
    isMobile: boolean;
}

export function OrderConfirmedItemCard({ item, isMobile }: OrderConfirmedItemCardProps) {
  const pricePerItem = item.finalProductPrice && item.quantity > 0 ? item.finalProductPrice / item.quantity : 0;
  const itemMrp = item.mrp ?? pricePerItem;
  const itemDiscount = (itemMrp * item.quantity) - (item.finalProductPrice ?? 0);

  const itemFlavourCost = (item.finalSubtotal || 0) - (item.finalProductPrice || 0);
  
  const chocolateCountText = item.numberOfChocolates
    ? `Contains ${item.numberOfChocolates} chocolate pieces`
    : null;

  const cardContent = (
    <>
      <div className={cn("flex items-start gap-3")}>
        <div className={cn("flex-shrink-0 relative", isMobile ? "w-16 h-16" : "w-20 h-20")}>
          <Image
            src={item.coverImage || "/placeholder.png"}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 20vw, 10vw"
            className="rounded-md object-cover"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        <div className="flex-grow min-w-0">
          <h4 className={cn("font-bold", isMobile ? "text-sm" : "text-base")}>{item.name}</h4>
          <p className={cn("text-black/70", isMobile ? "text-xs" : "text-sm")}>
            {`₹${pricePerItem.toFixed(2)} x ${item.quantity}`}
          </p>
          {itemDiscount > 0 && (
            <p className={cn("text-green-600 font-medium", isMobile ? "text-xs" : "text-sm")}>
              You saved ₹{itemDiscount.toFixed(2)}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn("font-bold", isMobile ? "text-sm" : "text-base")}>₹{(item.finalProductPrice ?? 0).toFixed(2)}</p>
        </div>
      </div>

      {item.flavours && item.flavours.length > 0 && (
        <>
          <Separator className="bg-black/10 my-2" />
          
          <div className="pl-2">
            {chocolateCountText && (
                <p className={cn("text-black/80 my-1", isMobile ? "text-xs" : "text-sm")}>{chocolateCountText}</p>
            )}
            <p className={cn("font-semibold text-black/80 my-1", isMobile ? "text-xs" : "text-sm")}>Flavours Selected:</p>
            <ul className="space-y-0.5">
              {item.flavours.map((flavour, idx) => {
                    const selectedFlavoursCount = item.flavours?.length || 0;
                    if (!item.numberOfChocolates || selectedFlavoursCount === 0) return null;

                    const baseCount = Math.floor(item.numberOfChocolates / selectedFlavoursCount);
                    const remainder = item.numberOfChocolates % selectedFlavoursCount;
                    const pieces = baseCount + (idx < remainder ? 1 : 0);
                    const flavourTotal = flavour.price * pieces;

                    return (
                      <li key={flavour.name} className={cn("flex justify-between items-center text-black/70", isMobile ? "text-xs" : "text-sm")}>
                        <span className="w-2/5 truncate">{flavour.name}</span>
                        <span className="w-1/5 text-center text-black/60 text-[10px]">{pieces} pcs x ₹{flavour.price}</span>
                        <span className="w-2/5 font-semibold text-right">+₹{flavourTotal.toFixed(2)}</span>
                      </li>
                    );
              })}
            </ul>
          </div>
        </>
      )}
    </>
  );

  return (
    <div 
      className={cn("bg-gray-100 w-full flex flex-col text-black hover:bg-white/80 rounded-lg p-3 transition-colors")}
    >
      {cardContent}
    </div>
  );
}
