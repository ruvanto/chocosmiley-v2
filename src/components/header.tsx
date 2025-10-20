
// @/components/header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Logo } from "./header/logo";
import { Navigation } from "./header/navigation";
import { UserActions } from "./header/user-actions";
import type { ActiveView } from "@/types";
import { AnimatedSearchBar } from "./animated-search-bar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppContext } from "@/context/app-context";
import { MobileHeader } from "./header/mobile-header";

interface HeaderProps {
  onProfileOpenChange: (isOpen: boolean) => void;
  isContentScrolled: boolean;
  onReset: () => void;
  onNavigate: (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => void;
  activeView: ActiveView;
  onSearchSubmit?: (query: string) => void;
  searchInput?: string;
  onSearchInputChange?: (value: string) => void;
  onSearchFocus?: () => void;
  onSearchIconClick?: () => void;
  children?: React.ReactNode;
  isEnquireOpen: boolean;
  onEnquireOpenChange: (isOpen: boolean) => void;
}

export function Header({ 
  onProfileOpenChange, 
  isContentScrolled, 
  onReset, 
  onNavigate, 
  activeView,
  onSearchSubmit = () => {},
  searchInput = '',
  onSearchInputChange = () => {},
  onSearchFocus = () => {},
  onSearchIconClick,
  children,
  isEnquireOpen,
  onEnquireOpenChange,
}: HeaderProps) {
  const router = useRouter();
  const { setIsGlobalLoading } = useAppContext();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogoClick = () => {
    if (activeView === 'home') return;
    setIsGlobalLoading(true);
    onReset();
  };

  if (isMobile) {
    if (activeView === 'search') return null; // Let SearchClientPage handle the mobile header
    return (
      <MobileHeader
        isVisible={true}
        onProfileOpenChange={onProfileOpenChange}
        onNavigate={onNavigate}
        activeView={activeView}
      />
    );
  }

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full pt-4 md:pt-6 pb-4 md:pb-4 transition-all duration-100", 
      isContentScrolled ? 'bg-background border-b border-white/20' : 'bg-transparent',
    )}>
      <div className="container relative flex h-12 md:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-24">
        
        <div className="flex justify-start">
          <Logo onLogoClick={handleLogoClick} isEnquireOpen={isEnquireOpen} />
        </div>
        
        <div ref={searchContainerRef} className="hidden md:flex flex-1 justify-center px-4 relative">
           {(activeView === 'search' || activeView === 'product-detail') ? (
              <div 
                className={cn("w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl", isEnquireOpen && 'opacity-50 pointer-events-none')}
                onClick={onSearchIconClick}
              >
                <AnimatedSearchBar 
                    onSearchSubmit={onSearchSubmit}
                    isExpanded={true}
                    onExpandedChange={() => {}}
                    isSearchingOnAbout={false}
                    activeView={activeView}
                    searchInput={searchInput}
                    onSearchInputChange={onSearchInputChange}
                    onFocus={onSearchFocus}
                    isClickOnly={isMobile}
                />
                 {children}
              </div>
          ) : (
            isClient &&
            <Navigation 
              onNavigate={onNavigate}
              activeView={activeView}
            />
          )}
        </div>
        
        <div className="flex justify-end">
          {isClient && (
            <UserActions 
              isEnquireOpen={isEnquireOpen}
              onEnquireOpenChange={onEnquireOpenChange}
              onProfileOpenChange={onProfileOpenChange}
              onNavigate={onNavigate}
              activeView={activeView}
            />
          )}
        </div>
      </div>
    </header>
  );
}
