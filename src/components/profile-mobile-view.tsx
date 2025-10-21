
// @/components/profile-mobile-view.tsx
'use client';

import { useState } from 'react';
import type { ProfileInfo } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { MyProfileTab } from '@/components/my-profile-tab';
import { WishlistView } from '@/components/wishlist-view';
import { MyOrdersTab } from '@/components/my-orders-tab';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';
import { Loader } from './loader';

interface ProfileMobileViewProps {
  profile: ProfileInfo;
  onProfileUpdate: (updatedProfile: Partial<ProfileInfo>) => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  isProfileLoaded: boolean;
}

const tabs = ['My Profile', 'My Wishlist', 'My Orders'];

export function ProfileMobileView({ 
  profile, 
  onProfileUpdate, 
  isAuthenticated,
  onLoginClick,
  isProfileLoaded,
}: ProfileMobileViewProps) {
  const [activeTab, setActiveTab] = useState('My Profile');
  const router = useRouter();

  return (
    <div className="flex flex-col px-4 text-white">
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
      <div className={cn(
        "flex-grow overflow-y-auto no-scrollbar", 
        activeTab === 'My Profile' && 'pt-6', 
        activeTab === 'My Wishlist' && 'pt-6'
      )}>
        {!isProfileLoaded ? (
            <div className="flex flex-col flex-grow items-center justify-center gap-2 pt-44">
                <Loader />
                <p className="text-white">Loading Your Profile</p>
            </div>
        ) : (
            <>
                {activeTab === 'My Profile' && (
                  isAuthenticated ? (
                    <MyProfileTab profile={profile} onProfileUpdate={onProfileUpdate} />
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center h-full px-4 pt-24">
                      <EmptyState 
                        imageUrl='/icons/profile_drpdwn_btn.png'
                        title="You're Not Logged In"
                        description="Log in or create an account to view your profile, orders, and wishlist."
                        buttonText="Log In / Sign Up"
                        onButtonClick={onLoginClick}
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
            </>
        )}
      </div>
    </div>
  );
}
