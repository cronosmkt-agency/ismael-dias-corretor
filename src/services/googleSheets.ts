// Legacy Google Sheets integration stub (cleaned up to prevent bundling unused assets)
import type { ProductItem } from "@/components/ProductDetailModal";

export const DEVICE_IMAGES: Record<string, string> = {};
export const STORAGE_SHEET_URL_KEY = "custom_google_sheet_csv_url";
export const SEMINOVOS_SHEET_URL = "";
export const LACRADOS_SHEET_URL = "";
export const DEFAULT_SHEET_URL = "";

export function getProductImageByModel(): string {
  return "";
}

export function getSpecsByModel(): { batteryHealth: string; warranty: string } {
  return { batteryHealth: "100%", warranty: "Garantia de 90 dias" };
}

export function normalizeGoogleSheetUrl(url: string): string {
  return url;
}

export function parseCSV(): string[][] {
  return [];
}

export function cleanModelName(model: string): string {
  return model;
}

export function parseStorage(storageStr: string): string {
  return storageStr;
}

export function transformSeminovosCsv(): ProductItem[] {
  return [];
}

export function transformLacradosCsv(): ProductItem[] {
  return [];
}

export function transformCsvToProducts(): ProductItem[] {
  return [];
}

export async function fetchGoogleSheetInventory(): Promise<ProductItem[]> {
  return [];
}
