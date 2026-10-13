import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";
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

interface FilterDropdownProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
  searchable?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

function FilterDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  searchable = false,
  className = "",
  align = "left",
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
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }, 50);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen]);

  const selectedOpt = options.find((o) => o.value === value);
  const isDefault = !selectedOpt || selectedOpt.value === options[0]?.value;
  const displayText = isDefault ? label : selectedOpt.shortLabel || selectedOpt.label;

  const filteredOptions =
    searchable && searchTerm.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

  const alignmentClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
      ? "right-0 left-auto"
      : "left-0 right-auto";

  return (
    <div ref={dropdownRef} className={`relative w-full min-w-0 ${className}`}>
      <button
        type="button"
        title={isDefault ? label : selectedOpt?.label}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchTerm("");
        }}
        className={`w-full flex items-center justify-between gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs border select-none min-w-0 focus:outline-hidden outline-none ${
          !isDefault
            ? "bg-blue-50/90 dark:bg-sky-950/70 border-blue-400 dark:border-sky-600 text-blue-700 dark:text-sky-300 ring-2 ring-blue-500/20"
            : "glass border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-700 bg-white/90 dark:bg-slate-900/90"
        }`}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1 justify-center sm:justify-start">
          <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate text-center sm:text-left">
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
        <div
          className={`absolute ${alignmentClass} top-full mt-1.5 z-[100] min-w-[210px] sm:min-w-[230px] max-w-[calc(100vw-28px)] rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 max-h-72 flex flex-col`}
        >
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [productList, setProductList] = useState<ProductItem[]>(getAllProperties());
  const [visibleCount, setVisibleCount] = useState<number>(16);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [selectedBairro, setSelectedBairro] = useState<string>("Todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"compact" | "showcase">("compact");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

    return () => {
      window.removeEventListener("properties-data-changed", handlePropsChanged);
      window.removeEventListener("site-settings-changed", handleSettingsChanged);
    };
  }, []);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(16);
  }, [activeFilter, selectedBairro, selectedPriceRange, sortBy, searchQuery]);

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
  };

  // Filter & Search
  const filtered = productList
    .filter((item) => {
      // Ocultar imóveis vendidos do catálogo público quando ativado (padrão)
      const isSold = item.badge === "VENDIDA" || item.condition === "VENDIDA";
      if (isSold && siteSettings.hideSoldProperties !== false) {
        const isDirectSkuSearch = searchQuery.trim() !== "" && item.sku === searchQuery.trim();
        if (!isDirectSkuSearch) {
          return false;
        }
      }

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

  const displayed = filtered.slice(0, visibleCount);

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
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Casas, Coberturas & <span className="text-gradient-blue">Residências</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Carteira selecionada de imóveis avulsos prontos para morar em Teresópolis
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
        <div className="mt-4 sm:mt-5 max-w-xl mx-auto glass rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2 relative z-30">
          {/* Linha 1: Barra de Busca + Alternador Grade/Vitrine no mobile (oculto no web) */}
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

            {/* Alternador Grade / Vitrine: VISÍVEL SOMENTE NO MOBILE (sm:hidden), JUNTO DA BARRA DE PESQUISA */}
            <div className="flex sm:hidden items-center p-0.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === "compact"
                    ? "btn-primary-glow text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Grade (2 por linha)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grade</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("showcase")}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === "showcase"
                    ? "btn-primary-glow text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Vitrine (1 por linha)"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Vitrine</span>
              </button>
            </div>
          </div>

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
          <div
            className={`mt-6 sm:mt-8 ${
              viewMode === "showcase" ? "hidden sm:grid" : "grid"
            } grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6`}
          >
            {displayed.map((prod, idx) => (
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
            {displayed.map((prod, idx) => (
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
