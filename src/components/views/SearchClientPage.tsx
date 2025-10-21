
// src/components/views/SearchClientPage.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { ActiveView } from '@/types';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { SparkleBackground } from '@/components/sparkle-background';
import { BottomNavbar } from '@/components/bottom-navbar';
import { PopupsManager } from '@/components/popups/popups-manager';
import { SearchView } from '@/components/views/SearchView';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SanityProduct, StructuredFilter } from '@/types';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { StaticSparkleBackground } from '@/components/static-sparkle-background';
import { useAppContext } from '@/context/app-context';
import { FlavourSelectionPopup } from '../flavour-selection-popup';
import { Loader } from '../loader';
import { MobileSearchView } from './MobileSearchView';
import { ProfileCompletionBanner } from '../profile-completion-banner';
import { getProductSuggestions, type TrendingSuggestion } from '@/app/actions';
import { SearchSuggestions } from '../search-suggestions';
import { MobileSearchHeader } from '../header/mobile-search-header';

interface SearchClientPageProps {
  initialFilters: StructuredFilter[];
  trendingSuggestions: TrendingSuggestion[];
}

const LoadingFallback = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background flex-col gap-2">
        <Loader />
        <p>Just a moment</p>
    </div>
);

function formatCategoryTitleToKey(title: string) {
    return title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
}


