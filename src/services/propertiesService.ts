/**
 * Properties Service — Camada unificada de dados, consultas paginadas e operações CRUD para os imóveis.
 * Desacopla a renderização da interface, permitindo paginação ultrarrápida, busca otimizada e edição pelo painel admin.
 */

import { allImoveisData } from "@/data/imoveisData";
import type { ProductItem } from "@/components/ProductDetailModal";
import {
  isSupabaseConfigured,
  fetchPropertiesFromSupabase,
  updatePropertyInSupabase,
  insertPropertyInSupabase,
  deletePropertyInSupabase,
} from "./supabaseClient";

const STORAGE_KEY_OVERRIDES = "ismael_properties_overrides_v1";
const STORAGE_KEY_ADDED = "ismael_properties_added_v1";
const STORAGE_KEY_DELETED = "ismael_properties_deleted_v1";
const STORAGE_KEY_SUPABASE_CACHE = "ismael_supabase_cache_v1";

let cachedSupabaseList: ProductItem[] | null = null;
let isFetchingSupabase = false;

/**
 * Atualiza o cache local a partir do Supabase e notifica os componentes do site
 */
export async function refreshPropertiesFromSupabase(): Promise<ProductItem[]> {
  if (!isSupabaseConfigured() || isFetchingSupabase) {
    return getAllProperties();
  }

  try {
    isFetchingSupabase = true;
    const remoteList = await fetchPropertiesFromSupabase();
    if (remoteList && remoteList.length > 0) {
      cachedSupabaseList = remoteList;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY_SUPABASE_CACHE, JSON.stringify(remoteList));
        } catch (_) {}
        window.dispatchEvent(
          new CustomEvent("properties-data-changed", { detail: { source: "supabase" } })
        );
      }
      return remoteList;
    }
  } catch (err) {
    console.error("Erro ao sincronizar com Supabase:", err);
  } finally {
    isFetchingSupabase = false;
  }

  return getAllProperties();
}

// Inicia sincronização automática em background no cliente quando o Supabase estiver ativo
if (typeof window !== "undefined") {
  setTimeout(() => {
    if (isSupabaseConfigured()) {
      refreshPropertiesFromSupabase();
    }
  }, 100);
}

/**
 * Carrega a lista completa de imóveis (prioriza Supabase se configurado, com fallback instantâneo)
 */
export function getAllProperties(): ProductItem[] {
  if (typeof window === "undefined") return allImoveisData;

  // 1. Se temos cache em memória do Supabase, retorna direto
  if (cachedSupabaseList && cachedSupabaseList.length > 0) {
    return cachedSupabaseList;
  }

  // 2. Se temos cache persistido do Supabase no LocalStorage, carrega
  try {
    const rawSupabaseCache = localStorage.getItem(STORAGE_KEY_SUPABASE_CACHE);
    if (rawSupabaseCache && isSupabaseConfigured()) {
      const parsed = JSON.parse(rawSupabaseCache);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedSupabaseList = parsed;
        return parsed;
      }
    }
  } catch (_) {}

  // 3. Fallback: Base unificada local de 175 imóveis com overrides do admin
  try {
    const rawOverrides = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    const overrides: Record<string, Partial<ProductItem>> = rawOverrides
      ? JSON.parse(rawOverrides)
      : {};

    const rawAdded = localStorage.getItem(STORAGE_KEY_ADDED);
    const added: ProductItem[] = rawAdded ? JSON.parse(rawAdded) : [];

    const rawDeleted = localStorage.getItem(STORAGE_KEY_DELETED);
    const deletedSkus: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];
    const deletedSet = new Set(deletedSkus);

    // 1. Aplica overrides sobre a lista base
    const baseMerged = allImoveisData
      .filter((p) => !deletedSet.has(String(p.sku)))
      .map((p) => {
        const skuKey = String(p.sku);
        if (overrides[skuKey]) {
          return { ...p, ...overrides[skuKey] };
        }
        return p;
      });

    // 2. Adiciona os novos imóveis criados pelo admin
    const addedMerged = added
      .filter((p) => !deletedSet.has(String(p.sku)))
      .map((p) => {
        const skuKey = String(p.sku);
        if (overrides[skuKey]) {
          return { ...p, ...overrides[skuKey] };
        }
        return p;
      });

    return [...addedMerged, ...baseMerged];
  } catch (err) {
    console.error("Erro ao carregar imóveis mesclados:", err);
    return allImoveisData;
  }
}

/**
 * Busca um imóvel específico pelo SKU (código de identificação único)
 */
export function getPropertyBySku(sku?: string): ProductItem | undefined {
  if (!sku) return undefined;
  const target = String(sku).trim().toLowerCase();
  const all = getAllProperties();
  return all.find((p) => String(p.sku || "").trim().toLowerCase() === target);
}

/**
 * Retorna imóveis relacionados (mesmo bairro ou mesma categoria) para links internos de SEO
 */
