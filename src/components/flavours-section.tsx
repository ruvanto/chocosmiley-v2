
'use client';

import { useRef, useState, useEffect } from 'react';
import { FlavourCard } from './flavour-card';
import { SectionTitle } from './section-title';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';

interface FlavoursSectionProps {
  product: SanityProduct;
  isMobile?: boolean;
}

export function FlavoursSection({ product, isMobile = false }: FlavoursSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { flavourSelections, toggleFlavourSelection } = useAppContext();
  const { toast } = useToast();

  const availableFlavours = product.availableFlavours || [];
  const selectedFlavourNamesForProduct = flavourSelections[product.name] || [];

  // 🧭 Check scroll limits
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1
    );
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableFlavours.length === 0) return;
    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [availableFlavours]);

  const scroll = (dir: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.8;
    container.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handleToggleFlavour = (flavourName: string) => {
    const selected = selectedFlavourNamesForProduct.includes(flavourName);
    if (!selected && selectedFlavourNamesForProduct.length >= 3) {
      toast({
        title: 'Maximum Flavour Limit',
        description: 'You can select up to 3 flavours per box.',
        variant: 'destructive',
      });
      return;
    }
    toggleFlavourSelection(product.name, flavourName);
  };

  return (
    <div
      className={cn(
        'relative flex flex-col w-full animate-fade-in',
        isMobile
          ? 'bg-white/0 rounded-[15px] pt-2'
          : 'bg-[#5D2B79] md:rounded-[20px] lg:rounded-[30px] p-2 lg:p-4 h-ful'
      )}
      style={{ animationDuration: '0.5s', animationDelay: '0.2s', animationFillMode: 'both' }}
    >
      <SectionTitle
        className={cn(
          isMobile
            ? 'text-sm mb-3 pl-0 flex'
            : 'flex md:text-base lg:text-lg py-2 mb-0 pt-0 font-poppins'
        )}
      >
        Flavours & Fillings
      </SectionTitle>

      {availableFlavours.length > 0 ? (
        <div className="relative flex items-center w-full">
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto no-scrollbar gap-4 w-full scroll-smooth md:-ml-6 md:-mr-6"
          >
            {availableFlavours.map((flavour) => (
              <FlavourCard
                key={flavour._id}
                flavour={flavour}
                onToggle={() => handleToggleFlavour(flavour.name)}
                isSelected={selectedFlavourNamesForProduct.includes(flavour.name)}
              />
            ))}
          </div>

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center text-white/70 text-sm italic px-4">
          No customizable flavours available for this product.
        </div>
      )}
    </div>
  );
}
