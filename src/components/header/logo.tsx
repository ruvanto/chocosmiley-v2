'use client';

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    onLogoClick: () => void;
    isEnquireOpen: boolean;
}

export function Logo({ onLogoClick, isEnquireOpen }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2 md:gap-4 lg:gap-8 transition-opacity duration-100")}>
            <h1 className="sr-only">Choco Smiley - Premium Online Chocolate Store</h1>
            
            <Link href="/" className="flex items-center gap-2" onClick={onLogoClick}>
                <Image 
                    src="/homepage-logo.png" 
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