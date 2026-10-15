import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Home,
  LayoutGrid,
  Search,
  Info,
  Building2,
  MapPin,
  Sparkles,
  Mountain,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import type { ProductItem } from "@/components/ProductDetailModal";
import {
  lancamentosProducts,
  lancamentosFilters,
  fmt,
  WHATSAPP,
  WHATSAPP_NUMBER,
} from "@/data/storeData";
import { trackPageView, trackWhatsAppClick } from "@/services/analyticsService";
import { getSiteSettings } from "@/services/settingsService";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"compact" | "showcase">("compact");

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());

  // Salva filtros de lançamentos no sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lancamentos_active_filter", activeFilter);
    }
  }, [activeFilter]);

  // Monitora e salva scroll de lançamentos
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("lancamentos_scroll_y", String(window.scrollY));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  // Filter & Search
  const filtered = productList.filter((item) => {
    const matchCat =
      activeFilter === "Todos" ||
      item.cat === activeFilter;
    const matchSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.storage && item.storage.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.screen && item.screen.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="pt-24 sm:pt-28 pb-36 sm:pb-24 px-3 sm:px-6 max-w-7xl mx-auto">
        {/* H1 Semântico Oculto para SEO e Acessibilidade */}
        <h1 className="sr-only">
          Novos Lançamentos de Terrenos e Lotes na Serra - Ismael Dias Corretor
        </h1>

        {/* Container Mestre Unificado: Categorias Compactas Quadradas + Busca (Economia Máxima de Espaço de Tela) */}
        <div className="mt-2 sm:mt-4 max-w-xl sm:max-w-2xl mx-auto glass rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2 relative z-30">
          {/* 1. Seletor de Categorias Compactas Quadradas (Icon + Nome + Contador) */}
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 max-w-[280px] sm:max-w-[340px] mx-auto w-full">
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
                  onClick={() => setActiveFilter(fl)}
                  className={`group relative flex flex-col items-center justify-between w-full h-[52px] sm:h-[62px] p-1 sm:p-1.5 rounded-xl border transition-colors duration-150 cursor-pointer text-center select-none shadow-2xs ${
                    isActive
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-sky-600 border-blue-500 dark:border-sky-400 text-white shadow-xs"
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

          {/* Separador fino */}
          <div className="h-px bg-slate-200/60 dark:bg-slate-800/60 w-full" />

          {/* 2. Barra de Busca + Alternador Grade/Vitrine no mobile */}
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
        </div>

        {/* Grade de Lançamentos */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-16 glass rounded-3xl border border-slate-200 dark:border-slate-800">
            <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold">Nenhum lançamento encontrado para essa busca</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tente buscar por outro termo ou limpe o filtro de busca.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("Todos");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
            >
              Ver todos os lançamentos
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
                      className="text-xs sm:text-sm font-black line-clamp-2 min-h-[2.2rem] text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-sky-400 transition block"
                      title={prod.name}
                    >
                      {prod.name}
                    </Link>

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

        {/* Modo Vitrine Mobile (1 por linha) — Sem sobreposicao de botoes e precos */}
        {viewMode === "showcase" && (
          <div className="sm:hidden mt-4 space-y-3">
            {filtered.map((prod, idx) => (
              <div
                key={prod.name + idx + "-showcase"}
                className="rounded-2xl glass p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3 transition-all hover:shadow-md"
              >
                {/* Imagem do Terreno à esquerda */}
                <Link
                  to="/imovel/$sku"
                  params={{ sku: String(prod.sku) }}
                  className="relative w-24 h-24 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50 cursor-pointer overflow-hidden block"
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
                </Link>

                {/* Informações e Botões à direita */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/40">
                        {prod.badge}
                      </span>
                      {prod.sku && (
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0">#{prod.sku}</span>
                      )}
                    </div>

                    <Link
                      to="/imovel/$sku"
                      params={{ sku: String(prod.sku) }}
                      className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 hover:text-blue-600 dark:hover:text-sky-400 transition block"
                      title={prod.name}
                    >
                      {prod.name}
                    </Link>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{prod.screen || "Teresópolis/RJ"}</span>
                    </p>
                  </div>

                  {/* Linha Inferior: Preço e Ações Sem Sobreposição */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-1 min-w-0">
                      <span className="text-[13px] font-black text-blue-600 dark:text-sky-400 truncate">
                        {fmt(prod.price)}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate text-right">
                        {prod.chip || "15% + 120x com a Angeleti"}
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
                      <Link
                        to="/imovel/$sku"
                        params={{ sku: String(prod.sku) }}
                        className="py-1 px-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap min-w-0"
                      >
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Ficha</span>
                      </Link>
                    </div>
                  </div>
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
