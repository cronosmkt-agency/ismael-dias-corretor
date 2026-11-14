import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef, useMemo, useDeferredValue, useCallback } from "react";
import {
  Home,
  LayoutGrid,
  Search,
  Info,
  Check,
  ShieldCheck,
  Building2,
  Filter,
  Trees,
  MapPin,
  Sparkles,
  Mountain,
  ChevronDown,
  DollarSign,
  ArrowUpDown,
  Crown,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import { useHabittatTheme } from "@/hooks/useHabittatTheme";
import { PropertyCard } from "@/components/PropertyCard";
import type { ProductItem } from "@/types/imovel";
import { FilterDropdown, type FilterOption } from "@/components/FilterDropdown";
import {
  imoveisFilters,
  fmt,
  WHATSAPP,
  WHATSAPP_NUMBER,
} from "@/data/storeData";
import { ALL_BAIRROS } from "@/data/imoveisData";
import { getAllProperties } from "@/services/propertiesService";
import { trackPageView, trackWhatsAppClick } from "@/services/analyticsService";
import { getSiteSettings, type SiteSettings } from "@/services/settingsService";

const imoveisCategoryMeta: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    line2?: string;
  }
> = {
  "Todos": {
    icon: LayoutGrid,
    label: "Todos",
  },
  "Casas em Condomínio": {
    icon: ShieldCheck,
    label: "Casas em",
    line2: "Condomínio",
  },
  "Casas": {
    icon: Home,
    label: "Casas",
  },
  "Apartamentos": {
    icon: Building2,
    label: "Apartamentos",
  },
  "Coberturas": {
    icon: Crown,
    label: "Coberturas",
  },
  "Terrenos": {
    icon: Mountain,
    label: "Terrenos",
    line2: "& Lotes",
  },
  "Sítios & Rurais": {
    icon: Trees,
    label: "Sítios &",
    line2: "Rurais",
  },
  "Comerciais": {
    icon: Sparkles,
    label: "Comerciais",
  },
};

interface FilterOption {
  value: string;
  label: string;
  shortLabel?: string;
}

const SHORT_BAIRRO_MAP: Record<string, string> = {
  "Todos": "Bairro",
  "Teresópolis (Todos)": "Teresópolis",
  "Cascata dos Amores": "C. Amores",
  "Cascata do Imbuí": "C. Imbuí",
  "Cascata Guarani": "C. Guarani",
  "Parque do Imbuí": "Pq. Imbuí",
  "Parque São Luiz": "Pq. S. Luiz",
  "Quinta da Barra": "Qta. Barra",
  "Vale do Paraíso": "V. Paraíso",
  "Fazenda Alpina": "Fz. Alpina",
  "Vargem Grande": "V. Grande",
  "Carlos Guinle": "C. Guinle",
  "Quebra Frascos": "Q. Frascos",
  "Granja Guarani": "G. Guarani",
  "Green Valley": "Green Valley",
  "Nova Friburgo": "Friburgo",
  "Nova Iguaçu": "N. Iguaçu",
  "Bonsucesso": "Bonsucesso",
  "Albuquerque": "Albuquerque",
  "Agriões": "Agriões",
  "Alto": "Alto",
  "Centro": "Centro",
  "Várzea": "Várzea",
  "Tijuca": "Tijuca",
  "Golfe": "Golfe",
  "Posse": "Posse",
  "Prata": "Prata",
  "Andradas": "Andradas",
  "Bom Retiro": "Bom Retiro",
  "Caxangá": "Caxangá",
  "Pimenteiras": "Pimenteiras",
  "São Pedro": "São Pedro",
  "Taumaturgo": "Taumaturgo",
  "Venda Nova": "Venda Nova",
  "Vila Muqui": "Vila Muqui",
};

function formatShortBairro(name: string): string {
  if (SHORT_BAIRRO_MAP[name]) return SHORT_BAIRRO_MAP[name];
  if (name.includes("/")) return name.split("/")[0].trim();
  if (name.length <= 11) return name;
  return name.slice(0, 10);
}

const BAIRRO_OPTIONS: FilterOption[] = [
  { value: "Todos", label: "Todos os Bairros", shortLabel: "Bairro" },
  { value: "Teresópolis (Todos)", label: "Teresópolis (Todos)", shortLabel: "Teresópolis" },
  ...ALL_BAIRROS.filter((b) => b !== "Todos" && b !== "Teresópolis (Todos)").map((b) => ({
    value: b,
    label: b,
    shortLabel: formatShortBairro(b),
  })),
];

