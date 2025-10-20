
// @/components/trending-suggestions.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TrendingSuggestion } from '@/app/actions';
import { TrendingUp, Search } from 'lucide-react';

interface TrendingSuggestionsProps {
  suggestions: TrendingSuggestion[];
  onSuggestionClick: (searchQuery: string) => void;
  isMobile?: boolean;
  isMobileSearchView?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function TrendingSuggestions({ suggestions, onSuggestionClick, isMobileSearchView = false }: TrendingSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }
  
  const itemClasses = isMobileSearchView ? "text-white hover:bg-black/20" : "text-black hover:bg-black/10";
  const headerClasses = isMobileSearchView ? "text-white/80" : "text-black/70";
  
  return (
    <motion.div variants={containerVariants} className={cn("py-2", isMobileSearchView && "p-0")}>
      <h3 className={cn(
        "px-3 pb-1 text-xs flex items-center gap-2",
        headerClasses
      )}>
        <TrendingUp className="h-4 w-4" />
        Popular Searches
      </h3>
      <ul>
        {suggestions.map((suggestion) => (
          <motion.li
            key={suggestion._id}
            variants={itemVariants}
            onClick={() => onSuggestionClick(suggestion.searchQuery)}
            className={cn(
              "flex items-center gap-2 p-2 py-1.5 cursor-pointer rounded-lg",
              itemClasses
            )}
          >
            <Search className="h-4 w-4 text-inherit opacity-70" />
            <span className="font-normal text-base">{suggestion.title}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
