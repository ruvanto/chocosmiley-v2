
// @/components/mobile/mobile-header.tsx
'use client';

import { cn } from "@/lib/utils";
import { Logo } from "../header/logo";
import { UserActions } from "../header/user-actions";
import type { ActiveView } from '@/types';
import { useAppContext } from "@/context/app-context";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
    onProfileOpenChange: (isOpen: boolean) => void;
    onNavigate: (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => void;
    activeView: ActiveView;
}

export function MobileHeader({ 
    onProfileOpenChange,
    onNavigate,
    activeView,
}: MobileHeaderProps) {
    const { setIsGlobalLoading } = useAppContext();
    const router = useRouter();

    const handleLogoClick = () => {
        setIsGlobalLoading(true);
        router.push('/');
    };
    
    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 bg-background h-20 flex items-center justify-between px-4 border-b border-white/20 transition-transform duration-300 ease-in-out"
        )}>
            <Logo onLogoClick={handleLogoClick} isEnquireOpen={false} />
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
