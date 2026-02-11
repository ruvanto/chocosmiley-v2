
// @/components/floating-cart-button.tsx
'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActiveView } from '@/types';
import { RiShoppingBasketFill } from "react-icons/ri";

interface FloatingCartButtonProps {
  activeView: ActiveView;
  isCartOpen: boolean;
  isProfileOpen: boolean;
  onToggleCart: () => void;
  isCartButtonExpanded: boolean;
  cartMessage: string;
  cart: Record<string, { name: string; quantity: number; flavours?: string[] }>;
}

export function FloatingCartButton({
  activeView,
  isCartOpen,
  onToggleCart,
  isCartButtonExpanded,
  cartMessage,
  cart,
}: FloatingCartButtonProps) {

  const totalQuantity = Object.values(cart).reduce((acc, cur) => acc + cur.quantity, 0);

  const shouldShow = activeView === 'home' || activeView === 'search' || activeView === 'product-detail' || activeView === 'order-confirmed';

  if (!shouldShow) return null;

  return (
    <div className={cn("fixed bottom-8 right-4 z-[60] transition-all duration-300")}>
      <Button
        onClick={onToggleCart}
        className={cn(
          "shadow-lg bg-custom-gold hover:bg-custom-gold/90 transition-all duration-300 ease-in-out flex items-center justify-center",
          isCartButtonExpanded && !isCartOpen ? 'w-80 h-14 rounded-full' : 'w-14 h-14 rounded-full'
        )}
        size="icon"
      >
        <div className={cn(
            "relative transition-transform duration-500 ease-in-out transform-gpu"
,
            isCartOpen && "scale-x-[-1]"
        )}>
          {isCartButtonExpanded && !isCartOpen ? (
            <span className="text-custom-purple-dark font-semibold whitespace-nowrap">{cartMessage}</span>
          ) : isCartOpen ? (
            <X style={{ width: '20px', height: '20px' }} className="text-custom-purple-dark" />
          ) : (
            <>
              <RiShoppingBasketFill style={{ width: '32px', height: '32px' }} className="text-custom-purple-dark"/>
              {totalQuantity > 0 && (
                <div className="absolute -top-1 right-0 bg-custom-purple-dark text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalQuantity}
                </div>
              )}
            </>
          )}
        </div>
      </Button>
    </div>
  );
}