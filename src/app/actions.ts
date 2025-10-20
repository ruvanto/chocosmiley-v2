
'use server';

import { client } from '@/lib/sanity';
import type { SanityProduct } from '@/types';

export interface TrendingSuggestion {
  _id: string;
  title: string;
  searchQuery: string;
}

export async function getTrendingSuggestions(): Promise<TrendingSuggestion[]> {
  try {
    const suggestions = await client.fetch(`*[_type == "searchSuggestion"]{ _id, title, searchQuery }`);
    return suggestions || [];
  } catch (err) {
    console.error('Failed to fetch trending suggestions:', err);
    return [];
  }
}

export async function getProductSuggestions(query: string): Promise<SanityProduct[]> {
  if (!query.trim()) return [];

  const stopWords = ["a", "an", "the", "is", "in", "it", "of", "for", "on", "with", "to", "was", "and", "or", "but", "best"];
  const searchWords = new Set(query.trim().toLowerCase().split(/\s+/).filter(w => !stopWords.includes(w) && w));
  
  if (searchWords.size === 0) return [];

  // 1. Broadly fetch any product that matches at least one word in any key field.
  const wordFilters = Array.from(searchWords).map(word => 
    `lower(name) match "*${word}*" || lower(bestFor) match "*${word}*" || tags[] match "*${word}*"`
  ).join(' || ');

  const productQuery = `*[_type=="product" && (${wordFilters})]{
    _id, name, slug, "images": images[].asset->url, tags, bestFor,
    availableFlavours[]->{ name }
  }`;

  try {
    const products: SanityProduct[] = await client.fetch(productQuery);

    // 2. Score products using a weighted system based on match location.
    const scoredProducts = products.map(product => {
      const productNameLower = product.name.toLowerCase();
      const productBestForLower = product.bestFor?.toLowerCase() || '';
      const productTagsLower = product.tags?.map(tag => tag.toLowerCase()) || [];
      const productFlavoursLower = product.availableFlavours?.map(f => f.name.toLowerCase()) || [];

      let score = 0;
      let matchedWordsCount = 0;

      for (const word of searchWords) {
        let wordMatched = false;

        // **PRIORITY 1: Tags & Flavours (Highest Score)**
        if (productTagsLower.some(tag => tag.includes(word)) || productFlavoursLower.some(flavour => flavour.includes(word))) {
          score += 5;
          wordMatched = true;
        }

        // **PRIORITY 2: Product Name/Title (Medium Score)**
        if (productNameLower.includes(word)) {
          score += 3;
          wordMatched = true;
        }
        
        // **PRIORITY 3: "Best For" Field (Lowest Score)**
        if (productBestForLower.includes(word)) {
          score += 1;
          wordMatched = true;
        }

        if(wordMatched) {
            matchedWordsCount++;
        }
      }
      
      // **BONUS: Add a large bonus for matching ALL search words.**
      if (matchedWordsCount === searchWords.size) {
        score += 10;
      }

      return { ...product, score };
    });

    // 3. Sort by the new weighted score and return the top 5 results.
    return scoredProducts
      .filter(p => p.score > 0) // Ensure we only return products that have a score
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

  } catch (err) {
    console.error('Failed to fetch suggestions:', err);
    return [];
  }
}
