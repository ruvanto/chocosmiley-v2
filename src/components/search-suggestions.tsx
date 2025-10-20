
// @/components/search-suggestions.tsx
'use client';

import type { SanityProduct } from '@/types';
import type { TrendingSuggestion } from '@/app/actions';
import Image from 'next/image';
import { Loader } from './loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingSuggestions } from './trending-suggestions';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from './ui/separator';
import { client } from '@/lib/sanity';

interface SearchSuggestionsProps {
  productSuggestions: SanityProduct[];
  trendingSuggestions: TrendingSuggestion[];
  isLoading: boolean;
  onProductClick: (product: SanityProduct) => void;
  onTrendingClick: (searchQuery: string) => void;
  onClose: () => void;
  hasSearchInput: boolean;
  searchInput: string;
  searchContainerRef: React.RefObject<HTMLElement>;
  isMobileSearchView?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0, y: -10 }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const getMatchDetails = (product: SanityProduct, query: string, allFlavourNames: Set<string>) => {
    if (!query) return null;
    const searchWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    for (const word of searchWords) {
        if (word.length <= 1 && searchWords.length > 1) continue;

        const matchingFlavour = product.availableFlavours?.find(f => f.name.toLowerCase().includes(word));
        if (matchingFlavour) {
            return { type: 'flavour', value: matchingFlavour.name };
        }

        const matchingTag = product.tags?.find(t => t.toLowerCase().includes(word));
        if (matchingTag) {
            if (allFlavourNames.has(matchingTag.toLowerCase())) {
                return { type: 'flavour', value: matchingTag };
            }
            return { type: 'tag', value: matchingTag };
        }
        
        const bestForArray = Array.isArray(product.bestFor) ? product.bestFor : (product.bestFor ? [product.bestFor] : []);
        const matchingBestFor = bestForArray.find(b => b.toLowerCase().includes(word));
        if (matchingBestFor) {
            return { type: 'bestFor', value: matchingBestFor };
        }
    }

    return null;
}


export function SearchSuggestions({ 
  productSuggestions, 
  trendingSuggestions,
  isLoading, 
  onProductClick, 
  onTrendingClick,
  onClose, 
  hasSearchInput,
  searchInput,
  searchContainerRef,
  isMobileSearchView = false,
}: SearchSuggestionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [allFlavours, setAllFlavours] = useState<{ _id: string; title: string }[]>([]);

  useEffect(() => {
    const fetchAllFlavours = async () => {
      try {
        const flavours = await client.fetch(`*[_type == "flavour"]{_id, "title": name}`);
        setAllFlavours(flavours);
      } catch (error) {
        console.error('Failed to fetch all flavours:', error);
      }
    };
    fetchAllFlavours();
  }, []);

  const allFlavourNames = useMemo(() => new Set(allFlavours.map(f => f.title.toLowerCase())), [allFlavours]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, searchContainerRef]);

  const mobileContainerClasses = "bg-white/90 backdrop-blur-md rounded-lg mt-2 shadow-lg border border-white/20";
  const desktopContainerClasses = "bg-white/90 backdrop-blur-md rounded-2xl shadow-lg mt-2 border border-white/20";

  const showProductSuggestions = hasSearchInput && productSuggestions.length > 0;
  const showTrendingSuggestions = trendingSuggestions.length > 0;

  const sortedSuggestions = [...productSuggestions].sort((a, b) => {
    const aMatch = getMatchDetails(a, searchInput, allFlavourNames);
    const bMatch = getMatchDetails(b, searchInput, allFlavourNames);

    if (aMatch && !bMatch) {
      return -1;
    }
    if (!aMatch && bMatch) {
      return 1;
    }
    return 0;
  });
  
  const mobileSuggestionItem = (product: SanityProduct) => {
    const match = getMatchDetails(product, searchInput, allFlavourNames);
    return (
        <li
          key={product._id}
          onClick={() => onProductClick(product)}
          className="flex items-center gap-4 p-2 cursor-pointer rounded-lg hover:bg-black/20"
        >
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={product.images?.[0] || '/placeholder.png'}
              alt={product.name}
              fill
              sizes="40px"
              className="object-cover rounded-md"
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold truncate text-sm text-white">{product.name}</span>
             {match?.type === 'flavour' && (
                <span className='text-xs font-medium truncate text-custom-gold'>
                    {`Contains ${match.value}`}
                </span>
            )}
            {match?.type === 'tag' && (
                <span className='text-xs font-medium truncate text-custom-gold'>
                    {`in "${match.value}"`}
                </span>
            )}
            {match?.type === 'bestFor' && (
                <span className='text-xs font-medium truncate text-custom-gold'>
                    {`Best for ${match.value}`}
                </span>
            )}
          </div>
        </li>
    )
  };
  
  const desktopSuggestionItem = (product: SanityProduct) => {
    const match = getMatchDetails(product, searchInput, allFlavourNames);
    return (
      <motion.li
        key={product._id}
        variants={itemVariants}
        onClick={() => onProductClick(product)}
        className={cn(
          "flex items-center gap-4 p-2 cursor-pointer rounded-lg",
          "text-black hover:bg-black/10"
        )}
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.name}
            fill
            sizes="40px"
            className="object-cover rounded-md"
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold truncate text-sm">{product.name}</span>
           {match?.type === 'flavour' && (
              <span className='text-xs font-medium truncate text-custom-purple-dark'>
                  {`Contains ${match.value}`}
              </span>
          )}
          {match?.type === 'tag' && (
              <span className='text-xs font-medium truncate text-custom-purple-dark'>
                  {`in "${match.value}"`}
              </span>
          )}
          {match?.type === 'bestFor' && (
              <span className='text-xs font-medium truncate text-custom-purple-dark'>
                  {`Best for ${match.value}`}
              </span>
          )}
        </div>
      </motion.li>
    )
  };

  if (isMobileSearchView) {
      return (
         <ul className='text-white'>
              {sortedSuggestions.map(mobileSuggestionItem)}
         </ul>
      );
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "absolute top-full w-full overflow-hidden z-20",
          isMobile ? mobileContainerClasses : desktopContainerClasses
        )}
      >
        <div className={cn(
          "max-h-[70vh] md:max-h-96 overflow-y-auto custom-scrollbar p-2"
        )}>
          {hasSearchInput && (
            isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="text-custom-purple-dark" />
              </div>
            ) : showProductSuggestions ? (
              <motion.ul variants={containerVariants}>
                {sortedSuggestions.map(desktopSuggestionItem)}
              </motion.ul>
            ) : (
              <p className="p-4 text-center text-gray-600">
                No products found for &quot;{searchInput}&quot;.
              </p>
            )
          )}
          
          {hasSearchInput && showTrendingSuggestions && <Separator className="my-2 bg-black/10" />}

          {showTrendingSuggestions && (
            <TrendingSuggestions
              suggestions={trendingSuggestions}
              onSuggestionClick={onTrendingClick}
              isMobile={isMobile}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
