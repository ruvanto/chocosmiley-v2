
// @/components/mobile/mobile-search-header.tsx
'use client';

import { Input } from "@/components/ui/input";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface MobileSearchHeaderProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isVisible: boolean;
}

export function MobileSearchHeader({ value, onChange, onSubmit, isVisible }: MobileSearchHeaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSubmit(e);
        inputRef.current?.blur();
    }

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 bg-background h-16 flex items-center px-4 border-b border-white/20 transition-transform duration-300 ease-in-out",
            isVisible ? "translate-y-0" : "-translate-y-full"
        )}>
            <form onSubmit={handleSubmit} className="w-full">
                 <div className="relative flex items-center">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                         <Image src="/icons/search_icon.png" alt="Search" width={24} height={24} onDragStart={(e) => e.preventDefault()} />
                     </div>
                     <Input
                        ref={inputRef}
                        name="search"
                        autoComplete="off"
                        value={value}
                        onChange={onChange}
                        placeholder={'Search for gifts...'}
                        enterKeyHint="search"
                        className={cn(
                            `w-full pl-11 pr-10 h-10 rounded-full bg-white border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-base text-black`
                        )}
                        readOnly
                    />
                 </div>
            </form>
        </header>
    );
}