const PRICE_RANGE_OPTIONS: FilterOption[] = [
  { value: "all", label: "Todas as faixas de valor", shortLabel: "Preço" },
  { value: "under-300", label: "Até R$ 300 mil", shortLabel: "Até 300k" },
  { value: "300-600", label: "R$ 300 mil a R$ 600 mil", shortLabel: "300k-600k" },
  { value: "600-1000", label: "R$ 600 mil a R$ 1 Milhão", shortLabel: "600k-1M" },
  { value: "1000-2000", label: "R$ 1 Milhão a R$ 2 Milhões", shortLabel: "1M-2M" },
  { value: "over-2000", label: "Acima de R$ 2 Milhões", shortLabel: "+ 2M" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "default", label: "Destaques (Padrão)", shortLabel: "Ordenar" },
  { value: "price-asc", label: "Menor Valor", shortLabel: "Menor $" },
  { value: "price-desc", label: "Maior Valor", shortLabel: "Maior $" },
  { value: "name-asc", label: "Nome (A - Z)", shortLabel: "Nome A-Z" },
];

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Imóveis Avulsos em Teresópolis — Ismael Dias | Habittat House" },
      {
        name: "description",
        content:
          "Casas em condomínio, coberturas duplex e residências exclusivas prontas para morar em Teresópolis - RJ. Atendimento com o corretor Ismael Dias na Habittat House.",
      },
      { property: "og:title", content: "Imóveis Avulsos — Ismael Dias | Habittat House" },
      {
        property: "og:description",
        content:
          "Catálogo de casas de alto padrão e coberturas na serra fluminense com documentação garantida.",
      },
    ],
  }),
  component: LojaPage,
});

