import type { Booster } from '../types';
import { fetchBoosters } from '../services/firestoreService';
import { parseBoosters } from '../utils/csvParser';

let boostersCache: Booster[] | null = null;

/**
 * Load boosters -- tries Firestore first, falls back to CSV.
 */
export async function loadBoosters(): Promise<Booster[]> {
  if (boostersCache) return boostersCache;

  try {
    const docs = await fetchBoosters();
    if (docs.length > 0) {
      boostersCache = docs.sort((a, b) => a.name.localeCompare(b.name));
      return boostersCache;
    }
  } catch (err) {
    console.warn('Firestore unavailable, falling back to CSV:', err);
  }

  // Fallback to CSV
  try {
    const response = await fetch('/boosters-export.csv');
    if (response.ok) {
      const csvContent = await response.text();
      boostersCache = parseBoosters(csvContent);
      return boostersCache;
    }
  } catch (error) {
    console.error('Error loading boosters from CSV:', error);
  }

  return [];
}

export function getBoosters(): Booster[] {
  return boostersCache || [];
}

/** Invalidate cache so the next load re-fetches from Firestore */
export function invalidateBoostersCache(): void {
  boostersCache = null;
}
