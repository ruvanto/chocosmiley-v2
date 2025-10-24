
// @/components/mobile/mobile-search-controls.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Separator } from '../ui/separator';

interface MobileSearchControlsProps {
    query: string;
    isFilterSheetOpen: boolean;
    onFilterSheetOpenChange: (open: boolean) => void;
    isSortSheetOpen: boolean;
    onSortSheetOpenChange: (open: boolean) => void;
    children: [React.ReactNode, React.ReactNode]; // Expects two children: [FilterContent, SortContent]
}

export function MobileSearchControls({
    query,
    isFilterSheetOpen,
    onFilterSheetOpenChange,
    isSortSheetOpen,
    onSortSheetOpenChange,
    children,
}: MobileSearchControlsProps) {

    const [filterContent, sortContent] = children;

    return (
        <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-lg flex-shrink-0">
            <div className="flex items-center justify-between p-2 px-4 text-white gap-4">
                <div className="flex-1 min-w-0">
                     <p className="text-sm font-medium">
                        {query ? (
                            <>
                                Showing results for <span className="text-custom-gold font-semibold italic">{query}</span>
                            </>
                        ) : (
                            'Showing all products'
                        )}
                    </p>
                </div>
                <div className="flex items-center flex-shrink-0">
                     <Sheet open={isSortSheetOpen} onOpenChange={onSortSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="h-9 px-3 gap-2 text-sm hover:bg-white/10 hover:text-white">
                                <ArrowUpDown className="h-4 w-4" />
                                Sort
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="bg-custom-purple-dark text-white border-t-2 border-custom-gold rounded-t-3xl h-auto p-0">
                            <SheetHeader className="p-4 border-b border-white/20">
                                <SheetTitle className="text-white text-center">Sort By</SheetTitle>
                                <SheetDescription className="sr-only">A dialog for sorting products.</SheetDescription>
                            </SheetHeader>
                            {sortContent}
                        </SheetContent>
                    </Sheet>
                    
                    <Separator orientation="vertical" className="h-5 bg-white/20" />

                    <Sheet open={isFilterSheetOpen} onOpenChange={onFilterSheetOpenChange}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="h-9 px-3 gap-2 text-sm hover:bg-white/10 hover:text-white">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-custom-purple-dark text-white border-l-2 border-custom-gold w-3/4 max-w-sm p-0">
                            <SheetHeader className="p-4 border-b border-white/20">
                                <SheetTitle className="text-white text-center">Filters</SheetTitle>
                                <SheetDescription className="sr-only">A dialog for filtering products.</SheetDescription>
                            </SheetHeader>
                            {filterContent}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <Separator className="bg-white/10" />
        </div>
    );
}
