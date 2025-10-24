
// @/app/home-client.tsx
'use client';

import { useState, useEffect, useCallback, type UIEvent, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Header } from "@/components/desktop/header";
import { SparkleBackground } from '@/components/desktop/sparkle-background';
import { PopupsManager } from '@/components/popups/popups-manager';
import { BottomNavbar } from '@/components/mobile/bottom-navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExploreCategories } from '@/components/desktop/explore-categories';
import { SearchBar } from '@/components/header/search-bar';
import { useToast } from "@/hooks/use-toast";
import { StaticSparkleBackground } from '@/components/mobile/static-sparkle-background';
import { useAppContext } from '@/context/app-context';
import type { SanityProduct } from '@/types';
import type { ActiveView } from '@/types';
import { FlavourSelectionPopup } from '@/components/popups/flavour-selection-popup';
import CustomScreenLoader from '@/components/loaders/custom-screen-loader';
import { ProfileCompletionBanner } from '@/components/mobile/profile-completion-banner';
import { getProductSuggestions, type TrendingSuggestion } from './actions';
import { SearchSuggestions } from '@/components/search-suggestions';
import { FloatingCartButton } from '@/components/desktop/floating-cart-button';
import { MobileExploreCategories } from '@/components/mobile/mobile-explore-categories';

interface HomepageContent {
  exploreCategories: { _key: string; name: string; subtitle: string; imageUrl: string }[];
  exploreFlavours: { _key: string; name: string; subtitle: string; imageUrl: string }[];
}

interface HomeClientProps extends HomepageContent {
 
  trendingSuggestions: TrendingSuggestion[];
}


export default function HomeClient({ exploreCategories, exploreFlavours, trendingSuggestions }: HomeClientProps) {
  const { cart, updateCart, flavourSelection, setFlavourSelection, setIsGlobalLoading } = useAppContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const [searchInput, setSearchInput] = useState("");
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  const [productSuggestions, setProductSuggestions] = useState<SanityProduct[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isContentScrolled, setIsContentScrolled] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartMessage] = useState('');
  const [isCartButtonExpanded] = useState(false);
  const handleToggleCartPopup = () => setIsCartOpen(p => !p);

  useEffect(() => {
    setIsClient(true);
    setIsGlobalLoading(false);
  }, [setIsGlobalLoading]);

  useEffect(() => {
    if (isProfileOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isProfileOpen]);

  const fetchProductSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setProductSuggestions([]);
      return;
    }
    setIsSuggestionsLoading(true);
    const result = await getProductSuggestions(query);
    setProductSuggestions(result);
    setIsSuggestionsLoading(false);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (showSuggestions) {
        fetchProductSuggestions(searchInput);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, showSuggestions, fetchProductSuggestions]);

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
  };
  
  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>, currentSearchInput: string) => {
    e.preventDefault();
    
    if (!currentSearchInput.trim()) {
      toast({
        title: "Empty Field",
        description: "Search field cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGlobalLoading(true);
    router.push(`/search?q=${encodeURIComponent(currentSearchInput.trim())}`);
  };

  const handleTrendingSuggestionClick = (searchQuery: string) => {
    setShowSuggestions(false);
    setSearchInput(searchQuery);
    setIsGlobalLoading(true);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };


  const handleNavigation = (view: ActiveView) => {
    const newPath = view === 'home' ? '/' : `/${view}`;
    if (pathname === newPath) return;
    setIsGlobalLoading(true);
    router.push(newPath);
  };
  
  const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
    const newPath = `/${view}`;
    if (pathname === newPath) return;
    setIsGlobalLoading(true);
    router.push(newPath);
  };
  
  const handleProductClick = (product: SanityProduct) => {
    setIsGlobalLoading(true);
    router.push(`/product/${product.slug.current}`);
  };

  const handleFlavourConfirm = (productName: string, flavours: string[]) => {
    const prevQuantity = cart[productName]?.quantity || 0;
    updateCart(productName, prevQuantity + 1, flavours);
  };

  const cartItemCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
  
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsContentScrolled(event.currentTarget.scrollTop > 0);
  };
  
  const handleSuggestionClick = (product: SanityProduct) => {
    setShowSuggestions(false);
    handleProductClick(product);
  }

  if (!isClient) {
    return (
      <CustomScreenLoader />
    );
  }

  return (
    <>
      {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
      <div className={cn(
        "flex flex-col h-screen",
        (isProfileOpen || flavourSelection.isOpen || isEnquireOpen) ? 'opacity-50' : ''
      )}>
        <Header
          onProfileOpenChange={setIsProfileOpen}
          isContentScrolled={!!isMobile}
          onReset={() => {
            if (pathname === '/') return;
            setIsGlobalLoading(true);
            router.push('/');
          }}
          onNavigate={handleHeaderNavigate}
          activeView={'home'}
          isEnquireOpen={isEnquireOpen}
          onEnquireOpenChange={setIsEnquireOpen}
        />
        <ProfileCompletionBanner isMobile={isMobile} />
        <main onScroll={handleScroll} className="pt-20 md:pt-30 flex flex-col items-center justify-start transition-all duration-500 relative flex-grow min-h-0 pb-16 md:pb-0 overflow-y-auto no-scrollbar">
          <div className="w-full px-8 md:px-4">
            <div ref={searchContainerRef} className='relative mt-8 md:mt-12 z-30 mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'>
              <SearchBar
                activeView={'home'}
                isEnquireOpen={isEnquireOpen}
                onSubmit={handleSearchSubmit}
                searchInput={searchInput}
                onSearchInputChange={handleSearchInputChange}
                onFocus={handleSearchFocus}
              />
              {showSuggestions && (
                 <div className="absolute top-full w-full">
                    <SearchSuggestions
                      productSuggestions={productSuggestions}
                      trendingSuggestions={trendingSuggestions}
                      isLoading={isSuggestionsLoading}
                      onProductClick={handleSuggestionClick}
                      onTrendingClick={handleTrendingSuggestionClick}
                      onClose={() => setShowSuggestions(false)}
                      hasSearchInput={searchInput.length > 0}
                      searchInput={searchInput}
                      searchContainerRef={searchContainerRef}
                    />
                 </div>
              )}
            </div>
          </div>
          <div className="mt-8 md:mt-20 w-full flex-grow min-h-0">
            {isMobile ? (
              <MobileExploreCategories exploreCategories={exploreCategories} exploreFlavours={exploreFlavours} />
            ) : (
              <ExploreCategories exploreCategories={exploreCategories} exploreFlavours={exploreFlavours} />
            )}
          </div>
          
        </main>
        <BottomNavbar activeView={'home'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
      </div>

      <PopupsManager
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isCartOpen={isCartOpen}
        onToggleCartPopup={handleToggleCartPopup}
        isEnquireOpen={isEnquireOpen}
      />
      {isMobile === false && (
        <FloatingCartButton
          activeView={'home'}
          isCartOpen={isCartOpen}
          isProfileOpen={isProfileOpen}
          onToggleCart={handleToggleCartPopup}
          isCartButtonExpanded={isCartButtonExpanded}
          cartMessage={cartMessage}
          cart={cart}
        />
      )}
       <FlavourSelectionPopup
        open={flavourSelection.isOpen}
        onOpenChange={(isOpen) => setFlavourSelection({ product: null, isOpen })}
        onConfirm={handleFlavourConfirm}
      />
    </>
  );
}
