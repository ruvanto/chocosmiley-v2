

'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SanityFlavour } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface FlavourCardProps {
  flavour: SanityFlavour;
  onToggle: () => void;
  isSelected: boolean;
}

export function FlavourCard({ flavour, onToggle, isSelected }: FlavourCardProps) {
  const isMobile = useIsMobile();
  const [isImageLoading, setIsImageLoading] = useState(true);


  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <div 
      className={cn(
        "flex flex-col justify-center bg-white/30 p-2 rounded-[10px] w-28 md:py-4 md:px-2 lg:p-2 md:rounded-[15px] lg:rounded-[20px] w-[calc(38%-0.75rem)] md:w-[calc(33%-0.75rem)] lg:w-[calc(33%-0.75rem)] xl:w-[calc(28%-0.75rem)] flex-shrink-0 transition-transform duration-200 self-center"
      )}
    >
      <div className="relative w-full aspect-square">
         {isImageLoading && <div className="absolute inset-0 bg-black/10 animate-pulse rounded-full" />}
        <Image
          src={flavour.imageUrl}
          alt={flavour.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            "rounded-full object-cover transition-opacity duration-300",
            isImageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
          data-ai-hint={flavour.name}
          onDragStart={(e) => e.preventDefault()}
        />
        <div className="absolute top-1.5 left-1.5 z-10 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            +₹{(flavour.price || 0).toFixed(0)}
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-white text-xs lg:text-sm font-normal h-10 flex items-center justify-center">{flavour.name}</p>
        <div className="mt-2 flex justify-center px-2 md:px-0 lg:px-2 h-7 relative">
          <Button
            size="sm"
            onClick={handleToggle}
            className={cn(
              "h-7 w-full rounded-[10px] xl:rounded-full uppercase border-2 border-b-[3px] text-xs transition-colors duration-300",
              isSelected
                ? 'bg-custom-purple-dark border-custom-purple-dark text-white'
                : 'bg-white border-custom-purple-dark text-custom-purple-dark',
              isMobile
                ? (isSelected ? 'hover:bg-custom-purple-dark hover:text-white' : 'hover:bg-white hover:text-custom-purple-dark')
                : 'hover:bg-custom-purple-dark hover:text-white'
            )}
          >
            {isSelected ? 'ADDED' : 'ADD'}
          </Button>
        </div>
      </div>
    </div>
  );
}
