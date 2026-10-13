/**
 * Supabase Client & REST Service — Backend em Nuvem para a Imobiliária Ismael Dias
 * Utiliza a API PostgREST nativa do Supabase (Zero dependências extras, ultra-rápido, compatível com Vercel).
 */

import type { ProductItem } from "@/components/ProductDetailModal";
import { getSiteSettings } from "./settingsService";

const SUPABASE_STORAGE_URL_KEY = "ismael_supabase_url_custom";
const SUPABASE_STORAGE_KEY_KEY = "ismael_supabase_anon_key_custom";

/**
 * Obtém a URL do Supabase (Prioridade: Vercel Env > Configurações do Painel Admin)
 */
export function getSupabaseUrl(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL.trim().replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(SUPABASE_STORAGE_URL_KEY);
    if (custom) return custom.trim().replace(/\/$/, "");
  }
  const settings = getSiteSettings();
  if (settings.supabaseUrl) return settings.supabaseUrl.trim().replace(/\/$/, "");
  return "https://mzrbinywfezwhdpukdxn.supabase.co";
}

/**
 * Obtém a Chave Pública Anon do Supabase (Prioridade: Vercel Env > Configurações do Painel Admin)
 */
export function getSupabaseAnonKey(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) {
    return import.meta.env.VITE_SUPABASE_ANON_KEY.trim();
  }
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem(SUPABASE_STORAGE_KEY_KEY);
    if (custom) return custom.trim();
  }
  const settings = getSiteSettings();
  if (settings.supabaseAnonKey) return settings.supabaseAnonKey.trim();
  return "sb_publishable_XcsVYbA0VZ3e4peR8AVSgw_wHog08eP";
}

/**
 * Salva credenciais personalizadas do Supabase no navegador do administrador
 */
export function setCustomSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window === "undefined") return;
  if (url) localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url.trim().replace(/\/$/, ""));
  else localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);

  if (anonKey) localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(SUPABASE_STORAGE_KEY_KEY);
}

/**
 * Verifica se o backend Supabase está configurado
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/**
 * Headers padrão para comunicação com a API REST do Supabase
 */
function getHeaders(): HeadersInit {
  const key = getSupabaseAnonKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

/**
 * Converte um registro do banco do Supabase para o formato ProductItem
 */
export function mapRowToProduct(row: any): ProductItem {
  return {
    sku: String(row.sku),
    name: row.name || "",
    price: Number(row.price) || 0,
    cat: row.cat || "Casas",
    badge: row.badge || "Disponível",
    bairro: row.bairro || "Teresópolis",
    img: row.img || "",
    images: Array.isArray(row.images) ? row.images : [],
    specs: row.specs || "",
    storage: row.storage || "",
    condition: row.condition || row.badge || "Disponível",
    warranty: row.warranty || "",
    battery: row.battery || "",
    screen: row.screen || "",
    camera: row.camera || "",
    chip: row.chip || "",
    boxItems: Array.isArray(row.box_items) ? row.box_items : [],
    features: Array.isArray(row.features) ? row.features : [],
    description: row.description || "",
    url: row.url || "",
  };
}

/**
 * Converte um ProductItem para os nomes de colunas do Supabase
 */
export function mapProductToRow(prod: Partial<ProductItem>): Record<string, any> {
  const row: Record<string, any> = {};
  if (prod.sku !== undefined) row.sku = String(prod.sku);
  if (prod.name !== undefined) row.name = prod.name;
  if (prod.price !== undefined) row.price = Number(prod.price) || 0;
  if (prod.cat !== undefined) row.cat = prod.cat;
  if (prod.badge !== undefined) row.badge = prod.badge;
  if (prod.bairro !== undefined) row.bairro = prod.bairro;
  if (prod.img !== undefined) row.img = prod.img;
  if (prod.images !== undefined) row.images = prod.images;
  if (prod.specs !== undefined) row.specs = prod.specs;
  if (prod.storage !== undefined) row.storage = prod.storage;
  if (prod.condition !== undefined) row.condition = prod.condition;
  if (prod.warranty !== undefined) row.warranty = prod.warranty;
  if (prod.battery !== undefined) row.battery = prod.battery;
  if (prod.screen !== undefined) row.screen = prod.screen;
  if (prod.camera !== undefined) row.camera = prod.camera;
  if (prod.chip !== undefined) row.chip = prod.chip;
  if (prod.boxItems !== undefined) row.box_items = prod.boxItems;
  if (prod.features !== undefined) row.features = prod.features;
  if (prod.description !== undefined) row.description = prod.description;
  if (prod.url !== undefined) row.url = prod.url;
  return row;
}

/**
 * Testa a conexão com o Supabase
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    return {
      success: false,
      message: "URL ou Chave Anon do Supabase não configuradas.",
    };
  }

  try {
    const res = await fetch(`${url}/rest/v1/properties?select=sku&limit=1`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        message: `Erro HTTP ${res.status}: ${errText.slice(0, 150)}`,
      };
    }

    // Buscar contagem total
    const countRes = await fetch(`${url}/rest/v1/properties?select=count`, {
      method: "GET",
      headers: {
        ...getHeaders(),
        Prefer: "count=exact",
      },
    });

    let totalCount = 0;
    const contentRange = countRes.headers.get("content-range");
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/);
      if (match) totalCount = parseInt(match[1], 10);
    }

    return {
      success: true,
      message: `Conexão bem-sucedida com PostgreSQL no Supabase!`,
      count: totalCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na requisição: ${err.message || String(err)}`,
    };
  }
}

/**
 * Busca todos os imóveis diretamente do Supabase
 */
export async function fetchPropertiesFromSupabase(): Promise<ProductItem[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const url = getSupabaseUrl();
    const res = await fetch(`${url}/rest/v1/properties?select=*&order=created_at.desc`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) {
      console.warn("Supabase fetchProperties returned status:", res.status);
      return null;
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) return null;

    return rows.map(mapRowToProduct);
  } catch (err) {
    console.error("Erro ao buscar imóveis no Supabase:", err);
    return null;
  }
}

