
// @/components/animated-search-bar.tsx
'use client';

import { useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ActiveView } from "@/types";

interface AnimatedSearchBarProps {
  onSearchSubmit: (query: string) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  className?: string;
  isSearchingOnAbout: boolean;
  activeView: ActiveView;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onFocus?: () => void;
  isClickOnly?: boolean;
}

export function AnimatedSearchBar({ 
  onSearchSubmit,
  isExpanded,
  onExpandedChange,
  className,
  searchInput,
  onSearchInputChange,
  onFocus,
  isClickOnly = false,
}: AnimatedSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isClickOnly) return;
    if (!searchInput.trim()) {
        toast({
            title: "Empty Field",
            description: "Search field cannot be empty.",
            variant: "destructive",
        });
        return;
    }
    onSearchSubmit(searchInput);
  };
  
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (searchInput) {
      onSearchInputChange("");
      inputRef.current?.focus(); // Keep focus after clearing
    } else {
      onExpandedChange(false);
    }
  };

  if (!isExpanded) return null;

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-center w-full", className)}>
      <div
        className="flex items-center h-9 sm:h-10 md:h-11 rounded-full bg-white text-black shadow-lg overflow-hidden w-full origin-top animate-slide-down-fade"
      >
        <div className="flex items-center w-full h-full">
            <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <Image src="/icons/search_icon.png" alt="Search" width={28} height={28} onDragStart={(e) => e.preventDefault()} priority />
            </div>

            <div className="flex-1 flex items-center pr-2">
                <input
                    ref={inputRef}
                    type="search"
                    autoComplete="off"
                    placeholder="Search for gifts..."
                    value={searchInput}
                    onChange={(e) => onSearchInputChange(e.target.value)}
                    onFocus={onFocus}
                    enterKeyHint="search"
                    className="w-full bg-transparent outline-none text-black placeholder:text-gray-500 text-base md:text-lg"
                    onClick={(e) => e.stopPropagation()}
                    readOnly={isClickOnly}
                />
                <button
                    type="button"
                    onClick={handleCloseClick}
                    className="p-2 hover:bg-gray-200 rounded-full"
                    aria-label="Clear or close search"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
      </div>
    </form>
  );
}
