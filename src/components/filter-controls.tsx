// @/components/filter-controls.tsx
'use client';

import { cn } from "@/lib/utils";
import { SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { StructuredFilter } from "@/types";
import { ReadonlyURLSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";

const FilterSection = ({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
        {icon && <div className="w-5 h-5 flex items-center justify-center">{icon}</div>}
        <h3 className="text-base text-white font-bold font-plex-sans-condensed">{title}</h3>
    </div>
    <div className="space-y-2 pl-0">{children}</div>
  </div>
);

const CheckboxItem = ({ id, label, checked, onCheckedChange, count }: { id: string, label: string, checked: boolean, onCheckedChange: (checked: boolean) => void, count?: number }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="border-white/50"
      />
      <Label htmlFor={id} className="text-white font-plex-sans text-sm flex-grow">
        {label}
      </Label>
      {count !== undefined && <span className="text-white/70 text-xs font-plex-sans">({count})</span>}
    </div>
);

interface FilterControlsProps {
    structuredFilters: StructuredFilter[];
    isMobile?: boolean;
    searchParams: ReadonlyURLSearchParams;
    selectedFilters: Record<string, string[]>;
    selectedPriceRanges: string[];
    onFilterChange: (categoryKey: string, optionTitle: string, checked: boolean) => void;
    onPriceRangeChange: (range: [number, number]) => void;
    onPriceCheckboxChange: (range: string, isChecked: boolean) => void;
}

function formatCategoryTitleToKey(title: string) {
    return title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
}

const priceOptions = [
    { id: '0-500', title: 'Under ₹500', range: [0, 500] },
    { id: '500-1000', title: '₹500 - ₹1000', range: [500, 1000] },
    { id: '1000-1500', title: '₹1000 - ₹1500', range: [1000, 1500] },
    { id: '1500-2000', title: '₹1500 - ₹2000', range: [1500, 2000] },
    { id: '2000-9999', title: 'Above ₹2000', range: [2000, 9999] },
];


export function FilterControls({ 
    structuredFilters, 
    isMobile = false,
    searchParams,
    selectedFilters,
    selectedPriceRanges,
    onFilterChange,
    onPriceRangeChange,
    onPriceCheckboxChange
}: FilterControlsProps) {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    const [sliderValue, setSliderValue] = useState<[number, number]>([
        minPrice ? Number(minPrice) : 0,
        maxPrice ? Number(maxPrice) : 3000
    ]);
    
    const isSliderDisabled = selectedPriceRanges.length > 0;

    useEffect(() => {
        if (!isSliderDisabled) {
            const min = minPrice ? Number(minPrice) : 0;
            const max = maxPrice ? Number(maxPrice) : 3000;
            setSliderValue([min, max]);
        }
    }, [minPrice, maxPrice, isSliderDisabled]);

    const handleSliderCommit = (value: number[]) => {
        if (!isSliderDisabled) {
            onPriceRangeChange(value as [number, number]);
        }
    };
    
    const handleCheckboxChange = (rangeString: string, isChecked: boolean) => {
        onPriceCheckboxChange(rangeString, isChecked);
    };

    const allFilters = structuredFilters;

    const content = (
        <div className="space-y-6">
            <div className={cn("space-y-2", isSliderDisabled && "opacity-50")}>
                <p className="text-sm text-white/80 font-poppins">Price</p>
                <p className="text-base text-white font-semibold font-plex-sans">
                    ₹{sliderValue[0]} - ₹{sliderValue[1]}
                </p>
                <Slider
                    value={sliderValue}
                    onValueChange={(value) => setSliderValue(value as [number, number])}
                    onValueCommit={handleSliderCommit}
                    max={3000}
                    step={100}
                    className="w-full"
                    disabled={isSliderDisabled}
                />
            </div>

             <FilterSection title="Price Range">
                {priceOptions.map((option) => {
                    const rangeString = `${option.range[0]}-${option.range[1]}`;
                    return (
                        <CheckboxItem
                            key={option.id}
                            id={`${isMobile ? 'mobile-' : ''}${option.id}`}
                            label={option.title}
                            checked={selectedPriceRanges.includes(rangeString)}
                            onCheckedChange={(checked) => handleCheckboxChange(rangeString, !!checked)}
                        />
                    );
                })}
            </FilterSection>
            
            {allFilters.map((filterCategory) => {
                const categoryKey = formatCategoryTitleToKey(filterCategory.title);
                return (
                    <FilterSection
                        key={filterCategory._id}
                        title={filterCategory.title}
                        icon={filterCategory.icon ? <Image src={filterCategory.icon} alt={filterCategory.title} width={18} height={18} /> : undefined}
                    >
                        {filterCategory.options.map((option) => {
                            const isChecked = (selectedFilters[categoryKey] || []).includes(option.title);
                            return (
                                <CheckboxItem
                                    key={option._id}
                                    id={`${isMobile ? 'mobile-' : ''}${option._id}`}
                                    label={option.title}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => onFilterChange(categoryKey, option.title, !!checked)}
                                />
                            )
                        })}
                    </FilterSection>
                )
            })}
        </div>
    );
    

    if (isMobile) {
        return (
            <div className="h-full flex flex-col py-4">
                <ScrollArea className="flex-grow min-h-0 px-6 mb-16">
                    {content}
                </ScrollArea>
            </div>
        );
    }

    return (
        <div className={cn("bg-custom-gray-dark shadow-custom-dark h-full w-full md:rounded-tr-[25px] lg:rounded-tr-[40px] animate-slide-in-from-left")} style={{ animationDuration: '0.5s' }}>
            <div className="bg-white/20 h-full w-full md:rounded-tr-[25px] lg:rounded-tr-[40px] md:pt-4 lg:pt-6 md:pl-4 lg:pl-6 xl:pt-8 xl:pl-8">
                <div className="h-full overflow-y-auto custom-scrollbar pr-8 pb-8">
                    <div className="flex items-center text-white font-bold mb-6 text-base xl:text-lg">
                        <SlidersHorizontal className="h-4 w-4 xl:h-6 xl:w-6 mr-3 flex-shrink-0" />
                        <h2 className="h-full w-full font-poppins">Filters & Sorting</h2>
                    </div>
                    {content}
                </div>
            </div>
        </div>
    );
}