export function getRelatedProperties(currentSku?: string, limit = 4): ProductItem[] {
  const all = getAllProperties();
  if (!currentSku) return all.slice(0, limit);

  const cleanSku = String(currentSku).trim().toLowerCase();
  const current = all.find((p) => String(p.sku || "").trim().toLowerCase() === cleanSku);
  if (!current) return all.slice(0, limit);

  const candidates = all.filter(
    (p) =>
      String(p.sku || "").trim().toLowerCase() !== cleanSku &&
      p.badge !== "VENDIDA" &&
      p.condition !== "VENDIDA"
  );

  const sameBairro = candidates.filter((p) => p.bairro === current.bairro);
  if (sameBairro.length >= limit) return sameBairro.slice(0, limit);

  const sameCat = candidates.filter((p) => p.cat === current.cat && !sameBairro.includes(p));
  const other = candidates.filter((p) => !sameBairro.includes(p) && !sameCat.includes(p));

  return [...sameBairro, ...sameCat, ...other].slice(0, limit);
}

/**
 * Retorna a URL canônica pública de um imóvel
 */
export function getPropertyCanonicalUrl(sku: string): string {
  return `https://ismael-dias-corretor.vercel.app/imovel/${encodeURIComponent(sku)}`;
}

export interface PaginatedParams {
  page?: number;
  pageSize?: number;
  category?: string;
  bairro?: string;
  priceRange?: string;
  search?: string;
  sort?: string;
  statusFilter?: "all" | "disponivel" | "vendida" | "reservado";
}

export interface PaginatedResult {
  items: ProductItem[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/**
 * Busca e filtra imóveis com suporte à paginação (reduz drasticamente o consumo de memória no celular)
 */
export function getPropertiesPaginated(params: PaginatedParams): PaginatedResult {
  const {
    page = 1,
    pageSize = 16,
    category = "Todos",
    bairro = "Todos",
    priceRange = "all",
    search = "",
    sort = "default",
    statusFilter = "all",
  } = params;

  let list = getAllProperties();

  // 1. Filtro por Categoria
  if (category && category !== "Todos") {
    list = list.filter((item) => item.cat === category);
  }

  // 2. Filtro por Bairro
  if (bairro && bairro !== "Todos") {
    if (bairro === "Teresópolis (Todos)") {
      list = list.filter(
        (item) =>
          (item.screen && item.screen.toLowerCase().includes("teresópolis")) ||
          item.bairro === "Teresópolis"
      );
    } else {
      list = list.filter(
        (item) =>
          (item.bairro && item.bairro.toLowerCase() === bairro.toLowerCase()) ||
          (item.screen && item.screen.toLowerCase().includes(bairro.toLowerCase()))
      );
    }
  }

  // 3. Filtro por Faixa de Preço
  if (priceRange && priceRange !== "all") {
    switch (priceRange) {
      case "under-300":
        list = list.filter((i) => i.price <= 300000);
        break;
      case "300-600":
        list = list.filter((i) => i.price > 300000 && i.price <= 600000);
        break;
      case "600-1000":
        list = list.filter((i) => i.price > 600000 && i.price <= 1000000);
        break;
      case "1000-2000":
        list = list.filter((i) => i.price > 1000000 && i.price <= 2000000);
        break;
      case "over-2000":
        list = list.filter((i) => i.price > 2000000);
        break;
    }
  }

  // 4. Filtro por Status Administrativo
  if (statusFilter && statusFilter !== "all") {
    if (statusFilter === "disponivel") {
      list = list.filter((i) => i.badge !== "VENDIDA" && i.badge !== "RESERVADO");
    } else if (statusFilter === "vendida") {
      list = list.filter((i) => i.badge === "VENDIDA");
    } else if (statusFilter === "reservado") {
      list = list.filter((i) => i.badge === "RESERVADO");
    }
  }

  // 5. Busca Textual
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku && String(item.sku).includes(q);
      const matchBairro = item.bairro && item.bairro.toLowerCase().includes(q);
      const matchScreen = item.screen && item.screen.toLowerCase().includes(q);
      const matchSpecs = item.specs && item.specs.toLowerCase().includes(q);
      const matchStorage = item.storage && item.storage.toLowerCase().includes(q);
      return matchName || matchSku || matchBairro || matchScreen || matchSpecs || matchStorage;
    });
  }

  // 6. Ordenação
  if (sort === "price-asc") {
    list = [...list].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    list = [...list].sort((a, b) => b.price - a.price);
  } else if (sort === "name-asc") {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = list.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedItems = list.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total,
    totalPages,
    page: safePage,
    pageSize,
  };
}

/**
 * Atualiza um imóvel específico pelo SKU (Salva no Supabase e no cache local com confirmação 100%)
 */
