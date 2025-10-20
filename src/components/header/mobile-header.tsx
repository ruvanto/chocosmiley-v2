
// @/components/header/mobile-header.tsx
'use client';

import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { UserActions } from "./user-actions";
import type { ActiveView } from '@/types';

interface MobileHeaderProps {
    isVisible: boolean;
    onProfileOpenChange: (isOpen: boolean) => void;
    onNavigate: (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => void;
    activeView: ActiveView;
}

export function MobileHeader({ 
    isVisible,
    onProfileOpenChange,
    onNavigate,
    activeView,
}: MobileHeaderProps) {
    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 bg-background h-20 flex items-center justify-between px-4 border-b border-white/20 transition-transform duration-300 ease-in-out",
            isVisible ? "translate-y-0" : "-translate-y-full"
        )}>
            <Logo onLogoClick={() => {}} isEnquireOpen={false} />
            <UserActions 
              isEnquireOpen={false}
              onEnquireOpenChange={() => {}}
              onProfileOpenChange={onProfileOpenChange}
              onNavigate={onNavigate}
              activeView={activeView}
            />
        </header>
    );
}
