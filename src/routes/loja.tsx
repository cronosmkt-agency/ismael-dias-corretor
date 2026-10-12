import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Home,
  LayoutGrid,
  Search,
  MessageCircle,
  Info,
  Check,
  ShieldCheck,
  Building2,
  Filter,
  Trees,
  MapPin,
  ArrowRight,
  Sparkles,
  Mountain,
  ChevronDown,
  DollarSign,
  ArrowUpDown,
  RotateCcw,
  Crown,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import { ProductDetailModal, type ProductItem } from "@/components/ProductDetailModal";
import {
  imoveisAvulsosProducts,
  imoveisFilters,
  fmt,
  WHATSAPP,
  WHATSAPP_NUMBER,
  PHONE_DISPLAY,
} from "@/data/storeData";
import { ALL_BAIRROS } from "@/data/imoveisData";

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
    label: "Aparta-",
    line2: "mentos",
  },
  "Coberturas": {
    icon: Crown,
    label: "Cober-",
    line2: "turas",
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
    label: "Comer-",
    line2: "ciais",
  },
};

const BAIRRO_OPTIONS = [
  { value: "Todos", label: "Todos os Bairros" },
  { value: "Teresópolis (Todos)", label: "Teresópolis (Todos)" },
  ...ALL_BAIRROS.filter((b) => b !== "Todos" && b !== "Teresópolis (Todos)").map((b) => ({
    value: b,
    label: b,
  })),
];

const PRICE_RANGE_OPTIONS = [
  { value: "all", label: "Todas as faixas de valor" },
  { value: "under-300", label: "Até R$ 300 mil" },
  { value: "300-600", label: "R$ 300 mil a R$ 600 mil" },
  { value: "600-1000", label: "R$ 600 mil a R$ 1 Milhão" },
  { value: "1000-2000", label: "R$ 1 Milhão a R$ 2 Milhões" },
  { value: "over-2000", label: "Acima de R$ 2 Milhões" },
];

const SORT_OPTIONS = [
  { value: "default", label: "Destaques (Padrão)" },
  { value: "price-asc", label: "Menor Valor" },
  { value: "price-desc", label: "Maior Valor" },
  { value: "name-asc", label: "Nome (A - Z)" },
];

interface FilterDropdownProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  searchable?: boolean;
  className?: string;
}

function FilterDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  searchable = false,
  className = "",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOpt = options.find((o) => o.value === value);
  const isDefault = !selectedOpt || selectedOpt.value === options[0]?.value;
  const displayText = isDefault ? label : selectedOpt.label;

  const filteredOptions =
    searchable && searchTerm.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchTerm("");
        }}
        className={`flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border select-none shrink-0 whitespace-nowrap ${
          !isDefault
            ? "bg-blue-50/90 dark:bg-sky-950/70 border-blue-400 dark:border-sky-600 text-blue-700 dark:text-sky-300 ring-2 ring-blue-500/20"
            : "glass border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-700 bg-white/90 dark:bg-slate-900/90"
        }`}
      >
        <div className="flex items-center gap-1 min-w-0">
          <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate max-w-[100px] sm:max-w-[140px] text-left">
            {displayText}
          </span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-50 min-w-[210px] max-w-[280px] rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 max-h-72 flex flex-col">
          {searchable && (
            <div className="p-1 mb-1 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar bairro..."
                className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto overscroll-contain flex-1 divide-y divide-slate-100/40 dark:divide-slate-800/40">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("white");
  const [productList, setProductList] = useState<ProductItem[]>(imoveisAvulsosProducts);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [selectedBairro, setSelectedBairro] = useState<string>("Todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"compact" | "showcase">("compact");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
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

  const handleOpenDetail = (prod: ProductItem) => {
    setSelectedProduct(prod);
    setModalOpen(true);
  };

  const handleOrderWhatsApp = (prod: ProductItem) => {
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

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Filter & Search
  const filtered = productList
    .filter((item) => {
      const matchCat =
        activeFilter === "Todos" || item.cat === activeFilter;

      const matchBairro =
        selectedBairro === "Todos" ||
        (selectedBairro === "Teresópolis (Todos)" &&
          ((item.screen && item.screen.toLowerCase().includes("teresópolis")) ||
            item.bairro === "Teresópolis")) ||
        (item.bairro && item.bairro.toLowerCase() === selectedBairro.toLowerCase()) ||
        (item.screen && item.screen.toLowerCase().includes(selectedBairro.toLowerCase()));

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

      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.storage && item.storage.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.screen && item.screen.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.sku && item.sku.includes(searchQuery.trim()));

      return matchCat && matchBairro && matchPrice && matchSearch;
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
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="pt-20 sm:pt-32 pb-36 sm:pb-24 px-3 sm:px-6 max-w-7xl mx-auto">
        {/* Header da Página de Imóveis */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold glass mb-2 border border-blue-500/20 text-blue-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Imóveis Selecionados</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Casas, Coberturas & <span className="text-gradient-blue">Residências</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Carteira selecionada de imóveis avulsos prontos para morar em Teresópolis — RJ com o corretor Ismael Dias
          </p>

          {/* Banner Chamada para Lançamentos — Garantido em 1 Linha com whitespace-nowrap */}
          <div className="mt-4 flex justify-center">
            <Link
              to="/lancamentos"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-sky-950/60 border border-blue-200/80 dark:border-sky-800/80 text-xs shadow-2xs hover:border-blue-400 transition-all active:scale-98 whitespace-nowrap"
            >
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] sm:text-[10px] shrink-0">
                NOVO
              </span>
              <span className="text-slate-700 dark:text-slate-200 text-[11px] sm:text-xs font-medium">
                <span className="hidden sm:inline">Procurando lotes em condomínio fechado?</span>
                <span className="sm:hidden">Lotes em condomínio fechado?</span>
              </span>
              <span className="font-bold text-blue-600 dark:text-sky-400 flex items-center gap-0.5 text-[11px] sm:text-xs shrink-0">
                <span>Ver Lançamentos</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>

        {/* Seletor de Categorias — 8 categorias completas no mobile (4x2) e desktop (8x1) */}
        <div className="mt-5 sm:mt-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {imoveisFilters.map((fl) => {
              const meta = imoveisCategoryMeta[fl] || { icon: LayoutGrid, label: fl };
              const Icon = meta.icon;
              const count =
                fl === "Todos"
                  ? productList.length
                  : productList.filter((p) => p.cat === fl).length;
              const isActive = activeFilter === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setActiveFilter(fl)}
                  className={`group relative flex flex-col items-center justify-between w-full h-[80px] sm:h-[86px] p-1.5 sm:p-2 rounded-2xl border-2 transition-colors duration-150 cursor-pointer text-center select-none shadow-xs ${
                    isActive
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-sky-600 border-blue-500 dark:border-sky-400 text-white shadow-md"
                      : "bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  }`}
                >
                  {/* Badge Contador no Canto Superior Direito */}
                  <span
                    className={`absolute top-1 right-1 sm:top-1 sm:right-1 text-[9px] px-1.5 py-0.2 rounded-full font-black leading-none transition-colors ${
                      isActive
                        ? "bg-white/30 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
                    }`}
                  >
                    {count}
                  </span>

                  {/* Ícone em Cima */}
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-50/80 dark:bg-slate-800/80 text-blue-600 dark:text-sky-400 group-hover:scale-110"
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  </div>

                  {/* Texto Pequeno Embaixo */}
                  <div className="flex flex-col items-center justify-center leading-tight">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-tight">
                      {meta.label}
                    </span>
                    {meta.line2 ? (
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-tight opacity-90">
                        {meta.line2}
                      </span>
                    ) : (
                      <span className="invisible text-[9px] leading-none select-none">&nbsp;</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Container Unificado de Busca & Filtros (Compacto e Integrado) */}
        <div className="mt-4 sm:mt-5 max-w-xl mx-auto glass rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          {/* Barra de Busca Compacta e Encurtada */}
          <div className="relative">
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
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtros em Linha Coesa com Rolagem Suave no Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none py-0.5 justify-start sm:justify-center">
            {/* Dropdown Bairro */}
            <FilterDropdown
              icon={MapPin}
              label="Bairro"
              value={selectedBairro}
              options={BAIRRO_OPTIONS}
              onChange={setSelectedBairro}
              searchable={true}
            />

            {/* Dropdown Faixa de Preço */}
            <FilterDropdown
              icon={DollarSign}
              label="Preço"
              value={selectedPriceRange}
              options={PRICE_RANGE_OPTIONS}
              onChange={setSelectedPriceRange}
            />

            {/* Dropdown Ordenação */}
            <FilterDropdown
              icon={ArrowUpDown}
              label="Ordenar"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
            />

            {/* Alternador Grade / Vitrine */}
            <div className="flex items-center p-0.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "compact"
                    ? "btn-primary-glow text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Grade 2 por linha"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs">Grade</span>
              </button>

              <button
                onClick={() => setViewMode("showcase")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "showcase"
                    ? "btn-primary-glow text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Vitrine 1 por linha"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs">Vitrine</span>
              </button>
            </div>

            {/* Botão Limpar Filtros quando algum filtro estiver ativo */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 transition cursor-pointer shrink-0 shadow-2xs"
                title="Limpar todos os filtros e busca"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[10px]">Limpar</span>
              </button>
            )}
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
          <div
            className={`mt-6 sm:mt-8 ${
              viewMode === "showcase" ? "hidden sm:grid" : "grid"
            } grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6`}
          >
            {filtered.map((prod, idx) => (
              <div
                key={prod.name + idx}
                className="group relative rounded-2xl sm:rounded-3xl glass p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl border border-slate-200/60 dark:border-slate-800/80 hover:-translate-y-1 overflow-hidden min-w-0"
              >
                {/* Badge Superior com SKU */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-md border ${
                      prod.badge === "VENDIDA"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/60"
                    }`}
                  >
                    {prod.badge}
                  </span>
                  {prod.sku && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      #{prod.sku}
                    </span>
                  )}
                </div>

                {/* Imagem do Imóvel com Metragem Sobreposta */}
                <div
                  onClick={() => handleOpenDetail(prod)}
                  className="relative aspect-4/3 w-full flex items-center justify-center mb-2 cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50"
                >
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.storage ? (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-slate-900/85 text-white backdrop-blur-xs shadow-xs border border-white/10">
                      {prod.storage}
                    </span>
                  ) : null}
                </div>

                {/* Dados do Imóvel */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => handleOpenDetail(prod)}
                      className="text-xs sm:text-sm font-black line-clamp-2 min-h-[2.2rem] text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-sky-400 transition"
                      title={prod.name}
                    >
                      {prod.name}
                    </h3>

                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{prod.screen || "Teresópolis/RJ"}</span>
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-[13px] sm:text-lg font-black text-blue-600 dark:text-sky-400 truncate">
                        {fmt(prod.price)}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {prod.chip || "Condições facilitadas"}
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

                  <button
                    onClick={() => handleOpenDetail(prod)}
                    className="w-full py-1.5 sm:py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap min-w-0"
                  >
                    <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span>Ficha</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modo Vitrine Mobile (1 por linha) — Sem sobreposicao de botoes e precos */}
        {viewMode === "showcase" && (
          <div className="sm:hidden mt-4 space-y-3 w-full min-w-0">
            {filtered.map((prod, idx) => (
              <div
                key={prod.name + idx + "-showcase"}
                className="rounded-2xl glass p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3 transition-all hover:shadow-md w-full min-w-0 overflow-hidden"
              >
                {/* Imagem do Imóvel à esquerda */}
                <div
                  onClick={() => handleOpenDetail(prod)}
                  className="relative w-24 h-24 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50 cursor-pointer overflow-hidden"
                >
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {prod.storage ? (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded text-[8px] font-black bg-slate-900/85 text-white backdrop-blur-xs">
                      {prod.storage}
                    </span>
                  ) : null}
                </div>

                {/* Informações e Botões à direita */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          prod.badge === "VENDIDA"
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                            : "bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/40"
                        }`}
                      >
                        {prod.badge}
                      </span>
                      {prod.sku && (
                        <span className="text-[10px] font-bold text-slate-400">#{prod.sku}</span>
                      )}
                    </div>

                    <h3
                      onClick={() => handleOpenDetail(prod)}
                      className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 cursor-pointer"
                      title={prod.name}
                    >
                      {prod.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{prod.screen || "Teresópolis/RJ"}</span>
                    </p>
                  </div>

                  {/* Linha Inferior: Preço + Condições e Botões Abaixo (Sem Sobreposição) */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-1 min-w-0">
                      <span className="text-[13px] font-black text-blue-600 dark:text-sky-400 truncate">
                        {fmt(prod.price)}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate text-right">
                        {prod.chip || "Facilitado"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleOrderWhatsApp(prod)}
                        className="py-1 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap min-w-0"
                      >
                        <WhatsAppIcon className="w-3 h-3 text-white shrink-0" />
                        <span className="truncate">WhatsApp</span>
                      </button>
                      <button
                        onClick={() => handleOpenDetail(prod)}
                        className="py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap min-w-0"
                      >
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Ficha</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Modal de Especificações */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        whatsappNumber={WHATSAPP_NUMBER}
      />

      <SiteFooter currentTheme={currentTheme} />
      <WhatsFloat />
      <MobileBottomNav />
    </div>
  );
}
