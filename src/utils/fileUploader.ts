import * as XLSX from 'xlsx';
import { parseCSVGeneric } from './csvParser';

/** Normalized header lookup: lowercase, trim, remove spaces and underscores. */
export function getCol(row: Record<string, string>, ...keys: string[]): string {
  const normalized: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    const n = k.toLowerCase().trim().replace(/\s+/g, '').replace(/_/g, '');
    normalized[n] = row[k] ?? '';
  }
  for (const key of keys) {
    const n = key.toLowerCase().trim().replace(/\s+/g, '').replace(/_/g, '');
    if (normalized[n] !== undefined) return normalized[n].trim();
  }
  return '';
}

/**
 * Parse an uploaded CSV or Excel file into an array of row objects.
 * CSV: read as text and parse. XLSX: read first sheet, convert to CSV text, then parse.
 */
export async function parseUploadedFile(file: File): Promise<Record<string, string>[]> {
  const name = (file.name || '').toLowerCase();
  const isXlsx = name.endsWith('.xlsx') || name.endsWith('.xls');

  if (isXlsx) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const sheet = workbook.Sheets[firstSheetName];
    const csvText = XLSX.utils.sheet_to_csv(sheet);
    return parseCSVGeneric(csvText);
  }

  const text = await file.text();
  return parseCSVGeneric(text);
}
