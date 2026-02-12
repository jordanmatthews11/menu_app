import type { StoreList } from '../types';
import { parseStoreLists } from '../utils/csvParser';

let storeListsCache: StoreList[] | null = null;

export async function loadStoreLists(): Promise<StoreList[]> {
  if (storeListsCache) {
    return storeListsCache;
  }

  try {
    const response = await fetch('/storelists-export.csv');
    if (!response.ok) {
      throw new Error(`Failed to load store lists: ${response.statusText}`);
    }

    const csvContent = await response.text();
    storeListsCache = parseStoreLists(csvContent);
    return storeListsCache;
  } catch (error) {
    console.error('Error loading store lists:', error);
    return [];
  }
}

export function getStoreLists(): StoreList[] {
  return storeListsCache || [];
}
