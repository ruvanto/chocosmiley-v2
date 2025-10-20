
// @/components/header/search-bar.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActiveView } from "@/types";
import { X } from 'lucide-react';

interface SearchBarProps {
    activeView: ActiveView;
    isEnquireOpen: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>, searchInput: string) => void;
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onFocus: () => void;
}

const textsToType = ["Corporate gifts", "Family presents", "Festive gifts", "Anniversary specials"];

// Function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array: string[]) => {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array]; // Create a copy
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
};

export function SearchBar({ activeView, onSubmit, searchInput, onSearchInputChange, onFocus }: SearchBarProps) {
    const [placeholder, setPlaceholder] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const type = useCallback((shuffledTexts: string[]) => {
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeoutId: NodeJS.Timeout;

        const performTyping = () => {
            if (activeView !== 'home') return;
            const currentText = shuffledTexts[textIndex];
            const displayedText = isDeleting
                ? currentText.substring(0, charIndex - 1)
                : currentText.substring(0, charIndex + 1);

            setPlaceholder(displayedText);

            if (!isDeleting && displayedText === currentText) {
                isDeleting = true;
                timeoutId = setTimeout(performTyping, 2000); 
            } else if (isDeleting && displayedText === "") {
                isDeleting = false;
                charIndex = 0;
                textIndex = (textIndex + 1) % shuffledTexts.length;
                timeoutId = setTimeout(performTyping, 500);
            } else {
                charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
                timeoutId = setTimeout(performTyping, isDeleting ? 100 : 150);
            }
        };

        timeoutId = setTimeout(performTyping, 200);

        return () => clearTimeout(timeoutId);
    }, [activeView]);

    useEffect(() => {
        // Shuffle the array and then start the typing animation
        const shuffled = shuffleArray(textsToType);
        const cleanup = type(shuffled);
        return cleanup;
    }, [type]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSubmit(e, searchInput);
        if (inputRef.current) {
            inputRef.current.blur(); // Dismiss the keyboard
        }
    };
    
    return (
        <div className={cn(
            "transition-all duration-500 ease-in-out mt-8 sm:mt-12 md:mt-16",
        )}>
            <form 
                onSubmit={handleSubmit} 
                className={cn(`relative mx-auto transition-all duration-500 ease-in-out animate-slide-down`
                )}
                style={{ 
                    animationDuration: '0.5s', animationDelay: '0.05s'
                }}
            >
                <div className="absolute inset-0 rounded-full bg-white -z-10"></div>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <Image src="/icons/search_icon.png" alt="Search" width={28} height={28} onDragStart={(e) => e.preventDefault()} priority />
                </div>
                <div className="relative flex items-center">
                    <Input
                        ref={inputRef}
                        name="search"
                        type="search"
                        autoComplete="off"
                        value={searchInput}
                        onChange={(e) => onSearchInputChange(e.target.value)}
                        onFocus={onFocus}
                        placeholder={activeView !== 'home' ? 'Search for gifts...' : placeholder}
                        enterKeyHint="search"
                        className={`w-full pl-12 pr-10 h-9 md:h-10 lg:h-11 rounded-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-base md:text-lg text-black`}
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => onSearchInputChange('')}
                            className="absolute right-3 p-2 hover:bg-gray-200 rounded-full"
                            aria-label="Clear search"
                        >
                            <X size={20} className="text-gray-600"/>
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