export default function SearchClientPage({ initialFilters, trendingSuggestions }: SearchClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const sortQuery = searchParams.get('sort') || 'featured';
  
  const { 
    cart, 
    updateCart, 
    flavourSelection,
    setFlavourSelection,
    setIsGlobalLoading,
  } = useAppContext();
  
  const [cartMessage, setCartMessage] = useState('');
  const [isCartButtonExpanded, setIsCartButtonExpanded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isSearchViewOpen, setIsSearchViewOpen] = useState(false);
  
  const [searchInput, setSearchInput] = useState(query);
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [productSuggestions, setProductSuggestions] = useState<SanityProduct[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileHeaderVisible] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const [activeFilters, setActiveFilters] = useState<{ type: string; value: string; label: string }[]>([]);
  const [sortOption, setSortOption] = useState(sortQuery);


  useEffect(() => {
    setIsClient(true);
    setIsGlobalLoading(false);
  }, [setIsGlobalLoading]);
  
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleFilterAction = (newParams: URLSearchParams) => {
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  
  const handleFilterChange = useCallback((categoryKey: string, optionTitle: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const existingValues = params.getAll(categoryKey);

    if (checked) {
        if (!existingValues.includes(optionTitle)) {
            params.append(categoryKey, optionTitle);
        }
    } else {
        const newValues = existingValues.filter(v => v !== optionTitle);
        params.delete(categoryKey);
        newValues.forEach(v => params.append(categoryKey, v));
    }
    handleFilterAction(params);
  }, [searchParams]);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('priceRange'); 
    params.set('minPrice', range[0].toString());
    params.set('maxPrice', range[1].toString());
    handleFilterAction(params);
  }, [searchParams]);

  const handlePriceCheckboxChange = useCallback((rangeString: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    
    const existingRanges = params.getAll('priceRange');
    
    let newRanges: string[];
    if (isChecked) {
        newRanges = [...existingRanges, rangeString];
    } else {
        newRanges = existingRanges.filter(r => r !== rangeString);
    }

    params.delete('priceRange');
    newRanges.forEach(r => params.append('priceRange', r));
    handleFilterAction(params);
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    setSortOption(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    handleFilterAction(params);
  };

  useEffect(() => {
    const active: { type: string; value: string; label: string }[] = [];
    const allFilterOptions: Record<string, string> = {};
    initialFilters.forEach(cat => {
      const key = formatCategoryTitleToKey(cat.title);
      cat.options.forEach(opt => {
        allFilterOptions[opt.title] = key;
      });
    });

    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q' && key !== 'sort' && key !== 'minPrice' && key !== 'maxPrice' && key !== 'priceRange') {
        active.push({ type: key, value, label: value });
      }
    }

    setActiveFilters(active);
  }, [searchParams, initialFilters]);
  
  const handleRemoveFilter = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterType === 'priceRange') {
        const newRanges = params.getAll('priceRange').filter(r => r !== value);
        params.delete('priceRange');
        newRanges.forEach(r => params.append('priceRange', r));
    } else if (filterType === 'priceSlider') {
        params.delete('minPrice');
        params.delete('maxPrice');
    } else {
        const existingValues = params.getAll(filterType);
        const newValues = existingValues.filter(v => v !== value);
        params.delete(filterType);
        newValues.forEach(v => params.append(filterType, v));
    }
    handleFilterAction(params);
  };

  // Handle Android back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isSearchViewOpen) {
        event.preventDefault();
        setIsSearchViewOpen(false);
      }
    };
    
    if (isSearchViewOpen) {
      // Push a new state to history to capture the back button press
      window.history.pushState({ mobileSearch: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSearchViewOpen]);


  const fetchSuggestions = useCallback(async (currentQuery: string) => {
    if (currentQuery.length < 2) {
      setProductSuggestions([]);
      // setShowSuggestions(false); // This was causing the flicker
      return;
    }
    setIsSuggestionsLoading(true);
    const serverSuggestions = await getProductSuggestions(currentQuery);
    setProductSuggestions(serverSuggestions);
    setIsSuggestionsLoading(false);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handler = setTimeout(() => {
      if(showSuggestions) fetchSuggestions(searchInput);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, fetchSuggestions, isMobile, showSuggestions]);

  const handleFlavourConfirm = (productName: string, flavours: string[]) => {
    const prevQuantity = cart[productName]?.quantity || 0;
    updateCart(productName, prevQuantity + 1, flavours);

    setCartMessage(`${productName} added`);
    setIsCartButtonExpanded(true);
    setTimeout(() => setIsCartButtonExpanded(false), 2000);
  };

  const handleProductClick = (product: SanityProduct) => {
    setIsGlobalLoading(true);
    router.push(`/product/${product.slug.current}`);
  };
  
  const handleSuggestionClick = (product: SanityProduct) => {
    setShowSuggestions(false);
    handleProductClick(product);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    if (value) {
        setShowSuggestions(true);
    } else {
        setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (submittedQuery: string) => {
    setShowSuggestions(false);
    if (isMobile) {
      setIsSearchViewOpen(false);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', submittedQuery);
    handleFilterAction(params);
  };

  const handleToggleCartPopup = () => setIsCartOpen(p => !p);
  
  const handleNavigation = (view: ActiveView) => {
    setIsGlobalLoading(true);
    router.push(view === 'home' ? '/' : `/${view}`);
  };

  const cartItemCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  
  
  const handleTrendingSuggestionClick = (searchQuery: string) => {
    setShowSuggestions(false);
    setSearchInput(searchQuery);
    handleSearchSubmit(searchQuery);
  };
  
  if (!isClient) {
    return <LoadingFallback />;
  }

  return (
    <>
      {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
      <div className={cn("flex flex-col min-h-screen md:h-screen", (isProfileOpen || isCartOpen || isEnquireOpen) ? 'opacity-50' : '')}>
        {isMobile ? (
            <div onClick={() => setIsSearchViewOpen(true)}>
                <MobileSearchHeader 
                    value={searchInput}
                    onChange={() => {}} // Input is controlled by the overlay now
                    onSubmit={(e) => e.preventDefault()} // Form submission is handled by the overlay
                    isVisible={isMobileHeaderVisible}
                />
            </div>
        ) : (
            <Header 
                onSearchSubmit={() => handleSearchSubmit(searchInput)}
                onProfileOpenChange={setIsProfileOpen}
                isContentScrolled={isContentScrolled} 
                onReset={() => router.push('/')}
                onNavigate={(view) => router.push(`/${view}`)}
                activeView={'search'}
                searchInput={searchInput}
                onSearchInputChange={(val) => handleSearchInputChange(val)}
                onSearchFocus={() => setShowSuggestions(true)}
                onSearchIconClick={() => {}}
                isEnquireOpen={isEnquireOpen}
                onEnquireOpenChange={setIsEnquireOpen}
            >
              {showSuggestions && !isMobile && (
                <div ref={searchContainerRef} className="absolute top-full w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mt-1">
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
            </Header>
        )}

        <ProfileCompletionBanner isMobile={isMobile} />
        <main className={cn(
          "flex-grow flex flex-col transition-all duration-300 relative min-h-0 pt-16 md:pt-32",
        )}>
          
           <SearchView
             filters={initialFilters}
             isMobile={isMobile}
             onFilterChange={handleFilterChange}
             onPriceRangeChange={handlePriceRangeChange}
             onPriceCheckboxChange={handlePriceCheckboxChange}
             activeFilters={activeFilters}
             onRemoveFilter={handleRemoveFilter}
             sortOption={sortOption}
             onSortChange={handleSortChange}
           />

        </main>
        <BottomNavbar activeView={'search'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
      </div>
      
      {isMobile && isSearchViewOpen && (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background z-[60]" />
      )}

      <PopupsManager
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isCartOpen={isCartOpen}
        onToggleCartPopup={handleToggleCartPopup}
        isEnquireOpen={isEnquireOpen}
      />
      {isMobile === false && (
        <FloatingCartButton
        activeView={'search'}
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
      <MobileSearchView
        isOpen={isSearchViewOpen}
        onClose={() => setIsSearchViewOpen(false)}
        initialSearch={searchInput}
        onSearch={handleSearchSubmit}
        trendingSuggestions={trendingSuggestions}
      />
    </>
  );
}
