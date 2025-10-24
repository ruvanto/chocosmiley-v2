// @/components/profile-popup.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ProfileSidebar } from './desktop/profile-sidebar';
import { MyProfileTab } from './my-profile-tab';
import type { ProfileInfo } from "@/context/app-context";
import { WishlistView } from './wishlist-view';
import { MyOrdersTab } from './my-orders-tab';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppContext } from '@/context/app-context';
import { Loader } from './loader';
import { EmptyState } from './empty-state';


interface ProfilePopupProps {
  onClose: () => void;
  onLogout: () => void;
}

export function ProfilePopup({ 
  onClose, 
}: ProfilePopupProps) {
  const [activeTab, setActiveTab] = useState('My Profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const { 
    profileInfo, 
    updateProfileInfo, 
    isProfileLoaded, 
    isAuthenticated, 
    setAuthPopup,
  } = useAppContext();

  const handleActionWithCheck = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action); // Store the action to be executed after confirmation
      setIsDialogVisible(true);
    } else {
      action(); // Execute immediately if no changes
    }
  };
  
  const handleClose = () => handleActionWithCheck(onClose);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    handleActionWithCheck(() => setActiveTab(tab));
  };
  
  const handleConfirmDiscard = () => {
    if (pendingAction) {
      pendingAction();
    }
    setHasUnsavedChanges(false);
    setIsDialogVisible(false);
    setPendingAction(null);
  };

  const handleCancelDiscard = () => {
    setIsDialogVisible(false);
    setPendingAction(null);
  };

  const handleProfileUpdate = (updatedProfile: Partial<ProfileInfo>) => {
    updateProfileInfo(updatedProfile);
    setHasUnsavedChanges(false);
  };
  
  const handleLoginClick = () => {
    onClose();
    setAuthPopup('login');
  }

  return (
    <>
      <div className="bg-transparent md:w-[85vw] lg:w-[60vw] h-[85vh] relative rounded-3xl overflow-hidden animate-fade-in">
          <button 
              onClick={handleClose} 
              className="absolute top-4 right-4 text-white hover:text-gray-200 z-20 rounded-full p-1"
          >
              <X size={20} />
              <span className="sr-only">Close</span>
          </button>
          <div className="flex h-full w-full">
              <div className="w-[25%] h-full bg-white">
                  <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange}/>
              </div>
              <div className="w-[75%] h-full bg-custom-purple-dark overflow-y-auto no-scrollbar">
                  {!isProfileLoaded ? <div className="h-full w-full flex items-center justify-center"><Loader /></div> : (
                    <>
                      {activeTab === 'My Profile' && (
                        isAuthenticated ? (
                          <MyProfileTab 
                            profile={profileInfo} 
                            onProfileUpdate={handleProfileUpdate}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center">
                            <EmptyState
                              imageUrl="/icons/profile_icon.png"
                              title="You're Not Logged In"
                              description="Log in or create an account to view your profile."
                              buttonText="Log In / Sign Up"
                              onButtonClick={handleLoginClick}
                              imageClassName="w-24 h-24"
                            />
                          </div>
                        )
                      )}
                      {activeTab === 'My Wishlist' && (
                        <WishlistView />
                      )}
                      {activeTab === 'My Orders' && (
                        <MyOrdersTab />
                      )}
                    </>
                  )}
              </div>
          </div>
      </div>
      <AlertDialog open={isDialogVisible} onOpenChange={setIsDialogVisible}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to discard them?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDiscard}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDiscard}>Discard Changes</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
