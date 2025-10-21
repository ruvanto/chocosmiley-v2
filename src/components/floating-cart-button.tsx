
// @/components/floating-cart-button.tsx
'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActiveView } from '@/types';

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
          "shadow-lg bg-custom-gold hover:bg-custom-gold/90 transition-all duration-300 ease-in-out flex items-center justify-center overflow-hidden w-14 h-14",
          isCartButtonExpanded && !isCartOpen ? 'w-64 h-14 rounded-full' : 'w-14 h-14 rounded-full'
        )}
        size="icon"
      >
        <div className={cn(
            "transition-transform duration-500 ease-in-out transform-gpu",
            isCartOpen && "rotate-180"
        )}>
          {isCartButtonExpanded && !isCartOpen ? (
            <span className="text-custom-purple-dark font-semibold whitespace-nowrap">{cartMessage}</span>
          ) : isCartOpen ? (
            <X className="h-8 w-8 text-custom-purple-dark" />
          ) : (
            <>
              <Image src="/icons/cart.png" alt="Cart" width={24} height={24} onDragStart={(e) => e.preventDefault()}/>
              {totalQuantity > 0 && (
                <div className="absolute -top-1 -right-1 bg-custom-purple-dark text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
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
