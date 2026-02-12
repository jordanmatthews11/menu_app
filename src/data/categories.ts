import type { Category } from '../types';
import { parseAndGroupCategories } from '../utils/csvParser';

let categoriesCache: Category[] | null = null;

/**
 * Load categories from CSV file
 */
export async function loadCategories(): Promise<Category[]> {
  if (categoriesCache) {
    return categoriesCache;
  }

  try {
    const response = await fetch('/categories-export.csv');
    if (!response.ok) {
      throw new Error(`Failed to load categories: ${response.statusText}`);
    }
    
    const csvContent = await response.text();
    categoriesCache = parseAndGroupCategories(csvContent);
    return categoriesCache;
  } catch (error) {
    console.error('Error loading categories:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get categories synchronously (returns cached data or empty array)
 */
export function getCategories(): Category[] {
  return categoriesCache || [];
}

// Export empty array as default for initial render
export const categories: Category[] = [];
