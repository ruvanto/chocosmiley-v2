
// src/components/views/SearchView.tsx
'use client';

import { FilterContainer } from '@/components/filter-container';
import { cn } from '@/lib/utils';
import type { SanityProduct, StructuredFilter } from '@/types';
import { ProductList } from './product-list';

interface SearchViewProps {
  filters: StructuredFilter[];
  isMobile: boolean | undefined;
  onFilterChange: (categoryKey: string, optionTitle: string, checked: boolean) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onPriceCheckboxChange: (range: string, isChecked: boolean) => void;
  activeFilters: { type: string; value: string; label: string }[];
  onRemoveFilter: (type: string, value: string) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
}

export function SearchView({
  filters,
  isMobile,
  onFilterChange,
  onPriceRangeChange,
  onPriceCheckboxChange,
  activeFilters,
  onRemoveFilter,
  sortOption,
  onSortChange,
}: SearchViewProps) {
  
  return (
    <div className="flex w-full items-start h-full flex-grow min-h-0">
      <div className="hidden md:block w-full md:w-auto md:sticky md:top-0 md:w-[17%] h-full">
        <FilterContainer 
          filters={filters}
          onFilterChange={onFilterChange}
          onPriceRangeChange={onPriceRangeChange}
          onPriceCheckboxChange={onPriceCheckboxChange}
        />
      </div>
      <div className={cn("h-full flex-grow md:ml-6 lg:ml-8 md:mr-6 lg:mr-8 relative flex flex-col min-h-0 w-full md:w-auto", isMobile ? "px-0" : "px-4 md:px-0")}>
        <ProductList
          isMobile={isMobile}
          filters={filters}
          activeFilters={activeFilters}
          onRemoveFilter={onRemoveFilter}
          onFilterChange={onFilterChange}
          onPriceRangeChange={onPriceRangeChange}
          onPriceCheckboxChange={onPriceCheckboxChange}
          sortOption={sortOption}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
}
