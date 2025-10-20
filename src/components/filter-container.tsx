
// @/components/filter-container.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { FilterControls } from './filter-controls';
import type { StructuredFilter } from '@/types';
import { useState, useEffect } from 'react';

interface FilterContainerProps {
    filters: StructuredFilter[];
    isMobile?: boolean;
    onFilterChange: (categoryKey: string, optionTitle: string, checked: boolean) => void;
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceCheckboxChange: (range: string, isChecked: boolean) => void;
}

function formatCategoryTitleToKey(title: string) {
    return title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
}

export function FilterContainer({ 
    filters, 
    isMobile = false,
    onFilterChange,
    onPriceRangeChange,
    onPriceCheckboxChange 
}: FilterContainerProps) {
    const searchParams = useSearchParams();

    // Local state for instant UI feedback on Sanity filters
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    // Local state for instant UI feedback on price checkboxes
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

    // Sync local state with URL search params when they change
    useEffect(() => {
        const newSelectedFilters: Record<string, string[]> = {};
        filters.forEach(category => {
            const categoryKey = formatCategoryTitleToKey(category.title);
            const values = searchParams.getAll(categoryKey);
            if (values.length > 0) {
                newSelectedFilters[categoryKey] = values;
            }
        });
        setSelectedFilters(newSelectedFilters);

        // Also sync price ranges for price checkboxes
        const priceRanges = searchParams.getAll('priceRange');
        setSelectedPriceRanges(priceRanges);

    }, [searchParams, filters]);

    const handleFilterChange = (categoryKey: string, optionTitle: string, checked: boolean) => {
        // Optimistically update local state for instant UI feedback
        setSelectedFilters(prev => {
            const newValues = checked 
                ? [...(prev[categoryKey] || []), optionTitle]
                : (prev[categoryKey] || []).filter(v => v !== optionTitle);
            
            const newState = { ...prev };
            if (newValues.length > 0) {
                newState[categoryKey] = newValues;
            } else {
                delete newState[categoryKey];
            }
            return newState;
        });
        onFilterChange(categoryKey, optionTitle, checked);
    };

    const handlePriceCheckboxChange = (rangeString: string, isChecked: boolean) => {
        // Optimistic UI update for price checkboxes
        setSelectedPriceRanges(prev => {
            if (isChecked) {
                return [...prev, rangeString];
            } else {
                return prev.filter(r => r !== rangeString);
            }
        });
        onPriceCheckboxChange(rangeString, isChecked);
    };

    return (
        <FilterControls 
            structuredFilters={filters}
            isMobile={isMobile}
            searchParams={searchParams}
            selectedFilters={selectedFilters}
            selectedPriceRanges={selectedPriceRanges}
            onFilterChange={handleFilterChange}
            onPriceRangeChange={onPriceRangeChange}
            onPriceCheckboxChange={handlePriceCheckboxChange}
        />
    );
}
