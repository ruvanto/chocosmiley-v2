// @/components/bottom-navbar.tsx
'use client';

import { House, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActiveView } from '@/types';
import { useState, useEffect } from 'react';

interface BottomNavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  cartItemCount?: number;
}

const navItems = [
  { view: 'home', icon: House, label: 'Home' },
  { view: 'cart', icon: ShoppingCart, label: 'Cart' },
  { view: 'profile', icon: User, label: 'Account' },
] as const;

export function BottomNavbar({ activeView, onNavigate, cartItemCount = 0 }: BottomNavbarProps) {
  const [clientCartCount, setClientCartCount] = useState(0);

  useEffect(() => {
    // On the client, we update the state to match the prop.
    // This avoids a hydration mismatch.
    setClientCartCount(cartItemCount);
  }, [cartItemCount]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-white/20 md:hidden z-50">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          const isCartItem = item.view === 'cart';

          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs transition-colors w-full h-full',
                isActive ? 'text-custom-gold' : 'text-white/70 hover:text-white'
              )}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {isCartItem && clientCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {clientCartCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
