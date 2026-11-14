import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
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
  ShieldCheck,
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

interface LancamentoShowcaseCardProps {
  prod: ProductItem;
  onWhatsApp: (prod: ProductItem) => void;
}

function LancamentoShowcaseCard({ prod, onWhatsApp }: LancamentoShowcaseCardProps) {
  const isGoldenGreen = prod.sku === "324009" || prod.name.includes("Golden Green");

  const highlights = isGoldenGreen
    ? [
        { label: "Até 120x Direto Angeleti", icon: DollarSign, color: "text-[#C5A880]" },
        { label: "Vistas Panorâmicas Dedo de Deus", icon: Mountain, color: "text-emerald-500" },
        { label: "Portaria Blindada 24h", icon: ShieldCheck, color: "text-[#C5A880]" },
      ]
    : [
        { label: "Até 120x Direto Angeleti", icon: DollarSign, color: "text-[#C5A880]" },
        { label: "Clube de Lazer & Piscinas", icon: Sparkles, color: "text-emerald-500" },
        { label: "345 mil m² Área Verde", icon: Mountain, color: "text-[#C5A880]" },
      ];

  const shortDesc = isGoldenGreen
    ? "Empreendimento de alto padrão no KM 4,5 (Albuquerque). Lotes amplos de 400 m² a 1.500 m² prontos para construir, vista 360º para o Dedo de Deus e portaria 24h."
    : "Condomínio residencial a 5 minutos do Centro na Prata. Clube privativo com piscina semiolímpica, quadra de tênis oficial, academia e natureza preservada.";

  return (
    <article className="group relative rounded-2xl sm:rounded-3xl glass p-3 sm:p-5 lg:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-[#1A3828]/40 dark:hover:border-[#C5A880]/50 hover:-translate-y-1 overflow-hidden min-w-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
      <div>
        {/* Selo Nobre Topo com Condição e SKU */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9.5px] sm:text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-[#1A3828] to-[#2A523A] dark:from-[#C5A880] dark:to-[#B39366] text-white dark:text-[#0D0E11] shadow-xs shrink-0">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{prod.badge || "Lançamento Angeleti"}</span>
          </span>
          {prod.sku && (
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700/60 shrink-0">
              #{prod.sku}
            </span>
          )}
        </div>

        {/* Imagem do Empreendimento em Aspect Ratio Nobre com Metragem e Região sobrepostas */}
        <Link
          to="/imovel/$sku"
          params={{ sku: String(prod.sku || "") }}
          className="relative aspect-16/10 w-full flex items-center justify-center mb-3 sm:mb-4 cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 block group/img shadow-inner"
        >
          <img
            src={prod.img}
            alt={prod.name}
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

          {/* Badges Flutuantes sobre a Imagem */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1.5 text-white pointer-events-none">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9.5px] sm:text-[11px] font-extrabold bg-slate-900/85 backdrop-blur-md border border-white/15 shadow-sm truncate max-w-[55%]">
              {prod.storage || "Lotes Residenciais"}
            </span>
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9.5px] sm:text-[11px] font-bold bg-[#1A3828]/85 dark:bg-[#C5A880]/90 text-white dark:text-[#0D0E11] backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{prod.bairro || "Teresópolis"}</span>
            </span>
          </div>
        </Link>

        {/* Título e Descrição */}
        <div>
          <Link
            to="/imovel/$sku"
            params={{ sku: String(prod.sku || "") }}
            className="font-serif font-black text-sm sm:text-lg lg:text-xl text-slate-900 dark:text-stone-100 hover:text-[#1A3828] dark:hover:text-[#C5A880] transition block leading-snug tracking-tight"
            title={prod.name}
          >
            {prod.name}
          </Link>

          <p className="text-[11px] sm:text-xs lg:text-sm text-stone-600 dark:text-stone-400 mt-1 sm:mt-1.5 leading-relaxed font-sans line-clamp-2">
            {shortDesc}
          </p>

          {/* Badges de Destaque: Até 120x, Clube de Lazer, Vistas Panorâmicas */}
          <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5">
            {highlights.map((h, i) => {
              const HIcon = h.icon;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[10.5px] font-bold bg-stone-100/90 dark:bg-stone-800/90 text-slate-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/80"
                >
                  <HIcon className={`w-3 h-3 ${h.color} shrink-0`} />
                  <span>{h.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bloco de Valor e Ações */}
      <div className="mt-3.5 sm:mt-4">
        {/* Preço e Condição */}
        <div className="pt-2.5 sm:pt-3 border-t border-stone-200/60 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 sm:gap-2">
          <div>
            <span className="text-[9.5px] sm:text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
              Lotes a partir de
            </span>
            <span className="font-serif font-black text-base sm:text-xl lg:text-2xl text-[#1A3828] dark:text-[#C5A880]">
              {fmt(prod.price)}
            </span>
          </div>
          <span className="text-[9.5px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 sm:py-1 rounded-lg self-start sm:self-auto">
            15% Entrada + até 120x Direto
          </span>
        </div>

        {/* Botões de Ação Nobres: WhatsApp e Ficha */}
        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/50">
          <button
            type="button"
            onClick={() => onWhatsApp(prod)}
            className="w-full py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 sm:gap-1.5 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer whitespace-nowrap min-w-0"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">Consultar Lotes</span>
          </button>

          <Link
            to="/imovel/$sku"
            params={{ sku: String(prod.sku || "") }}
            className="w-full py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold border border-[#1A3828]/30 dark:border-[#C5A880]/40 text-[#1A3828] dark:text-[#C5A880] hover:bg-[#1A3828]/10 dark:hover:bg-[#C5A880]/15 flex items-center justify-center gap-1 sm:gap-1.5 transition cursor-pointer whitespace-nowrap min-w-0"
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ficha do Projeto</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

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
  const { currentTheme, setCurrentTheme, toggleTheme } = useHabittatTheme();
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

    return () => {
      window.removeEventListener("site-settings-changed", handleSettingsChanged);
    };
  }, []);

  const handleOrderWhatsApp = useCallback((prod: ProductItem) => {
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

    const rawNumber = siteSettings.whatsappNumber || WHATSAPP_NUMBER;
    const targetNumber = String(rawNumber).replace(/\D/g, "");
    window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`, "_blank");
  }, [siteSettings.whatsappNumber]);

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

  const handleClearAllFilters = useCallback(() => {
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
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="pt-24 sm:pt-28 pb-36 sm:pb-24 px-2.5 sm:px-6 max-w-7xl mx-auto">
        {/* H1 Semântico Oculto para SEO e Acessibilidade */}
        <h1 className="sr-only">
          Novos Lançamentos de Terrenos e Lotes na Serra - Ismael Dias Corretor
        </h1>

        {/* Container Mestre Unificado: Busca + Botão Seleção de Categorias + Filtros */}
        <div className="mt-2 sm:mt-4 max-w-xl sm:max-w-2xl lg:max-w-4xl mx-auto glass rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5 sm:space-y-2 relative z-30">
          {/* Linha 1: Barra de Busca + Botão de Seleção de Categorias */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por condomínio ou localização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-12 sm:pr-14 py-1.5 sm:py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1A3828]/50 dark:focus:ring-[#C5A880]/50 transition text-slate-900 dark:text-white placeholder:text-[11px] sm:placeholder:text-xs placeholder:text-stone-400 dark:placeholder:text-stone-500 placeholder:truncate"
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

            {/* Botão de Seleção de Categorias */}
            <button
              type="button"
              onClick={() => setIsCategoryOpen((prev) => !prev)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[380px]:px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 border select-none ${
                activeFilter !== "Todos"
                  ? "bg-gradient-to-r from-[#1A3828] to-[#2A523A] dark:from-[#C5A880] dark:to-[#B39366] text-white dark:text-[#0D0E11] border-[#1A3828] dark:border-[#C5A880] shadow-sm"
                  : isCategoryOpen
                  ? "bg-stone-100 dark:bg-stone-800 text-[#1A3828] dark:text-[#C5A880] border-[#1A3828]/40 dark:border-[#C5A880]/40 shadow-2xs"
                  : "bg-stone-100/90 dark:bg-stone-800/90 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border-stone-200/80 dark:border-stone-700/80 text-stone-700 dark:text-stone-200 shadow-2xs"
              }`}
              title="Filtrar por Categoria"
            >
              {(() => {
                const meta = lancamentosCategoryMeta[activeFilter] || { icon: LayoutGrid, label: activeFilter };
                const Icon = meta.icon;
                return <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
              })()}
              <span className="truncate max-w-[64px] min-[380px]:max-w-[85px] sm:max-w-[130px] text-[11px] min-[380px]:text-xs sm:text-sm">
                {activeFilter === "Todos" ? "Categorias" : activeFilter}
              </span>
              {activeFilter !== "Todos" && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-white/25 text-white leading-none">
                  {productList.filter((p) => p.cat === activeFilter).length}
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 shrink-0 ${
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
                    className="text-[10px] sm:text-xs font-bold text-[#1A3828] dark:text-[#C5A880] hover:underline cursor-pointer"
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
                          ? "bg-gradient-to-br from-[#1A3828] to-[#2A523A] dark:from-[#C5A880] dark:to-[#B39366] border-[#1A3828] dark:border-[#C5A880] text-white dark:text-[#0D0E11] shadow-xs scale-102"
                          : "bg-white/95 dark:bg-stone-900/90 border-stone-200/80 dark:border-stone-800/80 text-stone-700 dark:text-stone-300 hover:border-[#1A3828]/40 dark:hover:border-[#C5A880]/40 hover:bg-stone-50 dark:hover:bg-stone-800/70"
                      }`}
                    >
                      {/* Badge Contador no Canto Superior Direito */}
                      <span
                        className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 rounded-full font-black leading-none transition-colors ${
                          isActive
                            ? "bg-white/30 text-white dark:text-[#0D0E11]"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200/60 dark:border-stone-700/60"
                        }`}
                      >
                        {count}
                      </span>

                      {/* Ícone em Cima */}
                      <div
                        className={`p-1 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-white/20 text-white dark:text-[#0D0E11]"
                            : "bg-stone-100 dark:bg-stone-800 text-[#1A3828] dark:text-[#C5A880] group-hover:scale-105"
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
          <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full py-0.5 relative z-20">
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
                className="text-[#1A3828] dark:text-[#C5A880] hover:underline font-bold shrink-0 ml-2 cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Showcase Nobre de Lançamentos — Golden Green e Vale dos Pássaros */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-16 glass rounded-3xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold">Nenhum lançamento encontrado para essa busca</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tente buscar por outro termo ou limpe os filtros.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1A3828] dark:bg-[#C5A880] text-white dark:text-[#0D0E11] text-xs font-bold cursor-pointer hover:opacity-90 shadow-xs"
            >
              Ver todos os lançamentos
            </button>
          </div>
        ) : filtered.length <= 2 ? (
          /* Formato Showcase Nobre em 2 colunas amplas ou centralizado */
          <div className="mt-6 sm:mt-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {filtered.map((prod, idx) => (
              <LancamentoShowcaseCard
                key={prod.sku ? `lanc-${prod.sku}` : `${prod.name}-${idx}`}
                prod={prod}
                onWhatsApp={handleOrderWhatsApp}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((prod, idx) => (
              <LancamentoShowcaseCard
                key={prod.sku ? `lanc-${prod.sku}` : `${prod.name}-${idx}`}
                prod={prod}
                onWhatsApp={handleOrderWhatsApp}
              />
            ))}
          </div>
        )}

        {/* Banner de Consultoria com Ismael Dias */}
        <div className="mt-16 rounded-3xl p-6 sm:p-10 glass border border-[#1A3828]/20 dark:border-[#C5A880]/30 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1A3828]/10 dark:bg-[#C5A880]/15 text-[#1A3828] dark:text-[#C5A880] mb-3 border border-[#1A3828]/20 dark:border-[#C5A880]/30">
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
