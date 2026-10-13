/**
 * Analytics Service — Rastreamento de visualizações, cliques no WhatsApp e métricas de imóveis.
 * Armazenamento local seguro e com agregação para exibição no painel administrativo (/admin).
 */

export interface PageViewEvent {
  path: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface WhatsAppClickEvent {
  sku: string;
  propertyName: string;
  bairro?: string;
  price?: number;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface AnalyticsSummary {
  totalPageViews: number;
  totalWhatsAppClicks: number;
  conversionRate: string;
  uniqueDaysTracked: number;
}

export interface TopClickedProperty {
  sku: string;
  propertyName: string;
  bairro: string;
  price: number;
  clicks: number;
}

export interface DailyMetric {
  date: string;
  pageViews: number;
  whatsappClicks: number;
}

const STORAGE_KEY_PAGEVIEWS = "ismael_analytics_pageviews_v1";
const STORAGE_KEY_CLICKS = "ismael_analytics_clicks_v1";

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/**
 * Registra a visualização de uma página
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAGEVIEWS);
    const views: PageViewEvent[] = raw ? JSON.parse(raw) : [];

    views.push({
      path,
      timestamp: Date.now(),
      date: getTodayString(),
    });

    // Mantém no máximo os últimos 5.000 eventos para não estourar storage
    const trimmed = views.slice(-5000);
    localStorage.setItem(STORAGE_KEY_PAGEVIEWS, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Erro ao registrar page view:", err);
  }
}

/**
 * Registra um clique no botão de WhatsApp de um imóvel específico
 */
export function trackWhatsAppClick(
  sku: string,
  propertyName: string,
  bairro: string = "Teresópolis",
  price: number = 0
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLICKS);
    const clicks: WhatsAppClickEvent[] = raw ? JSON.parse(raw) : [];

    clicks.push({
      sku: sku || "sem-sku",
      propertyName: propertyName || "Imóvel",
      bairro: bairro || "Teresópolis",
      price: price || 0,
      timestamp: Date.now(),
      date: getTodayString(),
    });

    const trimmed = clicks.slice(-5000);
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Erro ao registrar clique no WhatsApp:", err);
  }
}

/**
 * Retorna todos os eventos de cliques registrados
 */
export function getAllWhatsAppClicks(): WhatsAppClickEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLICKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retorna todos os eventos de page views registrados
 */
export function getAllPageViews(): PageViewEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAGEVIEWS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retorna resumo geral de métricas
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  const views = getAllPageViews();
  const clicks = getAllWhatsAppClicks();

  const datesSet = new Set<string>();
  views.forEach((v) => datesSet.add(v.date));
  clicks.forEach((c) => datesSet.add(c.date));

  const totalPageViews = views.length;
  const totalWhatsAppClicks = clicks.length;

  const convRate =
    totalPageViews > 0
      ? ((totalWhatsAppClicks / totalPageViews) * 100).toFixed(1) + "%"
      : "0.0%";

  return {
    totalPageViews,
    totalWhatsAppClicks,
    conversionRate: convRate,
    uniqueDaysTracked: Math.max(datesSet.size, 1),
  };
}

/**
 * Ranking dos imóveis mais clicados no WhatsApp
 */
export function getTopClickedProperties(limit: number = 10): TopClickedProperty[] {
  const clicks = getAllWhatsAppClicks();
  const map = new Map<string, TopClickedProperty>();

  for (const c of clicks) {
    const current = map.get(c.sku) || {
      sku: c.sku,
      propertyName: c.propertyName,
      bairro: c.bairro || "Teresópolis",
      price: c.price || 0,
      clicks: 0,
    };
    current.clicks += 1;
    // Atualiza nome ou preço caso venha mais detalhado
    if (c.propertyName && current.propertyName === "Imóvel") {
      current.propertyName = c.propertyName;
    }
    if (c.price && current.price === 0) {
      current.price = c.price;
    }
    map.set(c.sku, current);
  }

  return Array.from(map.values())
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
}

/**
 * Visualizações agregadas por página
 */
export function getPageViewsBreakdown(): { path: string; label: string; count: number }[] {
  const views = getAllPageViews();
  const counts: Record<string, number> = {
    "/": 0,
    "/loja": 0,
    "/lancamentos": 0,
    "/chat": 0,
    "/admin": 0,
  };

  for (const v of views) {
    const p = v.path || "/";
    if (counts[p] !== undefined) {
      counts[p] += 1;
    } else {
      counts[p] = (counts[p] || 0) + 1;
    }
  }

  const labelMap: Record<string, string> = {
    "/": "Início (Home)",
    "/loja": "Catálogo de Imóveis (/loja)",
    "/lancamentos": "Lançamentos Angeleti",
    "/chat": "Atendimento Virtual",
    "/admin": "Painel Administrativo",
  };

  return Object.entries(counts).map(([path, count]) => ({
    path,
    label: labelMap[path] || path,
    count,
  }));
}

/**
 * Dados diários para os gráficos do Recharts
 */
export function getDailyActivity(days: number = 7): DailyMetric[] {
  const views = getAllPageViews();
  const clicks = getAllWhatsAppClicks();

  const result: DailyMetric[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const dayViews = views.filter((v) => v.date === dateStr).length;
    const dayClicks = clicks.filter((c) => c.date === dateStr).length;

    // Formata DD/MM
    const [_, mm, dd] = dateStr.split("-");
    const displayDate = `${dd}/${mm}`;

    result.push({
      date: displayDate,
      pageViews: dayViews,
      whatsappClicks: dayClicks,
    });
  }

  return result;
}

/**
 * Limpa todos os dados de analytics (para teste ou reinício)
 */
export function clearAnalyticsData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_PAGEVIEWS);
  localStorage.removeItem(STORAGE_KEY_CLICKS);
}

/**
 * Popula com alguns dados simulados iniciais para demonstração caso esteja zerado
 */
export function seedInitialAnalyticsIfEmpty(availableSkus: { sku: string; name: string; bairro?: string; price?: number }[]): void {
  if (typeof window === "undefined") return;
  const rawViews = localStorage.getItem(STORAGE_KEY_PAGEVIEWS);
  const rawClicks = localStorage.getItem(STORAGE_KEY_CLICKS);

  if (!rawViews && !rawClicks && availableSkus.length > 0) {
    const today = new Date();
    const demoViews: PageViewEvent[] = [];
    const demoClicks: WhatsAppClickEvent[] = [];

    const pages = ["/", "/loja", "/lancamentos", "/loja", "/loja"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const countViews = 18 + Math.floor(Math.random() * 25);
      const countClicks = 2 + Math.floor(Math.random() * 6);

      for (let v = 0; v < countViews; v++) {
        demoViews.push({
          path: pages[Math.floor(Math.random() * pages.length)],
          timestamp: d.getTime() + v * 3600000,
          date: dateStr,
        });
      }

      for (let c = 0; c < countClicks; c++) {
        const p = availableSkus[Math.floor(Math.random() * availableSkus.length)];
        demoClicks.push({
          sku: p.sku || "163110",
          propertyName: p.name,
          bairro: p.bairro || "Teresópolis",
          price: p.price || 500000,
          timestamp: d.getTime() + c * 7200000,
          date: dateStr,
        });
      }
    }

    localStorage.setItem(STORAGE_KEY_PAGEVIEWS, JSON.stringify(demoViews));
    localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(demoClicks));
  }
}
