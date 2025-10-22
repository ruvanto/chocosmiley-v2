
// @/components/header/logo.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface LogoProps {
    onLogoClick: () => void;
    isEnquireOpen: boolean;
}

export function Logo({ onLogoClick, isEnquireOpen }: LogoProps) {
    const isMobile = useIsMobile();
    return (
        <div className={cn("flex items-center gap-2 md:gap-4 lg:gap-8 transition-opacity duration-100", !isMobile && "animate-slide-in-from-left")} style={{ animationDuration: '0.5s' }}>
            <Link href="/" className="flex items-center gap-2" onClick={onLogoClick}>
                <Image 
                    src="/Choco Smiley Logo.png" 
                    alt="Choco Smiley Logo" 
                    width={250} 
                    height={100}
                    className={cn("w-28 sm:w-32 md:w-36 lg:w-44", isEnquireOpen && "opacity-50")}
                    onDragStart={(e) => e.preventDefault()}
                    priority
                />
            </Link>
            <Image 
                src="/Online Chocolate Store.png" 
                alt="Online Chocolate Store" 
                width={120} 
                height={55}
                className={cn("w-20 md:w-24 lg:w-32", isEnquireOpen && "opacity-50")}
                onDragStart={(e) => e.preventDefault()}
                priority
            />
        </div>
    );
}
