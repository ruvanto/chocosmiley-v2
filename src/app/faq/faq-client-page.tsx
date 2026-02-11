
// @/app/faq/faq-client-page.tsx
'use client';

import { Suspense, useState, type UIEvent, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaqContent, type FaqItem } from '@/app/faq/faq-content';
import type { SanityProduct, ActiveView } from '@/types';
import { LoadingFallback } from '@/components/loaders/loading-fallback';
import { Header } from "@/components/desktop/header";
import { SparkleBackground } from '@/components/desktop/sparkle-background';
import { Footer } from '@/components/footer';
import { StaticSparkleBackground } from '@/components/mobile/static-sparkle-background';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { PopupsManager } from '@/components/popups/popups-manager';
import { useAppContext } from '@/context/app-context';
import { BottomNavbar } from '@/components/mobile/bottom-navbar';
import CustomScreenLoader from '@/components/loaders/custom-screen-loader';


interface FaqPageClientProps {
    faqData: FaqItem[];
}

export default function FaqPageClient({ faqData }: FaqPageClientProps) {
    const isMobile = useIsMobile();
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEnquireOpen, setIsEnquireOpen] = useState(false);
    const { cart, setIsGlobalLoading } = useAppContext();
    const [isContentScrolled, setIsContentScrolled] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setIsGlobalLoading(false);
    }, [setIsGlobalLoading]);

    const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
        if (`/${view}` === pathname) return;
        setIsGlobalLoading(true);
        router.push(`/${view}`);
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        setIsContentScrolled(event.currentTarget.scrollTop > 0);
    };

    const handleNavigation = (view: ActiveView) => {
        const newPath = view === 'home' ? '/' : `/${view}`;
        if (pathname === newPath) return;
        setIsGlobalLoading(true);
        router.push(newPath);
    };

    const cartItemCount = Object.values(cart).reduce((acc, quantity) => acc + quantity.quantity, 0);
    
    if (!isClient) {
        return <CustomScreenLoader text="Loading" />;
    }

    return (
        <>
            {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
            <div className={cn(isProfileOpen || isEnquireOpen && "opacity-50")}>
                <div className="flex flex-col min-h-screen md:h-screen">
                    <Header
                        onProfileOpenChange={setIsProfileOpen}
                        isContentScrolled={isMobile ? true : isContentScrolled}
                        onReset={() => {
                            if (pathname === '/') return;
                            setIsGlobalLoading(true);
                            router.push('/');
                        }}
                        onNavigate={handleHeaderNavigate}
                        activeView={'faq'}
                        isEnquireOpen={isEnquireOpen}
                        onEnquireOpenChange={setIsEnquireOpen}
                    />
                    <main
                        onScroll={handleScroll}
                        className={cn(
                            "flex-grow flex flex-col overflow-y-auto no-scrollbar transition-all duration-300",
                            "pt-20 md:pt-32"
                        )}
                    >
                        <Suspense fallback={<LoadingFallback text="Loading FAQ..." />}>
                            <FaqContent sanityFaqs={faqData} />
                        </Suspense>
                        <Footer />
                        <div className="h-16 flex-shrink-0 md:hidden" />
                    </main>
                </div>
            </div>
            <PopupsManager
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
                isEnquireOpen={isEnquireOpen}
            />
            <BottomNavbar activeView={'faq'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
        </>
    );
}
