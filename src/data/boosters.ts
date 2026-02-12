import type { Booster } from '../types';
import { parseBoosters } from '../utils/csvParser';

let boostersCache: Booster[] | null = null;

export async function loadBoosters(): Promise<Booster[]> {
  if (boostersCache) {
    return boostersCache;
  }

  try {
    const response = await fetch('/boosters-export.csv');
    if (!response.ok) {
      throw new Error(`Failed to load boosters: ${response.statusText}`);
    }

    const csvContent = await response.text();
    boostersCache = parseBoosters(csvContent);
    return boostersCache;
  } catch (error) {
    console.error('Error loading boosters:', error);
    return [];
  }
}

export function getBoosters(): Booster[] {
  return boostersCache || [];
}
