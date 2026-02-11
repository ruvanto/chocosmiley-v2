// @/components/header.tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "../header/logo";
import { Navigation } from "../header/navigation";
import { UserActions } from "../header/user-actions";
import type { ActiveView, SanityProduct } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppContext } from "@/context/app-context";
import { MobileHeader } from "../mobile/mobile-header";
import { AnimatedSearchBar } from "../animated-search-bar";

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
  onProductClick?: (product: SanityProduct) => void;
  onTrendingClick?: (searchQuery: string) => void;
  showAnimatedSearch?: boolean;
  searchContainerRef?: React.RefObject<HTMLDivElement>;
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
  showAnimatedSearch = false,
}: HeaderProps) {
  const { setIsGlobalLoading } = useAppContext();
  const isMobile = useIsMobile();
  const localSearchContainerRef = useRef<HTMLDivElement>(null);

  const handleLogoClick = () => {
    if (activeView === 'home') return;
    setIsGlobalLoading(true);
    onReset();
  };

  if (isMobile) {
    if (activeView === 'search') return null; // Let SearchClientPage handle the mobile header
    return (
      <MobileHeader
        onProfileOpenChange={onProfileOpenChange}
        onNavigate={onNavigate}
        activeView={activeView}
      />
    );
  }

  const showSearch = activeView === 'search' || activeView === 'product-detail' || (activeView === 'home' && showAnimatedSearch);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full pt-4 md:pt-6 pb-4 md:pb-4 transition-all duration-100", 
      isContentScrolled ? 'bg-background border-b border-white/20' : 'bg-transparent',
    )}>
      <div className="flex h-12 md:h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-24">
        
        {/* Left Column */}
        <div className="flex items-center justify-start">
          <Logo onLogoClick={handleLogoClick} isEnquireOpen={isEnquireOpen} />
        </div>
        
        {/* Center Column */}
        <div className="hidden md:flex flex-1 justify-center px-6 relative">
          <div ref={localSearchContainerRef} className="w-full h-full flex justify-center items-center">
             {showSearch ? (
                <div 
                  className={cn(
                    "w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl transition-all duration-300", 
                    isEnquireOpen && 'opacity-50 pointer-events-none',
                    activeView === 'home' && 'animate-slide-down-fade'
                  )}
                  onClick={activeView !== 'home' ? onSearchIconClick : undefined}
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
                    isClickOnly={isMobile && activeView !== 'home'}
                />
                   {children}
                </div>
            ) : (
              <Navigation 
                onNavigate={onNavigate}
                activeView={activeView}
              />
            )}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="flex items-center justify-end">
          <UserActions 
            isEnquireOpen={isEnquireOpen}
            onEnquireOpenChange={onEnquireOpenChange}
            onProfileOpenChange={onProfileOpenChange}
            onNavigate={onNavigate}
            activeView={activeView}
          />
        </div>
      </div>
    </header>
  );
}