export async function updateProperty(
  sku: string,
  updates: Partial<ProductItem>
): Promise<boolean> {
  if (typeof window === "undefined" || !sku) return false;
  try {
    // 1. Atualiza cache em memória do Supabase
    if (cachedSupabaseList) {
      cachedSupabaseList = cachedSupabaseList.map((p) =>
        String(p.sku) === String(sku) ? { ...p, ...updates } : p
      );
      try {
        localStorage.setItem(STORAGE_KEY_SUPABASE_CACHE, JSON.stringify(cachedSupabaseList));
      } catch (_) {}
    }

    // 2. Persiste no LocalStorage local (fallback e persistência instantânea)
    const rawOverrides = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    const overrides: Record<string, Partial<ProductItem>> = rawOverrides
      ? JSON.parse(rawOverrides)
      : {};

    overrides[String(sku)] = {
      ...(overrides[String(sku)] || {}),
      ...updates,
    };

    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(overrides));
    window.dispatchEvent(new CustomEvent("properties-data-changed", { detail: { sku, updates } }));

    // 3. Persiste no Supabase em Nuvem (PostgreSQL) com garantia
    if (isSupabaseConfigured()) {
      const ok = await updatePropertyInSupabase(sku, updates);
      if (!ok) {
        console.warn(`Supabase: falha ao persistir atualização do imóvel #${sku}`);
      }
      return ok;
    }
    return true;
  } catch (err) {
    console.error("Erro ao atualizar imóvel:", err);
    return false;
  }
}

/**
 * Altera rapidamente o status do imóvel (Disponível / VENDIDA / RESERVADO) com sync 100% no Supabase
 */
export async function togglePropertyStatus(sku: string, newBadge: string): Promise<boolean> {
  return await updateProperty(sku, { badge: newBadge, condition: newBadge });
}

/**
 * Cadastra um novo imóvel no sistema (Salva no Supabase e no cache local)
 */
export async function addProperty(newProperty: ProductItem): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    // 1. Atualiza cache em memória do Supabase
    if (cachedSupabaseList) {
      cachedSupabaseList.unshift(newProperty);
      try {
        localStorage.setItem(STORAGE_KEY_SUPABASE_CACHE, JSON.stringify(cachedSupabaseList));
      } catch (_) {}
    }

    // 2. Persiste localmente (fallback)
    const rawAdded = localStorage.getItem(STORAGE_KEY_ADDED);
    const added: ProductItem[] = rawAdded ? JSON.parse(rawAdded) : [];

    added.unshift(newProperty);
    localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(added));
    window.dispatchEvent(new CustomEvent("properties-data-changed", { detail: { added: newProperty } }));

    // 3. Persiste no Supabase em Nuvem
    if (isSupabaseConfigured()) {
      const ok = await insertPropertyInSupabase(newProperty);
      return ok;
    }
    return true;
  } catch (err) {
    console.error("Erro ao adicionar imóvel:", err);
    return false;
  }
}

/**
 * Remove um imóvel (soft delete local e remoção física no Supabase)
 */
export async function deleteProperty(sku: string): Promise<boolean> {
  if (typeof window === "undefined" || !sku) return false;
  try {
    // 1. Atualiza cache em memória do Supabase
    if (cachedSupabaseList) {
      cachedSupabaseList = cachedSupabaseList.filter((p) => String(p.sku) !== String(sku));
      try {
        localStorage.setItem(STORAGE_KEY_SUPABASE_CACHE, JSON.stringify(cachedSupabaseList));
      } catch (_) {}
    }

    // 2. Persiste localmente (fallback)
    const rawDeleted = localStorage.getItem(STORAGE_KEY_DELETED);
    const deleted: string[] = rawDeleted ? JSON.parse(rawDeleted) : [];

    if (!deleted.includes(String(sku))) {
      deleted.push(String(sku));
    }

    localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deleted));
    window.dispatchEvent(new CustomEvent("properties-data-changed", { detail: { deletedSku: sku } }));

    // 3. Deleta no Supabase em Nuvem
    if (isSupabaseConfigured()) {
      const ok = await deletePropertyInSupabase(sku);
      return ok;
    }
    return true;
  } catch (err) {
    console.error("Erro ao remover imóvel:", err);
    return false;
  }
}

/**
 * Restaura todo o catálogo para o padrão original da Habittat House
 */
export function resetPropertiesToDefault(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_OVERRIDES);
  localStorage.removeItem(STORAGE_KEY_ADDED);
  localStorage.removeItem(STORAGE_KEY_DELETED);
  window.dispatchEvent(new CustomEvent("properties-data-changed", { detail: { reset: true } }));
}

/**
 * Exporta todo o catálogo em formato JSON para backup
 */
export function exportPropertiesJson(): string {
  const current = getAllProperties();
  return JSON.stringify(current, null, 2);
}

/**
 * Importa um catálogo completo a partir de arquivo JSON
 */
export function importPropertiesJson(jsonText: string): boolean {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return false;

    // Salva como added completo e limpa overrides
    localStorage.setItem(STORAGE_KEY_ADDED, JSON.stringify(parsed));
    localStorage.removeItem(STORAGE_KEY_OVERRIDES);
    localStorage.removeItem(STORAGE_KEY_DELETED);

    window.dispatchEvent(new CustomEvent("properties-data-changed", { detail: { imported: true } }));
    return true;
  } catch (err) {
    console.error("Erro ao importar JSON:", err);
    return false;
  }
}
