// @/components/featured-products.tsx
'use client';

import { FeaturedProductCard } from './featured-product-card';
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
  onAddToCart: (product: SanityProduct) => void;
  onRemoveFromCart: (product: SanityProduct) => void;
  cart: Record<string, { name: string; quantity: number; flavours?: string[] }>;
  isMobile?: boolean;
}

export function FeaturedProducts({
  products,
  onAddToCart,
  onRemoveFromCart,
  cart,
  isMobile = false,
}: FeaturedProductsProps) {
  const router = useRouter();
  const { setIsGlobalLoading } = useAppContext();

  const handleProductClick = (e: React.MouseEvent, product: SanityProduct) => {
    // Only trigger client-side navigation for left clicks without modifier keys
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        setIsGlobalLoading(true);
        router.push(`/product/${product.slug.current}`);
    }
  };

  const handleViewMoreClick = (e: React.MouseEvent) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      setIsGlobalLoading(true);
      router.push('/search?q=');
    }
  }

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
      
      {isMobile ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {products.map(product => (
            <div key={product._id} className="w-40 flex-shrink-0">
              <div className="aspect-[3/4] h-full w-full">
                <FeaturedProductCard
                  product={product}
                  onProductClick={(e) => handleProductClick(e, product)}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  quantity={cart[product.name]?.quantity || 0}
                />
              </div>
            </div>
          ))}
          <div className="w-40 flex-shrink-0">
             <Link href="/search?q=" onClick={handleViewMoreClick} className="flex aspect-[3/4] h-full w-full">
                <Button
                  variant="outline"
                  className="w-full h-full bg-white/20 border-2 border-dashed border-white/50 text-white hover:bg-white/30 hover:text-white flex flex-col items-center justify-center gap-2 rounded-2xl"
                  asChild
                >
                  <div>
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                        <ChevronRight className="h-8 w-8" />
                    </div>
                    <span className="font-semibold text-base">View More</span>
                  </div>
                </Button>
              </Link>
          </div>
        </div>
      ) : (
        <div className="flex md:gap-4 lg:gap-6 overflow-x-auto no-scrollbar md:pb-2 lg:pb-4">
          {products.map(product => (
            <div key={product._id} className="w-56 flex-shrink-0">
               <div className="aspect-[3/4] h-full w-full">
                <FeaturedProductCard
                  product={product}
                  onProductClick={(e) => handleProductClick(e, product)}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  quantity={cart[product.name]?.quantity || 0}
                />
              </div>
            </div>
          ))}
          <div className="w-56 flex-shrink-0">
            <Link href="/search?q=" onClick={handleViewMoreClick} className="flex aspect-[3/4] h-full w-full">
             <Button
              variant="outline"
              className="w-full h-full bg-white/20 border-2 border-dashed border-white/50 text-white hover:bg-white/30 hover:text-white flex flex-col items-center justify-center gap-2 rounded-2xl"
              asChild
            >
              <div>
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight className="h-10 w-10" />
                </div>
                <span className="font-semibold text-lg">View More</span>
              </div>
            </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
