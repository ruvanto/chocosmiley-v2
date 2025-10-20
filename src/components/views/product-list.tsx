// @/components/views/product-list.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { client } from '@/lib/sanity';
import type { SanityProduct, StructuredFilter } from '@/types';
import { ProductCard } from '../product-card';
import { ProductCardSkeleton } from '../skeletons/product-card-skeleton';
import { useAppContext } from '@/context/app-context';
import { EmptyState } from '../empty-state';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileSearchControls } from '../mobile-search-controls';
import { FilterContainer } from '../filter-container';
import { Button } from '../ui/button';

const PRODUCTS_PER_PAGE = 8;

const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-low-to-high", label: "Price: Low to High" },
    { value: "price-high-to-low", label: "Price: High to Low" },
    { value: "new-arrivals", label: "New Arrivals" },
];

interface ProductListProps {
  isMobile: boolean | undefined;
  filters: StructuredFilter[];
  activeFilters: { type: string; value: string; label: string }[];
  onRemoveFilter: (filterType: string, value: string) => void;
  onFilterChange: (categoryKey: string, optionTitle: string, checked: boolean) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onPriceCheckboxChange: (range: string, isChecked: boolean) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
}

export function ProductList({
  isMobile,
  filters,
  activeFilters,
  onRemoveFilter,
  onFilterChange,
  onPriceRangeChange,
  onPriceCheckboxChange,
  sortOption,
  onSortChange,
}: ProductListProps) {
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cart, updateCart, setFlavourSelection, setIsGlobalLoading } = useAppContext();
  
  const query = searchParams.get('q') || '';
  
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const fetchProducts = useCallback(async (pageNum: number, isNewFilter = false) => {
    if (isNewFilter) {
      setProducts([]);
      setPage(0);
    }
    setIsLoading(true);
    setIsInitialLoad(isNewFilter || pageNum === 0);

    const start = isNewFilter ? 0 : pageNum * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    
    const filterClauses: string[] = ['_type == "product"'];
    const params: { [key: string]: any } = {};

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const priceRanges = searchParams.getAll('priceRange');

    if (query) {
        const searchWords = query.trim().toLowerCase().split(/\s+/).filter(w => w);
        if (searchWords.length > 0) {
            const wordFilters = searchWords.map((word, index) => {
                const wordParam = `word${index}`;
                params[wordParam] = word;
                return `(
                    lower(name) match "*"+$${wordParam}+"*" ||
                    pt::text(description) match "*"+$${wordParam}+"*" ||
                    count(tags[lower(@) match "*"+$${wordParam}+"*"]) > 0 ||
                    count(availableFlavours[references(*[_type=="flavour" && lower(name) match "*"+$${wordParam}+"*"]._id)]) > 0 ||
                    lower(bestFor) match "*"+$${wordParam}+"*"
                )`;
            });
            filterClauses.push(`(${wordFilters.join(' || ')})`);
        }
    }
    
    // Handle price filters
    if (priceRanges.length > 0) {
        const rangeClauses = priceRanges.map((range, index) => {
            const [min, max] = range.split('-').map(Number);
            const minParam = `rangeMin${index}`;
            const maxParam = `rangeMax${index}`;
            params[minParam] = min;
            params[maxParam] = max;
            return `(discountedPrice >= $${minParam} && discountedPrice <= $${maxParam})`;
        });
        filterClauses.push(`(${rangeClauses.join(' || ')})`);
    } else if (minPrice && maxPrice) {
        params.minPrice = Number(minPrice);
        params.maxPrice = Number(maxPrice);
        filterClauses.push(`(discountedPrice >= $minPrice && discountedPrice <= $maxPrice)`);
    }

    searchParams.forEach((value, key) => {
      if (key !== 'q' && key !== 'sort' && key !== 'minPrice' && key !== 'maxPrice' && key !== 'priceRange') {
        const paramName = `${key.replace(/-/g, '_')}_${value.replace(/[^a-zA-Z0-9]/g, '')}`;
        params[paramName] = value;
        if (key === 'flavours-fillings') {
           filterClauses.push(`(
                count(availableFlavours[references(*[_type=="flavour" && name == $${paramName}]._id)]) > 0
                || $${paramName} in tags[]
            )`);
        } else {
           filterClauses.push(`count(filterTags[references(*[_type=="filterOption" && title == $${paramName}]._id)]) > 0`);
        }
      }
    });

    let orderString = '';
    switch (sortOption) {
      case 'price-low-to-high': orderString = '| order(discountedPrice asc)'; break;
      case 'price-high-to-low': orderString = '| order(discountedPrice desc)'; break;
      case 'new-arrivals': orderString = '| order(_createdAt desc)'; break;
      default: orderString = '| order(_createdAt desc)'; break;
    }
    
     const groqQuery = `*[${filterClauses.join(' && ')}] ${orderString} [${start}...${end}] {
        _id, name, slug, mrp, discountedPrice, weight, packageType, composition, isOutOfStock, "images": images[].asset->url, "filterOptions": filterOptions[]->{title, "category": category->title},
        "availableFlavours": availableFlavours[]-> | order(orderRank) { _id, name, "imageUrl": image.asset->url, "price": coalesce(price, 0) },
        numberOfChocolates, bestFor, "tags": tags[].value
      }`;

    try {
      const newProducts = await client.fetch<SanityProduct[]>(groqQuery, params);
      setProducts(prev => isNewFilter ? newProducts : [...prev, ...newProducts]);
      setPage(isNewFilter ? 1 : pageNum + 1);
      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [searchParams, sortOption, query]);

  useEffect(() => {
    fetchProducts(0, true);
  }, [searchParams, sortOption]);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && !isLoading && hasMore) {
      fetchProducts(page);
    }
  }, [isLoading, hasMore, page, fetchProducts]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { rootMargin: "200px" });
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [handleObserver]);
  
  const onProductCardAddToCart = (product: SanityProduct) => {
    const prevQuantity = cart[product.name]?.quantity || 0;
    if (prevQuantity === 0 && product.availableFlavours && product.availableFlavours.length > 0) {
      setFlavourSelection({ product, isOpen: true });
    } else {
      updateCart(product.name, prevQuantity + 1);
    }
  };

  const onProductCardRemoveFromCart = (product: SanityProduct) => {
    const prevQuantity = cart[product.name]?.quantity || 0;
    if (prevQuantity > 0) {
      updateCart(product.name, prevQuantity - 1);
    }
  };
  
  const handleContinueShopping = () => {
    setIsGlobalLoading(true);
    router.push('/');
  }

  const handleSortChange = (value: string) => {
    onSortChange(value);
    if (isMobile) {
      setIsSortSheetOpen(false);
    }
  };

  const renderSkeletons = () => {
    const skeletonCount = isMobile && isInitialLoad ? 8 : isMobile && !isInitialLoad ? 2 : isInitialLoad ? 8 :  4;
    return Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={`skeleton-${i}`} />);
  };
  
  const headerContent = (
    <>
      <div className="flex justify-between items-center text-white">
        {isInitialLoad ? (<h2 className="mb:text-lg lg:text-xl">
          Searching results for <span className="italic text-custom-gold">{query || 'all products'}</span>
        </h2>) : (
          <h2 className="mb:text-lg lg:text-xl">
            Showing results for <span className="italic text-custom-gold">{query || 'all products'}</span>
          </h2>
        )}
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[240px] rounded-full bg-white text-custom-purple-dark border-2 border-custom-purple-dark h-9 focus:ring-0 focus:ring-offset-0 text-sm">
            <SelectValue>
              Sort By: {sortOptions.find(o => o.value === sortOption)?.label || 'Featured'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white text-custom-purple-dark">
              {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                      {option.label}
                  </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex gap-2 mt-4 flex-nowrap overflow-x-auto no-scrollbar">
           {activeFilters.map(filter => (
                <div key={`${filter.type}-${filter.value}`} className="flex-shrink-0 flex items-center bg-custom-gold text-custom-purple-dark rounded-full px-3 py-1 text-sm font-medium">
                  <span>{filter.label}</span>
                  <button
                    onClick={() => onRemoveFilter(filter.type, filter.value)}
                    className="ml-2 -mr-1.5 p-1 rounded-full hover:bg-black/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
        </div>
      )}
    </>
  );

  const mainContent = (
    <>
      {isInitialLoad ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {renderSkeletons()}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() => onProductCardAddToCart(product)}
              onRemoveFromCart={() => onProductCardRemoveFromCart(product)}
              quantity={cart[product.name]?.quantity || 0}
            />
          ))}
          {hasMore && renderSkeletons()}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full pt-24">
          <EmptyState
            imageUrl="/icons/empty.png"
            title="No Products Found"
            description="Didn’t find what you’re looking for? Call us to customise your personalised gift!"
            buttonText="Continue Shopping"
            onButtonClick={handleContinueShopping}
          />
        </div>
      )}
      <div ref={loaderRef} style={{ height: '10px' }} />
    </>
  );
  
  if (isMobile) {
    return (
      <div className="flex flex-col flex-grow h-full">
        <MobileSearchControls
          query={query}
          isFilterSheetOpen={isFilterSheetOpen}
          onFilterSheetOpenChange={setIsFilterSheetOpen}
          isSortSheetOpen={isSortSheetOpen}
          onSortSheetOpenChange={setIsSortSheetOpen}
        >
          <FilterContainer
            filters={filters}
            isMobile={true}
            onFilterChange={onFilterChange}
            onPriceRangeChange={onPriceRangeChange}
            onPriceCheckboxChange={onPriceCheckboxChange}
          />
          <div className="flex flex-col p-4">
            {sortOptions.map(option => (
              <Button
                key={option.value}
                variant="ghost"
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  "justify-start text-base py-3 h-auto",
                  sortOption === option.value && "font-bold text-custom-gold"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </MobileSearchControls>
  
        <div className="flex-grow overflow-y-auto no-scrollbar">
          {activeFilters.length > 0 && (
            <div className="flex-shrink-0 px-4 pt-2">
              <div className="flex gap-2 flex-nowrap overflow-x-auto no-scrollbar">
                {activeFilters.map(filter => (
                  <div key={`${filter.type}-${filter.value}`} className="flex-shrink-0 flex items-center bg-custom-gold text-custom-purple-dark rounded-full px-2.5 py-0.5 text-xs font-medium">
                    <span>{filter.label}</span>
                    <button
                      onClick={() => onRemoveFilter(filter.type, filter.value)}
                      className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-black/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 pb-20 px-4">
            {mainContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 rounded-t-[40px] flex flex-col flex-grow min-h-0">
        <div className="flex-shrink-0 px-8 pt-6 pb-4">
          {headerContent}
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar pt-4 pb-8 min-h-0 px-8">
            {mainContent}
        </div>
    </div>
  );
}
