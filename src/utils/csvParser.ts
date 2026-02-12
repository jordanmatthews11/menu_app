import type { Category, StoreList, StoreListRetailer, Booster } from '../types';

/**
 * Parse CSV line handling quoted fields with commas
 */
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Generic CSV parser - returns array of Record<string, string>
 */
export function parseCSVGeneric(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length - 1) continue; // Skip badly malformed rows

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Merge descriptions from different countries
 */
function mergeDescriptions(descriptions: string[]): string {
  const unique = Array.from(new Set(descriptions.filter(d => d && d.trim())));
  if (unique.length === 0) return '';
  if (unique.length === 1) return unique[0];
  return unique.join(' | ');
}

/**
 * Merge example brands from different countries
 */
function mergeExampleBrands(brands: string[]): string {
  const allBrands = new Set<string>();
  brands.forEach(brandStr => {
    if (brandStr && brandStr.trim()) {
      brandStr.split(',').forEach(b => {
        const cleaned = b.trim();
        if (cleaned) allBrands.add(cleaned);
      });
    }
  });
  return Array.from(allBrands).join(', ');
}

/**
 * Parse categories CSV and group by name
 */
export function parseAndGroupCategories(csvContent: string): Category[] {
  const rows = parseCSVGeneric(csvContent);
  const categoryMap = new Map<string, Category>();

  rows.forEach(row => {
    const name = (row.name || '').trim();
    if (!name) return;

    const key = name.toLowerCase();

    if (categoryMap.has(key)) {
      const existing = categoryMap.get(key)!;

      if (row.country && !existing.countries.includes(row.country)) {
        existing.countries.push(row.country);
      }

      const descriptions = [existing.description, row.description].filter(d => d);
      existing.description = mergeDescriptions(descriptions);

      const brands = [...existing.exampleBrands.split(',').map(b => b.trim()), row.exampleBrands].filter(b => b);
      existing.exampleBrands = mergeExampleBrands(brands);

      if (row.department && !existing.department) {
        existing.department = row.department;
      }
      if (row.subDepartment && !existing.subDepartment) {
        existing.subDepartment = row.subDepartment;
      }
      if (row.notes && !existing.notes) {
        existing.notes = row.notes;
      }
      if (row.number && existing.number !== row.number) {
        if (!existing.number.includes(row.number)) {
          existing.number = `${existing.number}, ${row.number}`;
        }
      }
    } else {
      const category: Category = {
        id: row.id || '',
        name: name,
        countries: row.country ? [row.country] : [],
        department: row.department || '',
        subDepartment: row.subDepartment || '',
        description: row.description || '',
        exampleBrands: row.exampleBrands || '',
        notes: row.notes || '',
        number: row.number || '',
        premium: row.premium === 'true',
      };
      categoryMap.set(key, category);
    }
  });

  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Parse store lists CSV and group by list name + country
 */
export function parseStoreLists(csvContent: string): StoreList[] {
  const rows = parseCSVGeneric(csvContent);
  const listMap = new Map<string, StoreList>();

  rows.forEach(row => {
    const name = (row.name || '').trim();
    const country = (row.country || '').trim();
    if (!name || !country) return;

    const key = `${name}::${country}`;

    const retailer: StoreListRetailer = {
      id: row.id || `${name}-${row.retailer}-${Math.random()}`,
      retailer: (row.retailer || '').trim(),
      weeklyQuota: parseInt(row.weeklyQuota) || 0,
      monthlyQuota: parseInt(row.monthlyQuota) || 0,
    };

    if (listMap.has(key)) {
      listMap.get(key)!.retailers.push(retailer);
    } else {
      listMap.set(key, {
        name,
        country,
        retailers: [retailer],
      });
    }
  });

  return Array.from(listMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Parse boosters CSV
 */
export function parseBoosters(csvContent: string): Booster[] {
  const rows = parseCSVGeneric(csvContent);

  return rows
    .filter(row => (row.name || '').trim() && (row.country || '').trim())
    .map(row => ({
      id: row.id || `booster-${row.name}-${Math.random()}`,
      name: (row.name || '').trim(),
      country: (row.country || '').trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
