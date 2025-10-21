// @/components/profile-sidebar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, ListOrdered, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAppContext } from '@/context/app-context';

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainSidebarItems = [
  { id: 'My Profile', label: 'My Profile', icon: <Image src="/icons/profile_icon.png" alt="Profile" width={24} height={24} onDragStart={(e) => e.preventDefault()} /> },
  { id: 'My Wishlist', label: 'My Wishlist', icon: <Heart /> },
  { id: 'My Orders', label: 'My Orders', icon: <ListOrdered /> },
];

export function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
  const { logout, isAuthenticated } = useAppContext();
  const handleLogout = () => {
    logout();
};
  return (
    <div className="flex flex-col justify-between h-full bg-white md:pt-2 lg:pt-6 md:pb-1 lg:pb-4">
      <nav>
        {mainSidebarItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-4 w-full py-3 px-6 font-medium transition-all duration-200",
                isActive
                  ? 'text-custom-purple-dark md:text-base lg:text-lg font-semibold'
                  : 'text-custom-purple-dark/70 text-base hover:bg-custom-purple-dark/10'
              )}
            >
              <div className={cn("flex-shrink-0", isActive ? "h-7 w-7" : "h-6 w-6")}>
                {React.cloneElement(item.icon, { className: "h-full w-full" })}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="px-6">
        {isAuthenticated && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-4 w-full py-3 text-base font-medium transition-all duration-200 text-custom-purple-dark/70 hover:bg-custom-purple-dark/10 rounded-md"
                )}
              >
                <div className="h-6 w-6 flex-shrink-0 text-red-600">
                  <LogOut className="h-6 w-6" />
                </div>
                <span className="text-red-600">Log Out</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be returned to the login page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
