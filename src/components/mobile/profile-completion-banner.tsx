// @/components/mobile/profile-completion-banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { Button } from '../ui/button';
import { X, AlertCircle } from 'lucide-react';

interface ProfileCompletionBannerProps {
    isMobile?: boolean;
}

export function ProfileCompletionBanner({ isMobile = false }: ProfileCompletionBannerProps) {
    const { isAuthenticated, profileInfo, isProfileLoaded, setIsGlobalLoading } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const shouldShow = isAuthenticated && 
                           isProfileLoaded && 
                           (!profileInfo.name || !profileInfo.phone);
        setShouldRender(shouldShow);
    }, [isAuthenticated, profileInfo, isProfileLoaded]);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    const handleCompleteProfile = () => {
        if (pathname === '/account') {
            setIsVisible(false);
            return;
        }
        setIsGlobalLoading(true);
        router.push('/account');
    };

    if (!shouldRender || !isVisible) {
        return null;
    }

    if (isMobile) {
        return (
            <div className="fixed bottom-16 left-0 right-0 z-40 bg-yellow-400 text-black px-4 py-2 flex items-center justify-between text-xs animate-slide-up-fade-in">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Complete your profile to place orders.</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleCompleteProfile}
                        variant="link"
                        className="p-0 h-auto text-black font-bold hover:underline"
                    >
                        Complete
                    </Button>
                    <button onClick={handleDismiss}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Desktop implementation placeholder
    return null;
}
