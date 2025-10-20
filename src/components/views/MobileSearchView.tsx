
// @/components/views/MobileSearchView.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SearchSuggestions } from '../search-suggestions';
import { getProductSuggestions, type TrendingSuggestion } from '@/app/actions';
import type { SanityProduct } from '@/types';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import { TrendingSuggestions } from '../trending-suggestions';
import { Loader } from '../loader';

interface MobileSearchViewProps {
    isOpen: boolean;
    onClose: () => void;
    initialSearch: string;
    onSearch: (query: string) => void;
    trendingSuggestions: TrendingSuggestion[];
}

export function MobileSearchView({ isOpen, onClose, initialSearch, onSearch, trendingSuggestions }: MobileSearchViewProps) {
    const [inputValue, setInputValue] = useState(initialSearch);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { setIsGlobalLoading } = useAppContext();
    const searchContainerRef = useRef<HTMLFormElement>(null);


    const [suggestions, setSuggestions] = useState<SanityProduct[]>([]);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
    
    useEffect(() => {
        if (isOpen) {
            setInputValue(initialSearch);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialSearch]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    const handleProductClick = (product: SanityProduct) => {
      onClose();
      setIsGlobalLoading(true);
      router.push(`/product/${product.slug.current}`);
    };
    
    const handleTrendingClick = (searchQuery: string) => {
        onSearch(searchQuery);
    };

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setIsSuggestionsLoading(true);
        const result = await getProductSuggestions(query);
        setSuggestions(result);
        setIsSuggestionsLoading(false);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (isOpen) {
                fetchSuggestions(inputValue);
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, fetchSuggestions, isOpen]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
    }

    const hasSearchInput = inputValue.length > 0;

    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[100] bg-background flex flex-col"
                >
                    <header className="flex items-center p-2 h-16 border-b border-white/20 flex-shrink-0 px-4">
                         <form onSubmit={handleSubmit} className="w-full relative" ref={searchContainerRef}>
                             <div className="relative flex items-center">
                                 <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                                     <Image src="/icons/search_icon.png" alt="Search" width={24} height={24} onDragStart={(e) => e.preventDefault()} priority />
                                 </div>
                                 <Input
                                    ref={inputRef}
                                    name="search"
                                    type="search"
                                    autoComplete="off"
                                    value={inputValue}
                                    onChange={handleInputChange}
                                    placeholder={'Search for gifts...'}
                                    enterKeyHint="search"
                                    className={cn(
                                        `w-full pl-11 pr-10 h-10 rounded-full bg-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-base text-black`
                                    )}
                                />
                                {inputValue && (
                                    <button
                                        type="button"
                                        onClick={() => setInputValue('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full"
                                        aria-label="Clear search"
                                    >
                                        <X size={18} className="text-gray-600"/>
                                    </button>
                                )}
                             </div>
                        </form>
                    </header>

                    <main className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-6">
                        {isSuggestionsLoading ? (
                            <div className="flex justify-center pt-8">
                                <Loader className="text-custom-gold"/>
                            </div>
                        ) : hasSearchInput && suggestions.length > 0 ? (
                           <SearchSuggestions
                                productSuggestions={suggestions}
                                trendingSuggestions={[]}
                                isLoading={false}
                                onProductClick={handleProductClick}
                                onTrendingClick={() => {}}
                                onClose={() => {}}
                                hasSearchInput={true}
                                searchInput={inputValue}
                                searchContainerRef={searchContainerRef}
                                isMobileSearchView={true}
                            />
                        ) : null}

                        {hasSearchInput && !isSuggestionsLoading && suggestions.length === 0 && (
                            <p className="text-center text-white/70 pt-8">No products found for &quot;{inputValue}&quot;</p>
                        )}
                        
                        {trendingSuggestions.length > 0 && (
                            <TrendingSuggestions
                                suggestions={trendingSuggestions}
                                onSuggestionClick={handleTrendingClick}
                                isMobileSearchView={true}
                            />
                        )}
                    </main>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