function LojaPage() {
  const { currentTheme, setCurrentTheme, toggleTheme } = useHabittatTheme();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [productList, setProductList] = useState<ProductItem[]>(getAllProperties());
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("loja_visible_count");
      if (saved) {
        const count = Number(saved);
        if (!isNaN(count) && count > 0) return count;
      }
    }
    return 16;
  });
  const [activeFilter, setActiveFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("cat");
      if (catParam) return catParam;
      const saved = sessionStorage.getItem("loja_active_filter");
      if (saved) return saved;
    }
    return "Todos";
  });
  const [selectedBairro, setSelectedBairro] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const bParam = urlParams.get("bairro");
      if (bParam) return bParam;
      const saved = sessionStorage.getItem("loja_selected_bairro");
      if (saved) return saved;
    }
    return "Todos";
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("loja_price_range");
      if (saved) return saved;
    }
    return "all";
  });
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("loja_sort_by");
      if (saved) return saved;
    }
    return "default";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("loja_search_query");
      if (saved) return saved;
    }
    return "";
  });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const isInitialMount = useRef(true);

  // Sincroniza filtros com sessionStorage com debounce para digitação instantânea
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("loja_active_filter", activeFilter);
          sessionStorage.setItem("loja_selected_bairro", selectedBairro);
          sessionStorage.setItem("loja_price_range", selectedPriceRange);
          sessionStorage.setItem("loja_sort_by", sortBy);
          sessionStorage.setItem("loja_search_query", searchQuery);
          sessionStorage.setItem("loja_visible_count", String(visibleCount));
        } catch (_) {}
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [activeFilter, selectedBairro, selectedPriceRange, sortBy, searchQuery, visibleCount]);

  // Monitora scroll com debounce de 150ms para manter 120fps fluidos sem bloquear a thread principal
  useEffect(() => {
    let scrollTimer: any;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        try {
          sessionStorage.setItem("loja_scroll_y", String(window.scrollY));
        } catch (_) {}
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Restaura posição de scroll ao voltar para a página
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScroll = sessionStorage.getItem("loja_scroll_y");
      if (savedScroll) {
        const y = Number(savedScroll);
        if (!isNaN(y) && y > 0) {
          const timer = setTimeout(() => {
            window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
          }, 80);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  useEffect(() => {
    trackPageView("/loja");

    const handlePropsChanged = () => {
      setProductList(getAllProperties());
    };
    const handleSettingsChanged = (e: any) => {
      setSiteSettings(e.detail || getSiteSettings());
    };

    window.addEventListener("properties-data-changed", handlePropsChanged);
    window.addEventListener("site-settings-changed", handleSettingsChanged);

    if (typeof window !== "undefined") {
      // Detecção de SKU direto via URL query (?sku=123) -> redireciona para a página própria do imóvel
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const skuParam = urlParams.get("sku");
        if (skuParam) {
          window.location.href = `/imovel/${skuParam}`;
        }
      } catch (_) {}
    }

    return () => {
      window.removeEventListener("properties-data-changed", handlePropsChanged);
      window.removeEventListener("site-settings-changed", handleSettingsChanged);
    };
  }, []);

  // Reset pagination when any filter changes (exceto na montagem inicial)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setVisibleCount(16);
  }, [activeFilter, selectedBairro, selectedPriceRange, sortBy, searchQuery]);

  const handleOrderWhatsApp = useCallback((prod: ProductItem) => {
    trackWhatsAppClick(
      prod.sku || "",
      prod.name,
      prod.bairro || "Teresópolis",
      prod.price
    );

    let text = "";
    if (prod.badge === "VENDIDA" || prod.condition?.includes("VENDIDA")) {
      text = `Olá, Ismael Dias! Vi no seu catálogo que o imóvel *${prod.name}* (Cód. #${prod.sku || ""}) foi vendido.

Gostaria de saber se você tem outras opções semelhantes disponíveis na mesma região (${prod.screen || "Teresópolis"})!`;
    } else {
      text = `Olá, Ismael Dias! Vi este imóvel no seu catálogo e gostaria de informações:

🏡 *Imóvel:* ${prod.name}
🔢 *Código:* #${prod.sku || "Habittat"}
📍 *Localização:* ${prod.screen || "Teresópolis/RJ"}
📐 *Área:* ${prod.storage || "Área Privativa"}
💰 *Valor:* ${fmt(prod.price)}
✨ *Destaque:* ${prod.badge}

Gostaria de agendar uma visita com você para conhecer o imóvel!`;
    }

    const targetNumber = siteSettings.whatsappNumber || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`, "_blank");
  }, [siteSettings.whatsappNumber]);

  const deferredSearch = useDeferredValue(searchQuery);

  // Filter & Search otimizado com useMemo e normalização prévia de strings
  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const isDirectSkuSearch = q !== "";
    const bLower = selectedBairro.toLowerCase();
    const hideSold = siteSettings.hideSoldProperties !== false;

    return productList
      .filter((item) => {
        // Ocultar imóveis vendidos do catálogo público quando ativado (padrão)
        const isSold = item.badge === "VENDIDA" || item.condition === "VENDIDA";
        if (isSold && hideSold) {
          if (!isDirectSkuSearch || (item.sku && !item.sku.includes(q))) {
            return false;
          }
        }

        const isCob =
          item.cat === "Coberturas" ||
          (item.name && item.name.toLowerCase().includes("cobertura"));

        const matchCat =
          activeFilter === "Todos"
            ? true
            : activeFilter === "Coberturas"
            ? isCob
            : activeFilter === "Apartamentos"
            ? item.cat === "Apartamentos" && !isCob
            : item.cat === activeFilter;

        if (!matchCat) return false;

        const matchBairro =
          selectedBairro === "Todos" ||
          (selectedBairro === "Teresópolis (Todos)" &&
            ((item.screen && item.screen.toLowerCase().includes("teresópolis")) ||
              item.bairro === "Teresópolis")) ||
          (item.bairro && item.bairro.toLowerCase() === bLower) ||
          (item.screen && item.screen.toLowerCase().includes(bLower));

        if (!matchBairro) return false;

        let matchPrice = true;
        if (selectedPriceRange === "under-300") {
          matchPrice = item.price <= 300000;
        } else if (selectedPriceRange === "300-600") {
          matchPrice = item.price > 300000 && item.price <= 600000;
        } else if (selectedPriceRange === "600-1000") {
          matchPrice = item.price > 600000 && item.price <= 1000000;
        } else if (selectedPriceRange === "1000-2000") {
          matchPrice = item.price > 1000000 && item.price <= 2000000;
        } else if (selectedPriceRange === "over-2000") {
          matchPrice = item.price > 2000000;
        }

        if (!matchPrice) return false;

        if (!q) return true;

        return (
          item.name.toLowerCase().includes(q) ||
          (item.specs && item.specs.toLowerCase().includes(q)) ||
          (item.storage && item.storage.toLowerCase().includes(q)) ||
          (item.screen && item.screen.toLowerCase().includes(q)) ||
          (item.sku && item.sku.includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return a.price - b.price;
        }
        if (sortBy === "price-desc") {
          return b.price - a.price;
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name, "pt-BR");
        }
        return 0;
      });
  }, [productList, activeFilter, selectedBairro, selectedPriceRange, sortBy, deferredSearch, siteSettings.hideSoldProperties]);

  const displayed = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const hasActiveFilters =
    activeFilter !== "Todos" ||
    selectedBairro !== "Todos" ||
    selectedPriceRange !== "all" ||
    sortBy !== "default" ||
    searchQuery.trim() !== "";

  const handleClearAllFilters = useCallback(() => {
    setActiveFilter("Todos");
    setSelectedBairro("Todos");
    setSelectedPriceRange("all");
    setSortBy("default");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("loja_active_filter");
      sessionStorage.removeItem("loja_selected_bairro");
      sessionStorage.removeItem("loja_price_range");
      sessionStorage.removeItem("loja_sort_by");
      sessionStorage.removeItem("loja_search_query");
      sessionStorage.removeItem("loja_visible_count");
      sessionStorage.removeItem("loja_scroll_y");
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="pt-24 sm:pt-28 pb-36 sm:pb-24 px-3 sm:px-6 max-w-7xl mx-auto">
        {/* H1 Semântico Oculto para SEO e Acessibilidade */}
        <h1 className="sr-only">
          Casas, Coberturas e Residências à Venda em Teresópolis - Ismael Dias Corretor
        </h1>

        {/* Container Mestre Unificado: Busca + Botão Seleção de Categorias + Filtros */}
        <div className="mt-2 sm:mt-4 max-w-xl sm:max-w-2xl lg:max-w-4xl mx-auto glass rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2 relative z-30">
          {/* Linha 1: Barra de Busca + Botão de Seleção de Categorias */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar código (#SKU), condomínio, rua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 sm:pl-9 pr-14 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Botão de Seleção de Categorias (substitui o antigo Grade/Vitrine) */}
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 border select-none ${
                activeFilter !== "Todos"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 shadow-sm"
                  : isCategoryOpen
                  ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-sky-400 border-blue-300 dark:border-sky-700 shadow-2xs"
                  : "bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 shadow-2xs"
              }`}
              title="Filtrar por Categoria"
            >
              {(() => {
                const meta = imoveisCategoryMeta[activeFilter] || { icon: LayoutGrid, label: activeFilter };
                const Icon = meta.icon;
                return <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
              })()}
              <span className="truncate max-w-[85px] sm:max-w-[130px]">
                {activeFilter === "Todos" ? "Categorias" : activeFilter}
              </span>
              {activeFilter !== "Todos" && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-white/25 text-white leading-none">
                  {activeFilter === "Coberturas"
                    ? productList.filter((p) => p.cat === "Coberturas" || p.name.toLowerCase().includes("cobertura")).length
                    : activeFilter === "Apartamentos"
                    ? productList.filter((p) => p.cat === "Apartamentos" && !p.name.toLowerCase().includes("cobertura")).length
                    : productList.filter((p) => p.cat === activeFilter).length}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Painel Expansível de Categorias (Abre ao clicar no botão de categorias) */}
          {isCategoryOpen && (
            <div className="pt-2 pb-1 border-t border-slate-200/70 dark:border-slate-800/70 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1.5 px-0.5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                  Selecione uma categoria:
                </span>
                {activeFilter !== "Todos" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter("Todos");
                      setIsCategoryOpen(false);
                    }}
                    className="text-[10px] sm:text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Ver Todos ({productList.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5">
                {imoveisFilters.map((fl) => {
                  const meta = imoveisCategoryMeta[fl] || { icon: LayoutGrid, label: fl };
                  const Icon = meta.icon;
                  const count =
                    fl === "Todos"
                      ? productList.length
                      : fl === "Coberturas"
                      ? productList.filter((p) => p.cat === "Coberturas" || p.name.toLowerCase().includes("cobertura")).length
                      : fl === "Apartamentos"
                      ? productList.filter((p) => p.cat === "Apartamentos" && !p.name.toLowerCase().includes("cobertura")).length
                      : productList.filter((p) => p.cat === fl).length;
                  const isActive = activeFilter === fl;
                  return (
                    <button
                      key={fl}
                      onClick={() => {
                        setActiveFilter(fl);
                        setIsCategoryOpen(false);
                      }}
                      className={`group relative flex flex-col items-center justify-between w-full h-[54px] sm:h-[64px] p-1 sm:p-1.5 rounded-xl border transition-all duration-150 cursor-pointer text-center select-none shadow-2xs ${
                        isActive
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-sky-600 border-blue-500 dark:border-sky-400 text-white shadow-xs scale-102"
                          : "bg-white/95 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      {/* Badge Contador no Canto Superior Direito */}
                      <span
                        className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 rounded-full font-black leading-none transition-colors ${
                          isActive
                            ? "bg-white/30 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                        }`}
                      >
                        {count}
                      </span>

                      {/* Ícone em Cima */}
                      <div
                        className={`p-1 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-50/80 dark:bg-slate-800/80 text-blue-600 dark:text-sky-400 group-hover:scale-105"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      </div>

                      {/* Texto Pequeno Embaixo — Icon + Nome */}
                      <div className="flex flex-col items-center justify-center leading-none w-full px-0.5">
                        <span className="text-[8.5px] sm:text-[10px] font-bold tracking-tight truncate max-w-full">
                          {meta.label}
                        </span>
                        {meta.line2 ? (
                          <span className="text-[7.5px] sm:text-[9px] font-bold tracking-tight opacity-90 truncate max-w-full mt-0.5">
                            {meta.line2}
                          </span>
                        ) : (
                          <span className="invisible text-[7.5px] sm:text-[9px] leading-none select-none mt-0.5">&nbsp;</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Linha 2: Filtros Dropdown (Bairro, Preço, Ordenar) — Grid 3 colunas para manter proporção perfeita e nunca estourar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full py-0.5 relative z-20">
            {/* Dropdown Bairro */}
            <FilterDropdown
              icon={MapPin}
              label="Bairro"
              value={selectedBairro}
              options={BAIRRO_OPTIONS}
              onChange={setSelectedBairro}
              searchable={true}
              align="left"
            />

            {/* Dropdown Faixa de Preço */}
            <FilterDropdown
              icon={DollarSign}
              label="Preço"
              value={selectedPriceRange}
              options={PRICE_RANGE_OPTIONS}
              onChange={setSelectedPriceRange}
              align="center"
            />

            {/* Dropdown Ordenação */}
            <FilterDropdown
              icon={ArrowUpDown}
              label="Ordenar"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
              align="right"
            />
          </div>
        </div>

        {/* Grade de Imóveis */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-16 glass rounded-3xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold">Nenhum imóvel encontrado para essa busca</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tente buscar por outro termo ou limpe o filtro de busca.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
            >
              Ver todos os imóveis
            </button>
          </div>
        ) : (
          <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {displayed.map((prod, idx) => (
              <PropertyCard
                key={prod.sku ? `loja-${prod.sku}` : `${prod.name}-${idx}`}
                prod={prod}
                onWhatsApp={handleOrderWhatsApp}
              />
            ))}
          </div>
        )}

        {/* Paginação Inteligente: Carregar Mais Imóveis */}
        {filtered.length > visibleCount && (
          <div className="mt-8 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Exibindo <span className="font-bold text-slate-800 dark:text-white">{displayed.length}</span> de{" "}
              <span className="font-bold text-slate-800 dark:text-white">{filtered.length}</span> imóveis
            </p>
            <button
              onClick={() => setVisibleCount((prev) => prev + 16)}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>Carregar Mais Imóveis</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-black">
                +{Math.min(16, filtered.length - displayed.length)}
              </span>
            </button>
          </div>
        )}

        {/* Banner de Atendimento com Ismael Dias */}
        <div className="mt-16 rounded-3xl p-6 sm:p-10 glass border border-blue-500/30 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400 mb-3 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Atendimento com Ismael Dias</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Quer agendar uma visita a um dos imóveis?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
              Fale diretamente com Ismael Dias na Habittat House. Te acompanho pessoalmente na visita aos imóveis, tirando dúvidas sobre documentação, estrutura e localização.
            </p>
          </div>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Falar com Ismael Dias</span>
          </a>
        </div>
      </main>

      <SiteFooter currentTheme={currentTheme} />
      <WhatsFloat />
      <MobileBottomNav />
    </div>
  );
}
