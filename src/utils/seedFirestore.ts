import { parseCSVGeneric, parseStoreLists } from './csvParser';
import {
  batchWriteCategories,
  batchWriteStoreLists,
  batchWriteBoosters,
  batchWriteCustomCodes,
  fetchCategories,
  fetchStoreLists,
  fetchBoosters,
  fetchCustomCodes,
} from '../services/firestoreService';
import type { CategoryDoc, StoreListDoc, CustomCategoryCode } from '../types';

export interface SeedResult {
  categories: number;
  storeLists: number;
  boosters: number;
  customCodes: number;
  skippedCategories: boolean;
  skippedStoreLists: boolean;
  skippedBoosters: boolean;
  skippedCustomCodes: boolean;
}

/**
 * Seed Firestore from the existing CSV files in public/.
 * Skips a collection if it already has data (to avoid duplicates).
 */
export async function seedFirestoreFromCSVs(
  force = false
): Promise<SeedResult> {
  const result: SeedResult = {
    categories: 0,
    storeLists: 0,
    boosters: 0,
    customCodes: 0,
    skippedCategories: false,
    skippedStoreLists: false,
    skippedBoosters: false,
    skippedCustomCodes: false,
  };

  // --- Categories ---
  const existingCats = await fetchCategories();
  if (existingCats.length > 0 && !force) {
    result.skippedCategories = true;
  } else {
    const resp = await fetch('/categories-export.csv');
    if (resp.ok) {
      const csv = await resp.text();
      const rows = parseCSVGeneric(csv);
      const docs: Omit<CategoryDoc, 'id'>[] = rows
        .filter((r) => (r.name || '').trim())
        .map((r) => ({
          name: (r.name || '').trim(),
          country: (r.country || '').trim(),
          department: (r.department || '').trim(),
          subDepartment: (r.subDepartment || '').trim(),
          description: (r.description || '').trim(),
          exampleBrands: (r.exampleBrands || '').trim(),
          notes: (r.notes || '').trim(),
          number: (r.number || '').trim(),
          premium: r.premium === 'true',
        }));
      result.categories = await batchWriteCategories(docs);
    }
  }

  // --- Store Lists ---
  const existingSL = await fetchStoreLists();
  if (existingSL.length > 0 && !force) {
    result.skippedStoreLists = true;
  } else {
    const resp = await fetch('/storelists-export.csv');
    if (resp.ok) {
      const csv = await resp.text();
      // Reuse the existing parser that groups by name+country
      const lists = parseStoreLists(csv);
      const docs: Omit<StoreListDoc, 'id'>[] = lists.map((sl) => ({
        name: sl.name,
        country: sl.country,
        retailers: sl.retailers.map((r) => ({
          id: r.id,
          retailer: r.retailer,
          weeklyQuota: r.weeklyQuota,
          monthlyQuota: r.monthlyQuota,
        })),
      }));
      result.storeLists = await batchWriteStoreLists(docs);
    }
  }

  // --- Boosters ---
  const existingB = await fetchBoosters();
  if (existingB.length > 0 && !force) {
    result.skippedBoosters = true;
  } else {
    const resp = await fetch('/boosters-export.csv');
    if (resp.ok) {
      const csv = await resp.text();
      const rows = parseCSVGeneric(csv);
      const docs = rows
        .filter((r) => (r.name || '').trim() && (r.country || '').trim())
        .map((r) => ({
          name: (r.name || '').trim(),
          country: (r.country || '').trim(),
        }));
      result.boosters = await batchWriteBoosters(docs);
    }
  }

  // --- Custom Category Codes ---
  const existingCC = await fetchCustomCodes();
  if (existingCC.length > 0 && !force) {
    result.skippedCustomCodes = true;
  } else {
    const resp = await fetch('/customcategorycodes-export.csv');
    if (resp.ok) {
      const csv = await resp.text();
      const rows = parseCSVGeneric(csv);
      const docs: Omit<CustomCategoryCode, 'id'>[] = rows
        .filter((r) => (r.categoryCode || '').trim())
        .map((r) => ({
          categoryCode: (r.categoryCode || '').trim(),
          customer: (r.customer || '').trim(),
          category: (r.category || '').trim(),
          submittedBy: (r.submittedBy || '').trim(),
          notes: (r.notes || '').trim(),
          jobIds: (r.jobIds || '').trim(),
          codeType: (r.codeType || 'Custom').trim(),
          timestamp: (r.timestamp || '').trim(),
        }));
      result.customCodes = await batchWriteCustomCodes(docs);
    }
  }

  return result;
}
