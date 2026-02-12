export interface Category {
  id: string;
  name: string;
  countries: string[];
  department: string;
  subDepartment: string;
  description: string;
  exampleBrands: string;
  notes: string;
  number: string;
  premium: boolean;
  descriptions?: string[]; // Internal use for merging
}

export interface StoreListRetailer {
  id: string;
  retailer: string;
  weeklyQuota: number;
  monthlyQuota: number;
}

export interface StoreList {
  name: string;
  country: string;
  retailers: StoreListRetailer[];
}

export interface Booster {
  id: string;
  name: string;
  country: string;
}

export interface CategoryConfig {
  categoryId: string;
  categoryName: string;
  country: string;
  selectedStoreLists: string[];
  selectedBoosters: string[];
  startDate: string;
  endDate: string;
  collectionNotes: string;
  proceedWithoutList: boolean;
}

export interface OrderEntry {
  id: string;
  category: string;
  country: string;
  retailer: string;
  type: 'standard' | 'booster';
  storeListName?: string;
  weeklyQuota?: number;
  monthlyQuota?: number;
  startDate: Date;
  endDate: Date;
  collectionNotes: string;
}

export interface Retailer {
  id: string;
  name: string;
}
