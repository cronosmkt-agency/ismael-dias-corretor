import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Home,
  LayoutGrid,
  Search,
  Info,
  Building2,
  Trees,
  MapPin,
  Sparkles,
  DollarSign,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import { ProductDetailModal, type ProductItem } from "@/components/ProductDetailModal";
import {
  lancamentosProducts,
  lancamentosFilters,
  fmt,
  WHATSAPP,
  WHATSAPP_NUMBER,
  PHONE_DISPLAY,
} from "@/data/storeData";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos & Condomínios — Ismael Dias | Habittat House Teresópolis" },
      {
        name: "description",
        content:
          "Lançamentos residenciais da Angeleti Construtora em Teresópolis: Golden Green, Vale dos Pássaros e Montares. Terrenos em condomínio fechado com entrada de 15% e até 120 parcelas direto com a incorporadora.",
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
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
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
    const text = `Olá, Ismael Dias! Vi este lançamento no seu site e gostaria de informações sobre lotes disponíveis:

🏔️ *Empreendimento:* ${prod.name}
📍 *Localização:* ${prod.screen || "Teresópolis/RJ"}
📐 *Metragem:* ${prod.storage || "Lote Residencial"}
💰 *Valor:* A partir de ${fmt(prod.price)}
✨ *Condição:* ${prod.chip || "15% de entrada + saldo em até 120 parcelas"}

Gostaria de agendar uma visita guiada com você no local!`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
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

      <main className="pt-20 sm:pt-32 pb-36 sm:pb-24 px-3 sm:px-6 max-w-7xl mx-auto">
        {/* Header da Página de Lançamentos */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold glass mb-2 border border-blue-500/20 text-blue-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Condomínios Fechados Angeleti ({filtered.length} empreendimentos)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Novos <span className="text-gradient-blue">Lançamentos</span> na Serra
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Terrenos em condomínio fechado com infraestrutura de alto padrão e financiamento direto em até 120 parcelas
          </p>

          {/* Destaque Condições — 1 Linha Garantida no Mobile com whitespace-nowrap */}
          <div className="mt-3.5 flex justify-center px-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/90 dark:bg-sky-950/60 border border-blue-200/80 dark:border-sky-800/80 text-[11px] sm:text-xs shadow-2xs text-blue-800 dark:text-sky-300 font-bold whitespace-nowrap">
              <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
              <span className="hidden sm:inline">15% Entrada + 120x Direto com a Incorporadora Angeleti</span>
              <span className="sm:hidden">15% Entrada + 120x Direto • Angeleti</span>
              <span className="hidden sm:inline text-slate-400">• Lazer & Segurança 24h</span>
            </div>
          </div>
        </div>

        {/* Barra de Busca Desktop */}
        <div className="hidden sm:flex mt-6 max-w-2xl mx-auto items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por condomínio ou localização (ex: Golden Green, Vale dos Pássaros, Montares)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-16 py-2.5 rounded-2xl glass border border-slate-200 dark:border-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition text-slate-900 dark:text-white shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Controles Mobile: Categorias em Grade 2 Colunas (Sem corte, 100% visível) */}
        <div className="sm:hidden mt-4 flex flex-col gap-2.5">
          {/* Grade 2 Colunas de Categorias */}
          <div className="grid grid-cols-2 gap-1.5">
            {lancamentosFilters.map((fl) => {
              const count =
                fl === "Todos"
                  ? productList.length
                  : productList.filter((p) => p.cat === fl).length;
              const isActive = activeFilter === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setActiveFilter(fl)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isActive
                      ? "btn-primary-glow text-white shadow-md font-black"
                      : "bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-800/70"
                  }`}
                >
                  <span className="truncate">{fl}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1 shrink-0 ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Linha Combinada: Barra de busca + Modo Grade/Vitrine */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar lançamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 rounded-xl glass border border-slate-200 dark:border-slate-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition text-slate-900 dark:text-white shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center p-0.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs shrink-0">
              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "compact"
                    ? "btn-primary-glow text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Grade 2 por linha"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[10px]">Grade</span>
              </button>

              <button
                onClick={() => setViewMode("showcase")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "showcase"
                    ? "btn-primary-glow text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Vitrine 1 por linha"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="text-[10px]">Vitrine</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros Desktop */}
        <div className="hidden sm:flex mt-8 items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {lancamentosFilters.map((fl) => {
              const count =
                fl === "Todos"
                  ? productList.length
                  : productList.filter((p) => p.cat === fl).length;
              const isActive = activeFilter === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setActiveFilter(fl)}
                  className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    isActive
                      ? "btn-primary-glow text-white shadow-lg scale-105"
                      : "section-pill hover:scale-105"
                  }`}
                >
                  <span>{fl}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-black ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-blue-100 text-blue-800 dark:bg-sky-400/25 dark:text-sky-200 border border-blue-200/50 dark:border-sky-400/30"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{filtered.length} empreendimentos disponíveis</span>
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
                className="group relative rounded-2xl sm:rounded-3xl glass p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl border border-slate-200/60 dark:border-slate-800/80 hover:-translate-y-1"
              >
                {/* Badge Superior — Linha Própria com texto completo */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-sky-950/70 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/60">
                    {prod.badge}
                  </span>
                </div>

                {/* Imagem do Terreno com Metragem Sobreposta */}
                <div
                  onClick={() => handleOpenDetail(prod)}
                  className="relative aspect-4/3 w-full flex items-center justify-center p-1 sm:p-2 mb-2 cursor-pointer overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50"
                >
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.storage ? (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-slate-900/85 text-white backdrop-blur-xs shadow-xs border border-white/10">
                      {prod.storage}
                    </span>
                  ) : null}
                </div>

                {/* Dados do Empreendimento */}
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
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-lg font-black text-blue-600 dark:text-sky-400">
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
                    className="w-full py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetail(prod)}
                    className="w-full py-1.5 sm:py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap"
                  >
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Ficha</span>
                  </button>
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
                <div
                  onClick={() => handleOpenDetail(prod)}
                  className="relative w-24 h-24 shrink-0 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 p-1 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50 cursor-pointer overflow-hidden"
                >
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-md"
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
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/40">
                        {prod.badge}
                      </span>
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

                  {/* Linha Inferior: Preço e Ações Sem Sobreposição */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-sm font-black text-blue-600 dark:text-sky-400 block whitespace-nowrap">
                        {fmt(prod.price)}
                      </span>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        {prod.chip || "15% + 120x com a Angeleti"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenDetail(prod)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Ver especificações"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOrderWhatsApp(prod)}
                        className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>WhatsApp</span>
                      </button>
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
