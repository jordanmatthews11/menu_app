import type { Category, CategoryDoc } from '../types';
import { fetchCategories } from '../services/firestoreService';
import { parseAndGroupCategories } from '../utils/csvParser';

let categoriesCache: Category[] | null = null;

/**
 * Group raw CategoryDoc rows (one per category-country) into
 * merged Category objects (one per category name).
 */
function groupCategoryDocs(docs: CategoryDoc[]): Category[] {
  const map = new Map<string, Category>();

  docs.forEach((doc) => {
    const key = doc.name.toLowerCase();

    if (map.has(key)) {
      const existing = map.get(key)!;
      if (doc.country && !existing.countries.includes(doc.country)) {
        existing.countries.push(doc.country);
      }
      // Merge descriptions
      if (doc.description && !existing.description.includes(doc.description)) {
        existing.description = existing.description
          ? `${existing.description} | ${doc.description}`
          : doc.description;
      }
      // Merge brands
      const existingBrands = new Set(
        existing.exampleBrands.split(',').map((b) => b.trim()).filter(Boolean)
      );
      if (doc.exampleBrands) {
        doc.exampleBrands.split(',').forEach((b) => {
          const trimmed = b.trim();
          if (trimmed) existingBrands.add(trimmed);
        });
      }
      existing.exampleBrands = Array.from(existingBrands).join(', ');

      if (doc.department && !existing.department) existing.department = doc.department;
      if (doc.subDepartment && !existing.subDepartment) existing.subDepartment = doc.subDepartment;
      if (doc.notes && !existing.notes) existing.notes = doc.notes;
    } else {
      map.set(key, {
        id: doc.id,
        name: doc.name,
        countries: doc.country ? [doc.country] : [],
        department: doc.department || '',
        subDepartment: doc.subDepartment || '',
        description: doc.description || '',
        exampleBrands: doc.exampleBrands || '',
        notes: doc.notes || '',
        number: doc.number || '',
        premium: doc.premium ?? false,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Load categories -- tries Firestore first, falls back to CSV.
 */
export async function loadCategories(): Promise<Category[]> {
  if (categoriesCache) return categoriesCache;

  try {
    const docs = await fetchCategories();
    if (docs.length > 0) {
      categoriesCache = groupCategoryDocs(docs);
      return categoriesCache;
    }
  } catch (err) {
    console.warn('Firestore unavailable, falling back to CSV:', err);
  }

  // Fallback to CSV
  try {
    const response = await fetch('/categories-export.csv');
    if (response.ok) {
      const csvContent = await response.text();
      categoriesCache = parseAndGroupCategories(csvContent);
      return categoriesCache;
    }
  } catch (error) {
    console.error('Error loading categories from CSV:', error);
  }

  return [];
}

export function getCategories(): Category[] {
  return categoriesCache || [];
}

/** Invalidate cache so the next load re-fetches from Firestore */
export function invalidateCategoriesCache(): void {
  categoriesCache = null;
}

export const categories: Category[] = [];
