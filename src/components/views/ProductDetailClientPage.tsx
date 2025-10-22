
// @/components/views/ProductDetailClientPage.tsx
'use client';

import { useState, type UIEvent, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { SanityProduct, ActiveView } from '@/types';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { SparkleBackground } from '@/components/sparkle-background';
import { BottomNavbar } from '@/components/bottom-navbar';
import { PopupsManager } from '@/components/popups/popups-manager';
import { FloatingCartButton } from '@/components/floating-cart-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSearchHeader } from '@/components/header/mobile-search-header';
import { MobileProductDetailView } from '@/components/views/MobileProductDetailView';
import { StaticSparkleBackground } from '@/components/static-sparkle-background';
import { useAppContext } from '@/context/app-context';
import { FeaturedProducts } from '../featured-products';
import { Separator } from '../ui/separator';
import { ProductDetails } from '../product-details';
import { ProductPopupFooter } from '../product-popup-footer';
import { ImageGallery, ExpandedImageView } from '../image-gallery';
import { FlavoursSection } from '../flavours-section';
import { FlavourSelectionPopup } from '../flavour-selection-popup';
import { Loader } from '../loader';
import { ProfileCompletionBanner } from '../profile-completion-banner';
import { MobileSearchView } from './MobileSearchView';
import { getProductSuggestions, getTrendingSuggestions, type TrendingSuggestion } from '@/app/actions';
import { SearchSuggestions } from '../search-suggestions';
import { MobileProductStickyBar } from '../mobile-product-sticky-bar';
import { MobileExpandedImageView } from '../mobile-image-gallery';
import { SearchBar } from '../header/search-bar';
import CustomScreenLoader from '../custom-screen-loader';

interface ProductDetailClientPageProps {
  product: SanityProduct;
  featuredProducts: SanityProduct[];
}

const LoadingFallback = () => (
    <CustomScreenLoader text="Loading your chocolate" />
);

export default function ProductDetailClientPage({ product, featuredProducts }: ProductDetailClientPageProps) {
  const router = useRouter();
  const { 
    cart, 
    updateCart, 
    likedProducts, 
    toggleLike, 
    flavourSelection, 
    setFlavourSelection, 
    setIsGlobalLoading, 
    flavourSelections,
  } = useAppContext();
  const isMobile = useIsMobile();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [isCartButtonExpanded, setIsCartButtonExpanded] = useState(false);
  const [isMobileHeaderVisible] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isSearchViewOpen, setIsSearchViewOpen] = useState(false);
  
  const [suggestions, setSuggestions] = useState<SanityProduct[]>([]);
  const [trendingSuggestions, setTrendingSuggestions] = useState<TrendingSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isBuyNowFlow = useRef(false);

  useEffect(() => {
    setIsClient(true);
    setIsGlobalLoading(false);
    const fetchInitialData = async () => {
        const [trending] = await Promise.all([
            getTrendingSuggestions(),
        ]);
        setTrendingSuggestions(trending);
    };
    fetchInitialData();
  }, [product, featuredProducts, setIsGlobalLoading]);

  // Handle Android back button for search view
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isSearchViewOpen) {
        event.preventDefault();
        setIsSearchViewOpen(false);
      }
    };
    
    if (isSearchViewOpen) {
      window.history.pushState({ mobileSearch: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSearchViewOpen]);
  
  const fetchSuggestions = useCallback(async (currentQuery: string) => {
    if (currentQuery.length < 2) {
      setSuggestions([]);
      // setShowSuggestions(false); // This was causing the flicker
      return;
    }
    setIsSuggestionsLoading(true);
    // setShowSuggestions(true);
    const serverSuggestions = await getProductSuggestions(currentQuery);
    setSuggestions(serverSuggestions);
    setIsSuggestionsLoading(false);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handler = setTimeout(() => {
        if (!isMobile && showSuggestions) { // Only run for desktop and when suggestions are meant to be shown
            fetchSuggestions(searchInput);
        }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput, fetchSuggestions, isMobile, showSuggestions]);


  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    setIsScrolled(scrollTop > 0);
  };
  
  const handleSearchSubmit = (query: string) => {
    setIsGlobalLoading(true);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleAddToCart = () => {
    const productQuantity = cart[product.name]?.quantity || 0;
    const hasFlavours = product.availableFlavours && product.availableFlavours.length > 0;

    if (hasFlavours && productQuantity === 0) {
      const preselectedFlavours = flavourSelections[product.name] || [];
      setFlavourSelection({ product, isOpen: true, preselectedFlavours });
    } else {
      const existingFlavours = cart[product.name]?.flavours || flavourSelections[product.name];
      updateCart(product.name, productQuantity + 1, hasFlavours ? existingFlavours : undefined);
      if (!isMobile) {
        setCartMessage(`${product.name} added`);
        setIsCartButtonExpanded(true);
        setTimeout(() => setIsCartButtonExpanded(false), 2000);
      }
    }
  };
  

  const onFeaturedProductAddToCart = (productToAdd: SanityProduct) => {
    const prevQuantity = cart[productToAdd.name]?.quantity || 0;
    const hasFlavours = productToAdd.availableFlavours && productToAdd.availableFlavours.length > 0;
    
    if (hasFlavours && prevQuantity === 0) {
      const preselectedFlavours = flavourSelections[productToAdd.name] || [];
      setFlavourSelection({ product: productToAdd, isOpen: true, preselectedFlavours });
    } else {
      const existingFlavours = cart[productToAdd.name]?.flavours || flavourSelections[productToAdd.name];
      updateCart(productToAdd.name, prevQuantity + 1, existingFlavours);
    }
  };


  const handleRemoveFromCart = (productToRemove: SanityProduct) => {
    const prevQuantity = cart[productToRemove.name]?.quantity || 0;
    if (prevQuantity > 0) {
      updateCart(productToRemove.name, prevQuantity - 1);
    }
  };
  
  const handleFlavourConfirm = (productName: string, flavours: string[]) => {
    const prevQuantity = cart[productName]?.quantity || 0;
    updateCart(productName, prevQuantity + 1, flavours);

    if (isBuyNowFlow.current) {
        setIsGlobalLoading(true);
        router.push('/cart');
        isBuyNowFlow.current = false; // Reset the flag
    } else if (!isMobile) {
        setCartMessage(`${productName} added`);
        setIsCartButtonExpanded(true);
        setTimeout(() => setIsCartButtonExpanded(false), 2000);
    }
  };


  const handleBuyNow = () => {
    isBuyNowFlow.current = true; // Set a flag to indicate Buy Now was clicked
    const productQuantity = cart[product.name]?.quantity || 0;
    if (productQuantity === 0) {
      const preselectedFlavours = flavourSelections[product.name] || [];
      if (product.availableFlavours && product.availableFlavours.length > 0) {
        setFlavourSelection({ product, isOpen: true, preselectedFlavours });
      } else {
        updateCart(product.name, 1);
        setIsGlobalLoading(true);
        router.push('/cart');
      }
    } else {
      setIsGlobalLoading(true);
      router.push('/cart');
    }
  };
  
  const handleSuggestionClick = (product: SanityProduct) => {
    setShowSuggestions(false);
    handleProductClick(product);
  };

  const handleNavigation = (view: ActiveView) => {
    setIsGlobalLoading(true);
    if (view === 'cart') router.push('/cart');
    else if (view === 'profile') router.push('/profile');
    else router.push('/');
  };

  const handleProductClick = (product: SanityProduct) => {
    setIsGlobalLoading(true);
    router.push(`/product/${product.slug.current}`);
  };
  
  const handleImageExpand = (index: number) => {
    setActiveImageIndex(index);
    setIsImageExpanded(true);
  };

  const handleToggleCartPopup = () => setIsCartOpen(p => !p);

  const cartItemCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

  if (!isClient) {
    return <LoadingFallback />;
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
        <p className="text-white">Product not found. Data could not be fetched.</p>
      </div>
    );
  }

  const isCurrentProductLiked = likedProducts.some(p => p._id === product._id);

  if (isMobile) {
    return (
      <>
        <StaticSparkleBackground />
        <div className={cn("flex flex-col min-h-screen")}>
          <div onClick={() => setIsSearchViewOpen(true)}>
             <MobileSearchHeader 
                  value={searchInput}
                  onChange={() => {}} 
                  onSubmit={(e) => e.preventDefault()}
                  isVisible={isMobileHeaderVisible}
              />
          </div>
          <main className="pt-16 pb-32">
            <MobileProductDetailView
              product={product}
              featuredProducts={featuredProducts}
              onClose={() => router.back()}
              cart={cart}
              onAddToCart={(name, quantity, flavours) => updateCart(name, quantity, flavours)}
              onBuyNow={handleBuyNow}
              isLiked={isCurrentProductLiked}
              onLikeToggle={() => toggleLike(product, product._id)}
              onProductClick={handleProductClick}
              onRemoveFromCart={handleRemoveFromCart}
              onFeaturedProductAddToCart={onFeaturedProductAddToCart}
              onImageExpand={handleImageExpand}
              likedProducts={likedProducts}
            />
          </main>
        </div>

        {isImageExpanded && (
            <MobileExpandedImageView
                images={product.images || []}
                activeIndex={activeImageIndex}
                productName={product.name}
                onClose={() => setIsImageExpanded(false)}
            />
        )}
        <MobileProductStickyBar 
            product={product}
            quantity={cart[product.name]?.quantity || 0}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={() => handleRemoveFromCart(product)}
            onBuyNow={handleBuyNow}
        />
        <BottomNavbar activeView={'product-detail'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
         <MobileSearchView
            isOpen={isSearchViewOpen}
            onClose={() => setIsSearchViewOpen(false)}
            initialSearch={searchInput}
            onSearch={handleSearchSubmit}
            trendingSuggestions={trendingSuggestions}
        />
         <FlavourSelectionPopup
          open={flavourSelection.isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) isBuyNowFlow.current = false; // Reset if popup is closed manually
            setFlavourSelection({ product: null, isOpen: false, preselectedFlavours: [] });
          }}
          onConfirm={handleFlavourConfirm}
        />
      </>
    );
  }

  return (
    <>
      <SparkleBackground />
      <div className={cn("flex flex-col h-screen", (isProfileOpen || isCartOpen || isEnquireOpen) && 'opacity-50' )}>
        <Header 
          onSearchSubmit={() => handleSearchSubmit(searchInput)}
          onProfileOpenChange={setIsProfileOpen}
          isContentScrolled={isScrolled} 
          onReset={() => router.push('/')}
          onNavigate={(view) => router.push(`/${view}`)}
          activeView={'product-detail'}
          searchInput={searchInput}
          onSearchInputChange={(val) => setSearchInput(val)}
          onSearchFocus={() => setShowSuggestions(true)}
          onSearchIconClick={() => router.push(`/search?q=`)}
          isEnquireOpen={isEnquireOpen}
          onEnquireOpenChange={setIsEnquireOpen}
        >
            {showSuggestions && !isMobile && (
              <div ref={searchContainerRef} className="absolute top-full w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mt-1">
                <SearchSuggestions
                  productSuggestions={suggestions}
                  trendingSuggestions={trendingSuggestions}
                  isLoading={isSuggestionsLoading}
                  onProductClick={handleSuggestionClick}
                  onTrendingClick={(q) => handleSearchSubmit(q)}
                  onClose={() => setShowSuggestions(false)}
                  hasSearchInput={searchInput.length > 0}
                  searchInput={searchInput}
                  searchContainerRef={searchContainerRef}
                />
              </div>
            )}
        </Header>
        <ProfileCompletionBanner isMobile={isMobile} />
        <main onScroll={handleScroll} className="pt-24 md:pt-32 overflow-y-auto no-scrollbar">
             <div className="bg-white/30 md:rounded-[25px] lg:rounded-[40px] text-white md:mx-10 lg:mx-24 xl:mx-32 h-[82vh] flex items-center justify-center">
                <div className="flex w-full h-full lg:px-0 l:px-5 gap-4 md:pr-6 lg:pr-6 xl:pr-10">
                    <div className="w-1/2 h-full flex flex-col">
                        <div className="flex h-[46%] md:rounded-[25px] lg:rounded-[40px] w-full justify-center pt-6 pl-6">
                            <ImageGallery 
                                product={product} 
                                onImageExpandChange={setIsImageExpanded}
                                activeIndex={activeImageIndex}
                                setActiveIndex={setActiveImageIndex}
                            />
                        </div>
                        <div className="py-6 pl-6 rounded-lg w-full flex-grow min-h-0">
                            <FlavoursSection
                                product={product}
                            />
                        </div>
                    </div>
                    <Separator orientation="vertical" className="bg-white/30 h-[90%] self-center md:mr-2 lg:mr-0" />
                    <div className="h-full relative py-4 w-1/2 flex flex-col">
                        <div className="flex-grow overflow-y-auto no-scrollbar min-h-0 md:mb-28 lg:mb-32 xl:mb-20">
                            <ProductDetails
                                product={product}
                                isLiked={isCurrentProductLiked}
                                onLikeToggle={() => toggleLike(product, product._id)}
                                isMobile={false}
                            />
                        </div>
                        <div className="flex-shrink-0">
                          <ProductPopupFooter
                              product={product}
                              quantity={cart[product.name]?.quantity || 0}
                              onAddToCart={handleAddToCart}
                              onRemoveFromCart={() => handleRemoveFromCart(product)}
                              onToggleCartPopup={handleToggleCartPopup}
                          />
                        </div>
                    </div>
                </div>
            </div>
            <div className="md:mx-16 lg:mx-24 py-8 mb-8">
              <FeaturedProducts 
                  products={featuredProducts}
                  onAddToCart={onFeaturedProductAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  cart={cart}
                  onProductClick={handleProductClick}
              />
            </div>
        </main>
      </div>

      {isImageExpanded && (
        <ExpandedImageView
            images={product.images || []}
            activeIndex={activeImageIndex}
            productName={product.name}
            onClose={() => setIsImageExpanded(false)}
        />
      )}
      
      {isMobile === false && (
        
        <FloatingCartButton
        activeView={'product-detail'}
        isCartOpen={isCartOpen}
        isProfileOpen={isProfileOpen}
        onToggleCart={handleToggleCartPopup}
        isCartButtonExpanded={isCartButtonExpanded}
        cartMessage={cartMessage}
        cart={cart}
      />
      )}

      <PopupsManager
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isCartOpen={isCartOpen}
        onToggleCartPopup={handleToggleCartPopup}
        isEnquireOpen={isEnquireOpen}
      />
      <BottomNavbar activeView={'product-detail'} onNavigate={handleNavigation} cartItemCount={cartItemCount} />
      <FlavourSelectionPopup
        open={flavourSelection.isOpen}
        onOpenChange={() => setFlavourSelection({ product: null, isOpen: false, preselectedFlavours: [] })}
        onConfirm={handleFlavourConfirm}
      />
    </>
  );
}
