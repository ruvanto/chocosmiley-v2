
// @/app/product/[slug]/page.tsx
import { client } from '@/lib/sanity';
import type { SanityProduct } from '@/types';
import { notFound } from 'next/navigation';
import ProductClientPage from '@/app/product/[slug]/product-client-page';

export const revalidate = 300; // Revalidate this page at most every 300 seconds

async function getProduct(slug: string): Promise<SanityProduct | null> {
    const query = `*[_type == "product" && slug.current == $slug][0]{
        ...,
        isOutOfStock,
        "images": images[].asset->url,
        "availableFlavours": availableFlavours[]-> | order(orderRank) {
            _id,
            name,
            "imageUrl": image.asset->url,
            "price": coalesce(price, 0)
        },
        numberOfChocolates,
        bestFor,
        "tags": tags[].value
    }`;
    const product = await client.fetch(query, { slug });
    return product;
}

async function getFeaturedProducts(currentProduct: SanityProduct): Promise<SanityProduct[]> {
    const currentProductId = currentProduct._id;
    const currentProductTags = currentProduct.tags || [];

    // Prioritize products with matching tags
    const query = `*[_type == "product" && _id != $currentProductId && count((tags[].value)[@ in $currentProductTags]) > 0] | order(_createdAt desc)[0...4]{
        _id,
        name,
        slug,
        mrp,
        discountedPrice,
        weight,
        packageType,
        composition,
        isOutOfStock,
        "images": images[].asset->url,
        "availableFlavours": availableFlavours[]-> | order(orderRank) {
            _id,
            name,
            "imageUrl": image.asset->url,
            "price": coalesce(price, 0)
        },
        numberOfChocolates,
        bestFor,
        "tags": tags[].value
    }`;
    
    let products = await client.fetch(query, { currentProductId, currentProductTags });

    // If not enough tagged products are found, fill with other random products
    if (products.length < 5) {
        const remaining = 5 - products.length;
        const existingIds = [currentProductId, ...products.map((p: SanityProduct) => p._id)];
        
        const fallbackQuery = `*[_type == "product" && !(_id in $existingIds)] | order(_createdAt desc)[0...${remaining}]{
            _id, name, slug, mrp, discountedPrice, weight, packageType, composition, isOutOfStock, "images": images[].asset->url,
            "availableFlavours": availableFlavours[]-> | order(orderRank) {_id, name, "imageUrl": image.asset->url, "price": coalesce(price, 0)},
            numberOfChocolates, bestFor, "tags": tags[].value
        }`;
        
        const fallbackProducts = await client.fetch(fallbackQuery, { existingIds });
        products = [...products, ...fallbackProducts];
    }
    
    return products;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug);

    if (!product) {
        notFound();
    }

    const featuredProducts = await getFeaturedProducts(product);

    return (
        <ProductClientPage 
            product={product} 
            featuredProducts={featuredProducts || []} 
        />
    );
}
