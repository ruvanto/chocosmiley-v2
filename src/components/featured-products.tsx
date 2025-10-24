
// @/components/featured-products.tsx
'use client';

import { FeaturedProductCard } from './cards/featured-product-card';
import { SectionTitle } from './section-title';
import type { SanityProduct } from '@/types';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import Link from 'next/link';

interface FeaturedProductsProps {
  products: SanityProduct[];
  onProductClick: (product: SanityProduct) => void;
  onAddToCart: (product: SanityProduct) => void;
  onRemoveFromCart: (product: SanityProduct) => void;
  cart: Record<string, { name: string; quantity: number; flavours?: string[] }>;
  isMobile?: boolean;
}

export function FeaturedProducts({
  products,
  onProductClick,
  onAddToCart,
  onRemoveFromCart,
  cart,
  isMobile = false,
}: FeaturedProductsProps) {
  const router = useRouter();
  useAppContext();

  const handleViewMore = () => {
    router.push('/search?q=');
  };

  return (
    <div className={cn(
      "bg-white/20 rounded-[20px] lg:rounded-[40px] px-4 py-6 sm:px-6 sm:py-4 lg:px-8",
    )}>
      <SectionTitle className={cn(
        "text-white",
        isMobile ? "mb-4 text-base px-2" : "md:mb-4 lg:mb-6 text-xl lg:text-2xl"
      )}>
        You might also like
      </SectionTitle>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {products.map(product => (
          <div key={product._id} className={cn("flex-shrink-0", isMobile ? "w-40" : "w-56")}>
            <Link href={`/product/${product.slug.current}`} onClick={(e) => { e.preventDefault(); onProductClick(product); }} className="aspect-[3/4] h-full w-full block">
              <FeaturedProductCard
                product={product}
                onProductClick={() => onProductClick(product)}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                quantity={cart[product.name]?.quantity || 0}
              />
            </Link>
          </div>
        ))}
        <div className={cn("flex-shrink-0", isMobile ? "w-40" : "w-56")}>
          <div className="flex aspect-[3/4] h-full w-full">
            <Button
              variant="outline"
              onClick={handleViewMore}
              className="w-full h-full bg-white/20 border-2 border-dashed border-white/50 text-white hover:bg-white/30 hover:text-white flex flex-col items-center justify-center gap-2 rounded-2xl"
            >
              <div className={cn("rounded-full bg-white/20 flex items-center justify-center", isMobile ? "h-12 w-12" : "h-16 w-16")}>
                  <ChevronRight className={cn(isMobile ? "h-8 w-8" : "h-10 w-10")} />
              </div>
              <span className={cn("font-semibold", isMobile ? "text-base" : "text-lg")}>View More</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