/**
 * Atualiza um imóvel no Supabase
 */
export async function updatePropertyInSupabase(
  sku: string,
  data: Partial<ProductItem>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const url = getSupabaseUrl();
    const row = mapProductToRow(data);
    delete row.sku; // Não altera o SKU no PATCH

    const res = await fetch(`${url}/rest/v1/properties?sku=eq.${encodeURIComponent(sku)}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(row),
    });

    return res.ok;
  } catch (err) {
    console.error(`Erro ao atualizar imóvel #${sku} no Supabase:`, err);
    return false;
  }
}

/**
 * Insere um novo imóvel no Supabase (com upsert por SKU)
 */
export async function insertPropertyInSupabase(prod: ProductItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const url = getSupabaseUrl();
    const row = mapProductToRow(prod);

    const res = await fetch(`${url}/rest/v1/properties?on_conflict=sku`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    });

    return res.ok;
  } catch (err) {
    console.error("Erro ao inserir imóvel no Supabase:", err);
    return false;
  }
}

/**
 * Remove um imóvel no Supabase
 */
export async function deletePropertyInSupabase(sku: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const url = getSupabaseUrl();
    const res = await fetch(`${url}/rest/v1/properties?sku=eq.${encodeURIComponent(sku)}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    return res.ok;
  } catch (err) {
    console.error(`Erro ao deletar imóvel #${sku} no Supabase:`, err);
    return false;
  }
}

/**
 * Envia todos os imóveis locais para o Supabase em lote (Sincronização em Massa)
 */
export async function syncAllPropertiesToSupabase(
  properties: ProductItem[]
): Promise<{ success: boolean; message: string; count: number }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase não está configurado. Insira a URL e a Chave Anon primeiro.",
      count: 0,
    };
  }

  try {
    const url = getSupabaseUrl();
    const rows = properties.map(mapProductToRow);

    // Envia em lotes de 50 para evitar limites de payload
    const batchSize = 50;
    let synced = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const res = await fetch(`${url}/rest/v1/properties?on_conflict=sku`, {
        method: "POST",
        headers: {
          ...getHeaders(),
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          success: false,
          message: `Erro ao enviar lote ${i + 1}-${i + batch.length}: ${text.slice(0, 100)}`,
          count: synced,
        };
      }
      synced += batch.length;
    }

    return {
      success: true,
      message: `Todos os ${synced} imóveis foram sincronizados com sucesso no banco Supabase!`,
      count: synced,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro durante sincronização: ${err.message || String(err)}`,
      count: 0,
    };
  }
}
