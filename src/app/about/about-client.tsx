
// @/app/about/about-client.tsx
'use client';

import * as React from 'react';
import { useState, UIEvent, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from "@/components/desktop/header";
import { SparkleBackground } from '@/components/desktop/sparkle-background';
import { Footer } from '@/components/footer';
import { SectionTitle } from "@/components/section-title";
import { Heart, Leaf, Gift, Sparkles, Code } from "lucide-react";
import { PopupsManager } from '@/components/popups/popups-manager';
import { BottomNavbar } from '@/components/mobile/bottom-navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaticSparkleBackground } from '@/components/mobile/static-sparkle-background';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import type { ActiveView } from '@/types';
import CustomScreenLoader from '@/components/loaders/custom-screen-loader';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};


const AboutSection = ({ title, children, icon, isMobile }: { title: string, children: React.ReactNode, icon?: React.ReactNode, isMobile: boolean }) => (
    <motion.div
      variants={itemVariants}
      whileHover={isMobile ? undefined : { scale: 1.05, y: -5 }}
      className="bg-black/20 p-6 md:p-8 rounded-2xl h-full flex flex-col"
    >
        <div className="flex items-center gap-4 mb-4">
            {icon && <div className="text-custom-gold bg-black/30 p-3 rounded-full">{React.cloneElement(icon as React.ReactElement, { size: isMobile ? 24 : 28 })}</div>}
            <h3 className="text-xl md:text-2xl font-bold font-plex-sans-condensed text-custom-gold">
                {title}
            </h3>
        </div>
        <p className="text-base md:text-lg text-white/90 font-plex-sans leading-relaxed">
            {children}
        </p>
    </motion.div>
);


export default function AboutPageClient() {
    const router = useRouter();
    const pathname = usePathname();
    const { cart, setIsGlobalLoading } = useAppContext();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEnquireOpen, setIsEnquireOpen] = useState(false);
    const [isContentScrolled, setIsContentScrolled] = useState(false);
    const isMobile = useIsMobile();
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
        setIsGlobalLoading(false);
    }, []);

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        setIsContentScrolled(event.currentTarget.scrollTop > 0);
    };

    const handleNavigation = (view: ActiveView) => {
        const newPath = view === 'home' ? '/' : `/${view}`;
        if (pathname === newPath) return;
        setIsGlobalLoading(true);
        router.push(newPath);
    };

    const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
        if (`/${view}` === pathname) return;
        setIsGlobalLoading(true);
        router.push(`/${view}`);
    }

    const cartItemCount = Object.values(cart).reduce((acc, quantity) => acc + quantity.quantity, 0);

    if (!isClient) {
        return <CustomScreenLoader text="Loading" />;
    }

    return (
        <>
            {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
            <div className={cn((isProfileOpen || isEnquireOpen) && "opacity-50")}>
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
                      activeView={'about'}
                      isEnquireOpen={isEnquireOpen}
                      onEnquireOpenChange={setIsEnquireOpen}
                    />
                    <main onScroll={handleScroll} className={cn(
                      "flex-grow flex flex-col overflow-y-auto no-scrollbar transition-all duration-300", 
                      "pt-20 md:pt-32"
                    )}>
                        <div className="bg-[#5D2B79] rounded-[20px] md:rounded-[30px] lg:rounded-[40px] mt-8 mb-8 mx-4 md:mx-16 xl:mx-32 animate-fade-in flex flex-col" style={{ animationDuration: '0.5s', animationDelay: '0.2s', animationFillMode: 'both' }}>
                            <div className="bg-white/10 rounded-[20px] md:rounded-[30px] lg:rounded-[40px] py-8 px-6 md:py-10 md:px-8 xl:px-24">
                                <SectionTitle className="text-3xl md:text-4xl text-center mb-8 md:mb-10 lg:mb-12 font-poppins px-0 md:px-0">
                                    Our Philosophy
                                </SectionTitle>
                                
                                <motion.div
                                  className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="visible"
                                >
                                    <AboutSection title="Handcrafted with Passion" icon={<Heart />} isMobile={!!isMobile}>
                                        Every single chocolate is a labor of love. We meticulously craft each piece by hand, ensuring that every detail is perfect, from the rich flavors to the elegant presentation.
                                    </AboutSection>
                                    
                                    <AboutSection title="Pure & Wholesome" icon={<Leaf />} isMobile={!!isMobile}>
                                        Your trust is our top priority. That’s why all ChocoSmiley products are 100% vegetarian and eggless. We use only the finest ingredients for a delightful and guilt-free indulgence.
                                    </AboutSection>
                                    
                                    <AboutSection title="The Art of Gifting" icon={<Gift />} isMobile={!!isMobile}>
                                        We believe the perfect gift is personal. Our customizable boxes allow you to hand-pick every flavor, ensuring your gift is as unique as the person receiving it.
                                    </AboutSection>
                                    
                                    <AboutSection title="Join Our Story" icon={<Sparkles />} isMobile={!!isMobile}>
                                        Thank you for being a part of our journey. We are excited to help you craft your perfect gift and spread a little more happiness in the world, one chocolate at a time.
                                    </AboutSection>
                                </motion.div>
                            </div>
                        </div>
                        <motion.div 
                            className="bg-transparent mb-8 mx-4 md:mx-16 xl:mx-32 animate-fade-in"
                            variants={itemVariants} 
                            initial="hidden" 
                            animate="visible"
                            style={{ animationDuration: '0.5s', animationDelay: '0.4s', animationFillMode: 'both' }}
                        >
                            <div className="bg-black/20 rounded-2xl md:rounded-[30px] lg:rounded-[40px] p-6 md:p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-custom-gold bg-black/30 p-3 rounded-full"><Code size={isMobile ? 24 : 28} /></div>
                                    <h3 className="text-xl md:text-2xl font-bold font-plex-sans-condensed text-custom-gold">
                                        A Note from the Developers
                                    </h3>
                                </div>
                                <p className="text-base md:text-lg text-white/90 font-plex-sans leading-relaxed">
                                    This website is currently under active development. While we strive for a seamless experience, you may encounter occasional bugs or glitches. Your feedback is invaluable to us! If you notice anything amiss, please don't hesitate to reach out at <a href="mailto:chocosmiley79@gmail.com" className="text-custom-gold font-semibold hover:underline">chocosmiley79@gmail.com</a>.
                                </p>
                            </div>
                        </motion.div>
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
            <BottomNavbar activeView={'about'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
        </>
    );
}
