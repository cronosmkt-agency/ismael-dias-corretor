import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useDeferredValue } from "react";
import {
  LayoutGrid,
  Search,
  Info,
  Building2,
  MapPin,
  Sparkles,
  Mountain,
  ChevronDown,
  DollarSign,
  ArrowUpDown,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import type { ProductItem } from "@/components/ProductDetailModal";
import { FilterDropdown, type FilterOption } from "@/components/FilterDropdown";
import {
  lancamentosProducts,
  lancamentosFilters,
  fmt,
  WHATSAPP,
  WHATSAPP_NUMBER,
} from "@/data/storeData";
import { trackPageView, trackWhatsAppClick } from "@/services/analyticsService";
import { getSiteSettings, type SiteSettings } from "@/services/settingsService";

const LANCAMENTOS_BAIRRO_OPTIONS: FilterOption[] = [
  { value: "Todos", label: "Todas as Regiões", shortLabel: "Região" },
  { value: "Albuquerque", label: "Albuquerque (Golden Green)", shortLabel: "Albuquerque" },
  { value: "Prata", label: "Prata (Vale dos Pássaros)", shortLabel: "Prata" },
];

const LANCAMENTOS_PRICE_OPTIONS: FilterOption[] = [
  { value: "all", label: "Todas as faixas de valor", shortLabel: "Preço" },
  { value: "under-260", label: "Até R$ 260 mil", shortLabel: "Até 260k" },
  { value: "over-260", label: "A partir de R$ 260 mil", shortLabel: "+ 260k" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "default", label: "Destaques (Padrão)", shortLabel: "Ordenar" },
  { value: "price-asc", label: "Menor Valor", shortLabel: "Menor $" },
  { value: "price-desc", label: "Maior Valor", shortLabel: "Maior $" },
  { value: "name-asc", label: "Nome (A - Z)", shortLabel: "Nome A-Z" },
];

const lancamentosCategoryMeta: Record<
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
  "Condomínio Clube": {
    icon: Sparkles,
    label: "Condomínio",
    line2: "Clube",
  },
  "Lotes Panorâmicos": {
    icon: Mountain,
    label: "Lotes",
    line2: "Panorâmicos",
  },
};

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos & Condomínios — Ismael Dias | Habittat House Teresópolis" },
      {
        name: "description",
        content:
          "Lançamentos residenciais da Angeleti Construtora em Teresópolis: Golden Green e Vale dos Pássaros. Terrenos em condomínio fechado com entrada de 15% e até 120 parcelas direto com a incorporadora.",
      },
      { property: "og:title", content: "Lançamentos e Condomínios Fechados — Habittat House" },
      {
        property: "og:description",
        content:
          "Encontre seu lote em condomínio fechado com clube de lazer e vistas para o Dedo de Deus na serra fluminense.",
      },
    ],
  }),
  component: LancamentosPage,
});

function LancamentosPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("white");
  const [productList, setProductList] = useState<ProductItem[]>(lancamentosProducts);
  const [activeFilter, setActiveFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("cat");
      if (catParam) return catParam;
      const saved = sessionStorage.getItem("lancamentos_active_filter");
      if (saved) return saved;
    }
    return "Todos";
  });
  const [selectedBairro, setSelectedBairro] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const bParam = urlParams.get("bairro");
      if (bParam) return bParam;
      const saved = sessionStorage.getItem("lancamentos_selected_bairro");
      if (saved) return saved;
    }
    return "Todos";
  });
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("lancamentos_price_range");
      if (saved) return saved;
    }
    return "all";
  });
  const [sortBy, setSortBy] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("lancamentos_sort_by");
      if (saved) return saved;
    }
    return "default";
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("lancamentos_search_query");
      if (saved) return saved;
    }
    return "";
  });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());

  // Salva filtros de lançamentos no sessionStorage com debounce para digitação fluida
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lancamentos_active_filter", activeFilter);
          sessionStorage.setItem("lancamentos_selected_bairro", selectedBairro);
          sessionStorage.setItem("lancamentos_price_range", selectedPriceRange);
          sessionStorage.setItem("lancamentos_sort_by", sortBy);
          sessionStorage.setItem("lancamentos_search_query", searchQuery);
        } catch (_) {}
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [activeFilter, selectedBairro, selectedPriceRange, sortBy, searchQuery]);

  // Monitora e salva scroll com debounce de 150ms sem travar a renderização
  useEffect(() => {
    let scrollTimer: any;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        try {
          sessionStorage.setItem("lancamentos_scroll_y", String(window.scrollY));
        } catch (_) {}
      }, 150);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Restaura posição de scroll ao voltar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScroll = sessionStorage.getItem("lancamentos_scroll_y");
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
    trackPageView("/lancamentos");

    const handleSettingsChanged = (e: any) => {
      setSiteSettings(e.detail || getSiteSettings());
    };
    window.addEventListener("site-settings-changed", handleSettingsChanged);

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("habittat_theme") as ThemeMode | null;
      if (saved === "black-piano" || saved === "white") {
        setCurrentTheme(saved);
        const root = document.documentElement;
        root.classList.remove("theme-white", "theme-black-piano", "dark");
        if (saved === "black-piano") {
          root.classList.add("theme-black-piano", "dark");
        } else {
          root.classList.add("theme-white");
        }
      }
    }

    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsChanged);
    };
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = currentTheme === "black-piano" ? "white" : "black-piano";
    setCurrentTheme(next);
    const root = document.documentElement;
    root.classList.remove("theme-white", "theme-black-piano", "dark");
    if (next === "black-piano") {
      root.classList.add("theme-black-piano", "dark");
    } else {
      root.classList.add("theme-white");
    }
    localStorage.setItem("habittat_theme", next);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: next } }));
  };

  const handleOrderWhatsApp = (prod: ProductItem) => {
    trackWhatsAppClick(
      prod.sku || "",
      prod.name,
      prod.bairro || "Teresópolis",
      prod.price
    );

    const text = `Olá, Ismael Dias! Vi este lançamento no seu site e gostaria de informações sobre lotes disponíveis:

🏔️ *Empreendimento:* ${prod.name}
📍 *Localização:* ${prod.screen || "Teresópolis/RJ"}
📐 *Metragem:* ${prod.storage || "Lote Residencial"}
💰 *Valor:* A partir de ${fmt(prod.price)}
✨ *Condição:* ${prod.chip || "15% de entrada + saldo em até 120 parcelas"}

Gostaria de agendar uma visita guiada com você no local!`;

    const targetNumber = siteSettings.whatsappNumber || WHATSAPP_NUMBER;
    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const deferredSearch = useDeferredValue(searchQuery);

  // Filter & Search otimizado com useMemo
  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const bLower = selectedBairro.toLowerCase();

    return productList
      .filter((item) => {
        const matchCat =
          activeFilter === "Todos" ||
          item.cat === activeFilter;

        if (!matchCat) return false;

        const matchBairro =
          selectedBairro === "Todos" ||
          (item.bairro && item.bairro.toLowerCase() === bLower) ||
          (item.screen && item.screen.toLowerCase().includes(bLower));

        if (!matchBairro) return false;

        let matchPrice = true;
        if (selectedPriceRange === "under-260") {
          matchPrice = item.price <= 260000;
        } else if (selectedPriceRange === "over-260") {
          matchPrice = item.price > 260000;
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
  }, [productList, activeFilter, selectedBairro, selectedPriceRange, sortBy, deferredSearch]);

  const hasActiveFilters =
    activeFilter !== "Todos" ||
    selectedBairro !== "Todos" ||
    selectedPriceRange !== "all" ||
    sortBy !== "default" ||
    searchQuery.trim() !== "";

  const handleClearAllFilters = () => {
    setActiveFilter("Todos");
    setSelectedBairro("Todos");
    setSelectedPriceRange("all");
    setSortBy("default");
    setSearchQuery("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lancamentos_active_filter");
      sessionStorage.removeItem("lancamentos_selected_bairro");
      sessionStorage.removeItem("lancamentos_price_range");
      sessionStorage.removeItem("lancamentos_sort_by");
      sessionStorage.removeItem("lancamentos_search_query");
      sessionStorage.removeItem("lancamentos_scroll_y");
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="pt-24 sm:pt-28 pb-36 sm:pb-24 px-3 sm:px-6 max-w-7xl mx-auto">
        {/* H1 Semântico Oculto para SEO e Acessibilidade */}
        <h1 className="sr-only">
          Novos Lançamentos de Terrenos e Lotes na Serra - Ismael Dias Corretor
        </h1>

        {/* Container Mestre Unificado: Busca + Botão Seleção de Categorias + Filtros */}
        <div className="mt-2 sm:mt-4 max-w-xl sm:max-w-2xl lg:max-w-4xl mx-auto glass rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2 relative z-30">
          {/* Linha 1: Barra de Busca + Botão de Seleção de Categorias */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por condomínio ou localização..."
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
                const meta = lancamentosCategoryMeta[activeFilter] || { icon: LayoutGrid, label: activeFilter };
                const Icon = meta.icon;
                return <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
              })()}
              <span className="truncate max-w-[85px] sm:max-w-[130px]">
                {activeFilter === "Todos" ? "Categorias" : activeFilter}
              </span>
              {activeFilter !== "Todos" && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-white/25 text-white leading-none">
                  {productList.filter((p) => p.cat === activeFilter).length}
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

              <div className="grid grid-cols-3 gap-1 sm:gap-1.5 max-w-[360px] sm:max-w-[420px] mx-auto w-full">
                {lancamentosFilters.map((fl) => {
                  const meta = lancamentosCategoryMeta[fl] || { icon: LayoutGrid, label: fl };
                  const Icon = meta.icon;
                  const count =
                    fl === "Todos"
                      ? productList.length
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

          {/* Linha 2: Filtros Dropdown (Bairro/Região, Preço, Ordenar) — Grid 3 colunas */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full py-0.5 relative z-20">
            {/* Dropdown Região */}
            <FilterDropdown
              icon={MapPin}
              label="Região"
              value={selectedBairro}
              options={LANCAMENTOS_BAIRRO_OPTIONS}
              onChange={setSelectedBairro}
              searchable={false}
              align="left"
            />

            {/* Dropdown Faixa de Preço */}
            <FilterDropdown
              icon={DollarSign}
              label="Preço"
              value={selectedPriceRange}
              options={LANCAMENTOS_PRICE_OPTIONS}
              onChange={setSelectedPriceRange}
              searchable={false}
              align="center"
            />

            {/* Dropdown Ordenação */}
            <FilterDropdown
              icon={ArrowUpDown}
              label="Ordenar"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
              searchable={false}
              align="right"
            />
          </div>

          {/* Feedback de Filtros Ativos e Botão de Limpar */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50">
              <span className="truncate">
                Filtrando: <strong className="text-slate-800 dark:text-slate-200">{filtered.length}</strong> encontrados
              </span>
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-blue-600 dark:text-sky-400 hover:underline font-bold shrink-0 ml-2 cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Grade de Lançamentos — Exclusivo modo Grade */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-16 glass rounded-3xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold">Nenhum lançamento encontrado para essa busca</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tente buscar por outro termo ou limpe os filtros.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
            >
              Ver todos os lançamentos
            </button>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {filtered.map((prod, idx) => (
              <div
                key={prod.name + idx}
                className="group relative rounded-2xl sm:rounded-3xl glass p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl border border-slate-200/60 dark:border-slate-800/80 hover:-translate-y-1 overflow-hidden min-w-0"
              >
                {/* Badge Superior com SKU */}
                <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
                  <span className="text-[9px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 truncate max-w-[125px] sm:max-w-none bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/60">
                    {prod.badge}
                  </span>
                  {prod.sku && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                      #{prod.sku}
                    </span>
                  )}
                </div>

                {/* Imagem do Terreno com Metragem Sobreposta */}
                <Link
                  to="/imovel/$sku"
                  params={{ sku: String(prod.sku) }}
                  className="relative aspect-4/3 w-full flex items-center justify-center mb-2 cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 block group/img"
                >
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                  />
                  {prod.storage ? (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-slate-900/85 text-white backdrop-blur-xs shadow-xs border border-white/10">
                      {prod.storage}
                    </span>
                  ) : null}
                </Link>

                {/* Dados do Empreendimento */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      to="/imovel/$sku"
                      params={{ sku: String(prod.sku) }}
                      className="text-xs sm:text-sm font-black card-property-title text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 transition block"
                      title={prod.name}
                    >
                      {prod.name}
                    </Link>

                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{prod.screen || `${prod.bairro || "Teresópolis"}, Teresópolis/RJ`}</span>
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-[13px] sm:text-lg font-black text-blue-600 dark:text-sky-400 truncate">
                        {fmt(prod.price)}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {prod.chip || "15% entrada + até 120 parcelas direto"}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 pt-1.5 sm:pt-2">
                  <button
                    onClick={() => handleOrderWhatsApp(prod)}
                    className="w-full py-1.5 sm:py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap min-w-0"
                  >
                    <WhatsAppIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                    <span className="truncate">WhatsApp</span>
                  </button>

                  <Link
                    to="/imovel/$sku"
                    params={{ sku: String(prod.sku) }}
                    className="w-full py-1.5 sm:py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap min-w-0"
                  >
                    <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Ficha</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner de Consultoria com Ismael Dias */}
        <div className="mt-16 rounded-3xl p-6 sm:p-10 glass border border-blue-500/30 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-sky-400 mb-3 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Plantão de Vendas Angeleti</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Deseja conhecer a planta e os lotes disponíveis?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
              Fale diretamente com Ismael Dias na Habittat House. Te apresento as plantas com metragens exatas, mapa de disponibilidade e simulação personalizada em até 120 parcelas direto com a Angeleti.
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
