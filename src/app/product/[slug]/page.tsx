
// @/app/product/[slug]/page.tsx
import { client } from '@/lib/sanity';
import type { SanityProduct } from '@/types';
import { notFound } from 'next/navigation';
import ProductClientPage from '@/app/product/[slug]/product-client-page';
import { Metadata } from 'next';
import type { PortableTextBlock } from '@portabletext/react';


export const revalidate = 300; // Revalidate this page at most every 300 seconds

// Helper to convert Sanity's Portable Text to plain text for meta descriptions
function portableTextToString(blocks: PortableTextBlock[] | undefined) {
    if (!blocks) {
      return ""
    }
    return blocks
      .filter(block => block._type === 'block' && block.children)
      .map(block => block.children.map((child: any) => child.text).join(''))
      .join(' ')
      .substring(0, 155) // Truncate to a good length for descriptions
  }

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
        description,
        "tags": tags[].value
    }`;
    const product = await client.fetch(query, { slug });
    return product;
}

// --- ADD THIS FUNCTION ---
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const product = await getProduct(params.slug);
  
    if (!product) {
      return {
        title: 'Product Not Found | ChocoSmiley',
        description: 'The product you are looking for is not available.',
      }
    }
  
    const description = portableTextToString(product.description) || `Order ${product.name} from ChocoSmiley. Handcrafted, delicious chocolates.`;
  
    return {
      title: `${product.name} | ChocoSmiley`,
      description: description,
      openGraph: { // For social media sharing
        title: `${product.name} | ChocoSmiley`,
        description: description,
        images: [
          {
            url: product.images?.[0] || '/splash-screen-logo.png',
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
        type: 'website',
      },
      twitter: { // For Twitter sharing
        card: 'summary_large_image',
        title: `${product.name} | ChocoSmiley`,
        description: description,
        images: [product.images?.[0] || '/splash-screen-logo.png'],
      },
      alternates: {
        canonical: `https://www.chocosmiley.com/product/${params.slug}`,
      },
    };
  }
  // --- END OF NEW FUNCTION ---

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
