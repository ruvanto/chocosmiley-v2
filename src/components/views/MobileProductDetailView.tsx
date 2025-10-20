
// @/components/views/MobileProductDetailView.tsx
'use client';

import type { SanityProduct, WishlistItem } from '@/types';
import { cn } from '@/lib/utils';
import { MobileImageGallery } from '../mobile-image-gallery';
import { ProductInfoCard } from '../product-info-card';
import { FeaturedProducts } from '../featured-products';

type Cart = Record<string, {
  name: string;
  quantity: number;
  flavours?: string[];
}>;

interface MobileProductDetailViewProps {
  product: SanityProduct;
  featuredProducts: SanityProduct[];
  onClose: () => void;
  cart: Cart;
  onAddToCart: (name: string, quantity: number, flavours?: string[]) => void;
  onBuyNow: () => void;
  isLiked: boolean;
  onLikeToggle: (productId: string) => void;
  onRemoveFromCart: (product: SanityProduct) => void;
  onFeaturedProductAddToCart: (product: SanityProduct) => void;
  onImageExpand: (index: number) => void;
  likedProducts: WishlistItem[];
  onProductClick: (product: SanityProduct) => void;
}

export function MobileProductDetailView({ 
  product, 
  featuredProducts,
  onClose, 
  cart, 
  onAddToCart, 
  onBuyNow, 
  isLiked,
  onLikeToggle,
  onRemoveFromCart,
  onFeaturedProductAddToCart,
  onImageExpand,
  likedProducts,
  onProductClick,
}: MobileProductDetailViewProps) {
  const productQuantity = cart[product.name]?.quantity || 0;
  
  return (
    <div className={cn("flex flex-col")}>
      <MobileImageGallery product={product} onImageExpand={onImageExpand} />
      <div className='-mt-8'>
        <ProductInfoCard 
          product={product}
          isLiked={isLiked}
          onLikeToggle={() => onLikeToggle(product._id)}
        />
      </div>

       <div className="p-4">
        <FeaturedProducts 
          products={featuredProducts}
          onAddToCart={onFeaturedProductAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          cart={cart}
          isMobile={true}
          onProductClick={onProductClick}
        />
      </div>
    </div>
  );
}
