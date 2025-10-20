
// @/components/empty-state.tsx
'use client';

import Image from "next/image";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    imageUrl: string;
    title: string;
    description: string;
    buttonText?: string;
    onButtonClick?: () => void;
    imageClassName?: string;
    containerClassName?: string;
    showButton?: boolean;
}

export function EmptyState({ 
    imageUrl, 
    title, 
    description, 
    buttonText, 
    onButtonClick,
    imageClassName,
    containerClassName,
    showButton = true,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center gap-2 h-full", containerClassName)}>
            <Image
                src={imageUrl}
                alt="Empty state illustration"
                width={128}
                height={128}
                className={cn("w-24 h-24 md:w-32 md:h-32", imageClassName)}
                onDragStart={(e) => e.preventDefault()}
            />
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            <p className="text-sm md:text-base text-white/70 max-w-xs">{description}</p>
            {showButton && buttonText && onButtonClick && (
              <Button 
                  onClick={onButtonClick} 
                  className="mt-2 bg-custom-gold text-custom-purple-dark hover:bg-custom-gold/90 rounded-full px-8 font-bold"
              >
                  {buttonText}
              </Button>
            )}
        </div>
    );
}
