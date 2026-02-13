import type { StoreList } from '../types';
import { fetchStoreLists } from '../services/firestoreService';
import { parseStoreLists } from '../utils/csvParser';

let storeListsCache: StoreList[] | null = null;

/**
 * Load store lists -- tries Firestore first, falls back to CSV.
 */
export async function loadStoreLists(): Promise<StoreList[]> {
  if (storeListsCache) return storeListsCache;

  try {
    const docs = await fetchStoreLists();
    if (docs.length > 0) {
      storeListsCache = docs
        .map((d) => ({
          name: d.name,
          country: d.country,
          retailers: d.retailers,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      return storeListsCache;
    }
  } catch (err) {
    console.warn('Firestore unavailable, falling back to CSV:', err);
  }

  // Fallback to CSV
  try {
    const response = await fetch('/storelists-export.csv');
    if (response.ok) {
      const csvContent = await response.text();
      storeListsCache = parseStoreLists(csvContent);
      return storeListsCache;
    }
  } catch (error) {
    console.error('Error loading store lists from CSV:', error);
  }

  return [];
}

export function getStoreLists(): StoreList[] {
  return storeListsCache || [];
}

/** Invalidate cache so the next load re-fetches from Firestore */
export function invalidateStoreListsCache(): void {
  storeListsCache = null;
}
