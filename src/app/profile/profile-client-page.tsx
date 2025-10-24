
// @/app/profile/profile-client-page.tsx
'use client';

import { useState, useEffect, type UIEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ActiveView } from '@/types';
import { Header } from '@/components/header';
import { BottomNavbar } from '@/components/mobile/bottom-navbar';
import { SparkleBackground } from '@/components/desktop/sparkle-background';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaticSparkleBackground } from '@/components/mobile/static-sparkle-background';
import { useAppContext } from '@/context/app-context';
import { EmptyState } from '@/components/empty-state';
import type { ProfileInfo } from '@/context/app-context';
import { PopupsManager } from '@/components/popups/popups-manager';
import { FlavourSelectionPopup } from '@/components/flavour-selection-popup';
import { MyProfileTab } from '@/components/my-profile-tab';
import { WishlistView } from '@/components/wishlist-view';
import { MyOrdersTab } from '@/components/my-orders-tab';
import CustomScreenLoader from '@/components/custom-screen-loader';
import { ProfileCompletionBanner } from '@/components/mobile/profile-completion-banner';


const tabs = ['My Profile', 'My Wishlist', 'My Orders'];

export default function ProfileClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { 
    cart, 
    updateCart,
    profileInfo, 
    updateProfileInfo, 
    isProfileLoaded,
    isAuthenticated,
    setAuthPopup,
    authPopup,
    flavourSelection,
    setFlavourSelection,
    setIsGlobalLoading,
  } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('My Profile');
  const [isClient, setIsClient] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  
  useEffect(() => {
    setIsClient(true);
    setIsGlobalLoading(false);
  }, []);

  const handleNavigation = (view: ActiveView) => {
    const newPath = view === 'home' ? '/' : `/${view}`;
    if (pathname === newPath) return;
    setIsGlobalLoading(true);
    router.push(newPath);
  };
  
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!isMobile) return;

    const currentScrollTop = event.currentTarget.scrollTop;
    // Add a small threshold to prevent toggling from minor scroll movements
    if (Math.abs(currentScrollTop - lastScrollTop) <= 10) {
      return;
    }

    if (currentScrollTop > lastScrollTop && currentScrollTop > 56) {
      // Scrolling Down
      setIsHeaderVisible(false);
    } else {
      // Scrolling Up
      setIsHeaderVisible(true);
    }
    setLastScrollTop(currentScrollTop <= 0 ? 0 : currentScrollTop);
  };


  const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
    if (`/${view}` === pathname) return;
    setIsGlobalLoading(true);
    router.push(`/${view}`);
  }

  const handleProfileUpdate = (updatedProfile: Partial<ProfileInfo>) => {
    updateProfileInfo(updatedProfile);
  };
  
  
  const handleLoginClick = () => {
    setAuthPopup('login');
  }
  
  const handleDesktopProfileClick = () => {
    setIsProfileOpen(true);
  }

  const handleFlavourConfirm = (productName: string, flavours: string[]) => {
    const prevQuantity = cart[productName]?.quantity || 0;
    updateCart(productName, prevQuantity + 1, flavours);
  };

  const cartItemCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  if (!isClient || !isProfileLoaded) {
    return (
      <CustomScreenLoader text="Preparing your account details" />
    );
  }

  return (
    <>
      {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
      <div className={cn("flex flex-col min-h-screen", (isProfileOpen || !!authPopup || flavourSelection.isOpen || isEnquireOpen) && 'opacity-50')}>
        
        <Header
          onProfileOpenChange={handleDesktopProfileClick}
          isContentScrolled={true}
          onReset={() => {
            if (pathname === '/') return;
            setIsGlobalLoading(true);
            router.push('/');
          }}
          onNavigate={handleHeaderNavigate}
          activeView={'profile'}
          isEnquireOpen={isEnquireOpen}
          onEnquireOpenChange={setIsEnquireOpen}
        />
        <ProfileCompletionBanner isMobile={isMobile} />
        <main className={cn(
          "flex-grow flex flex-col transition-all duration-300 relative min-h-0 pt-24",
        )}>
          {isMobile ? (
             <div className="flex flex-col h-full flex-grow">
                <div 
                  className={cn(
                    "sticky bg-background z-10 top-20 transition-transform duration-300",
                    isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                  )}
                >
                    <div className="flex-shrink-0 border-b border-white/20">
                        <div className="flex justify-around">
                        {tabs.map(tab => (
                            <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "py-2 px-2 text-sm font-medium transition-colors w-full",
                                activeTab === tab
                                ? 'text-custom-gold border-b-2 border-custom-gold'
                                : 'text-white/70 hover:text-white'
                            )}
                            >
                            {tab}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>
                <div 
                  onScroll={handleScroll}
                  className={cn(
                    "flex-grow overflow-y-auto no-scrollbar",
                    "pt-0"
                  )}
                >
                  {activeTab === 'My Profile' && (
                    isAuthenticated ? (
                      <MyProfileTab profile={profileInfo} onProfileUpdate={handleProfileUpdate} />
                    ) : (
                      <div className="flex-grow flex flex-col items-center justify-center h-full px-4 pt-24">
                      <EmptyState 
                          imageUrl='/icons/profile_icon.png'
                          title="You're Not Logged In"
                          description="Log in or create an account to view your profile, orders, and wishlist."
                          buttonText="Log In / Sign Up"
                          onButtonClick={handleLoginClick}
                          imageClassName='w-24 h-24'
                      />
                      </div>
                    )
                  )}
                  {activeTab === 'My Wishlist' && (
                    <WishlistView
                      isMobile={true}
                    />
                  )}
                  {activeTab === 'My Orders' && (
                    <MyOrdersTab 
                      isMobile={true} 
                    />
                  )}
                </div>
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4 pt-24">
               <h2 className="text-2xl font-bold text-white">Welcome, {profileInfo.name}!</h2>
                <p className="text-white/70 max-w-xs">
                  You can view and edit your profile details by clicking the profile icon in the header.
                </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center h-full px-4 pb-24">
              <EmptyState 
                imageUrl='/icons/profile_icon.png'
                title="You're Not Logged In"
                description="Log in or create an account to view your profile, orders, and wishlist."
                buttonText="Log In / Sign Up"
                onButtonClick={handleLoginClick}
                imageClassName='w-24 h-24'
              />
            </div>
          )}
        </main>
        <BottomNavbar activeView={'profile'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
      </div>
       <PopupsManager
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          isEnquireOpen={isEnquireOpen}
      />
      <FlavourSelectionPopup
        open={flavourSelection.isOpen}
        onOpenChange={(isOpen) => setFlavourSelection({ product: null, isOpen })}
        onConfirm={handleFlavourConfirm}
      />
    </>
  );
}
