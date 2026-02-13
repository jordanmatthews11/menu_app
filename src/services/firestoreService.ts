import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CategoryDoc, StoreListDoc, StoreListRetailer, Booster, AuthorizedUser, CustomCategoryCode } from '../types';

// ============================
// Categories
// ============================

const CATEGORIES_COL = 'categories';

export async function fetchCategories(): Promise<CategoryDoc[]> {
  const snap = await getDocs(collection(db, CATEGORIES_COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CategoryDoc));
}

export async function addCategory(data: Omit<CategoryDoc, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, CATEGORIES_COL), data);
  return ref.id;
}

export async function updateCategory(id: string, data: Partial<Omit<CategoryDoc, 'id'>>): Promise<void> {
  await updateDoc(doc(db, CATEGORIES_COL, id), data);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

// ============================
// Store Lists
// ============================

const STORELISTS_COL = 'storeLists';

export async function fetchStoreLists(): Promise<StoreListDoc[]> {
  const snap = await getDocs(collection(db, STORELISTS_COL));
  return snap.docs.map((d) => {
    const raw = d.data();
    return {
      id: d.id,
      name: raw.name ?? '',
      country: raw.country ?? '',
      retailers: (raw.retailers ?? []).map((r: StoreListRetailer) => ({
        id: r.id ?? '',
        retailer: r.retailer ?? '',
        weeklyQuota: Number(r.weeklyQuota) || 0,
        monthlyQuota: Number(r.monthlyQuota) || 0,
      })),
    } as StoreListDoc;
  });
}

export async function addStoreList(data: Omit<StoreListDoc, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, STORELISTS_COL), data);
  return ref.id;
}

export async function updateStoreList(id: string, data: Partial<Omit<StoreListDoc, 'id'>>): Promise<void> {
  await updateDoc(doc(db, STORELISTS_COL, id), data);
}

export async function deleteStoreList(id: string): Promise<void> {
  await deleteDoc(doc(db, STORELISTS_COL, id));
}

// ============================
// Boosters
// ============================

const BOOSTERS_COL = 'boosters';

export async function fetchBoosters(): Promise<Booster[]> {
  const snap = await getDocs(collection(db, BOOSTERS_COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booster));
}

export async function addBooster(data: Omit<Booster, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, BOOSTERS_COL), data);
  return ref.id;
}

export async function updateBooster(id: string, data: Partial<Omit<Booster, 'id'>>): Promise<void> {
  await updateDoc(doc(db, BOOSTERS_COL, id), data);
}

export async function deleteBooster(id: string): Promise<void> {
  await deleteDoc(doc(db, BOOSTERS_COL, id));
}

// ============================
// Authorized Users
// ============================

const USERS_COL = 'authorizedUsers';

export async function fetchAuthorizedUsers(): Promise<AuthorizedUser[]> {
  const snap = await getDocs(collection(db, USERS_COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuthorizedUser));
}

export async function addAuthorizedUser(data: Omit<AuthorizedUser, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, USERS_COL), data);
  return ref.id;
}

export async function updateAuthorizedUser(id: string, data: Partial<Omit<AuthorizedUser, 'id'>>): Promise<void> {
  await updateDoc(doc(db, USERS_COL, id), data);
}

export async function deleteAuthorizedUser(id: string): Promise<void> {
  await deleteDoc(doc(db, USERS_COL, id));
}

// ============================
// Custom Category Codes
// ============================

const CUSTOM_CODES_COL = 'customCategoryCodes';

export async function fetchCustomCodes(): Promise<CustomCategoryCode[]> {
  const snap = await getDocs(collection(db, CUSTOM_CODES_COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CustomCategoryCode));
}

export async function addCustomCode(data: Omit<CustomCategoryCode, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, CUSTOM_CODES_COL), data);
  return ref.id;
}

export async function updateCustomCode(id: string, data: Partial<Omit<CustomCategoryCode, 'id'>>): Promise<void> {
  await updateDoc(doc(db, CUSTOM_CODES_COL, id), data);
}

export async function deleteCustomCode(id: string): Promise<void> {
  await deleteDoc(doc(db, CUSTOM_CODES_COL, id));
}

// ============================
// Batch seeding helpers
// ============================

export async function batchWriteCategories(categories: Omit<CategoryDoc, 'id'>[]): Promise<number> {
  let written = 0;
  // Firestore batch max is 500
  for (let i = 0; i < categories.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = categories.slice(i, i + 450);
    chunk.forEach((cat) => {
      const ref = doc(collection(db, CATEGORIES_COL));
      batch.set(ref, cat);
    });
    await batch.commit();
    written += chunk.length;
  }
  return written;
}

export async function batchWriteStoreLists(storeLists: Omit<StoreListDoc, 'id'>[]): Promise<number> {
  let written = 0;
  for (let i = 0; i < storeLists.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = storeLists.slice(i, i + 450);
    chunk.forEach((sl) => {
      const ref = doc(collection(db, STORELISTS_COL));
      batch.set(ref, sl);
    });
    await batch.commit();
    written += chunk.length;
  }
  return written;
}

export async function batchWriteBoosters(boosters: Omit<Booster, 'id'>[]): Promise<number> {
  let written = 0;
  for (let i = 0; i < boosters.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = boosters.slice(i, i + 450);
    chunk.forEach((b) => {
      const ref = doc(collection(db, BOOSTERS_COL));
      batch.set(ref, b);
    });
    await batch.commit();
    written += chunk.length;
  }
  return written;
}

export async function batchWriteCustomCodes(codes: Omit<CustomCategoryCode, 'id'>[]): Promise<number> {
  let written = 0;
  for (let i = 0; i < codes.length; i += 450) {
    const batch = writeBatch(db);
    const chunk = codes.slice(i, i + 450);
    chunk.forEach((c) => {
      const ref = doc(collection(db, CUSTOM_CODES_COL));
      batch.set(ref, c);
    });
    await batch.commit();
    written += chunk.length;
  }
  return written;
}
