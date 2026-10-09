import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Smartphone,
  LayoutGrid,
  Search,
  MessageCircle,
  Info,
  Check,
  Zap,
  ShieldCheck,
  Truck,
  Building2,
  Filter,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import { ProductDetailModal, type ProductItem } from "@/components/ProductDetailModal";
import { fetchGoogleSheetInventory } from "@/services/googleSheets";
import {
  defaultProducts,
  filters,
  fmt,
  WHATSAPP,
} from "@/data/storeData";
import { toast } from "sonner";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — iPhones Disponíveis a Pronta Entrega | Terephones" },
      {
        name: "description",
        content:
          "Veja todos os iPhones novos e seminovos disponíveis hoje em Teresópolis - RJ. Entrega Express em até 1h ou retirada na SejaDelta.",
      },
      { property: "og:title", content: "Loja de iPhones em Teresópolis — Terephones" },
      {
        property: "og:description",
        content:
          "Catálogo completo de iPhones pronta entrega com fotos reais, bateria testada e garantia. Pague só na entrega.",
      },
    ],
  }),
  component: LojaPage,
});

function LojaPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("white");
  const [productList, setProductList] = useState<ProductItem[]>(defaultProducts);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"compact" | "showcase">("compact");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terephones_theme") as ThemeMode | null;
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

      // Sync Google Sheets
      setLoading(true);
      fetchGoogleSheetInventory()
        .then((items) => {
          if (items && items.length > 0) {
            setProductList(items);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
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
    localStorage.setItem("terephones_theme", next);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: next } }));
    toast.success(next === "black-piano" ? "Modo Black ativado" : "Modo Branco ativado", {
      id: "theme-toggle",
      duration: 1200,
    });
  };

  const handleOpenDetail = (prod: ProductItem) => {
    setSelectedProduct(prod);
    setModalOpen(true);
  };

  const handleOrderWhatsApp = (prod: ProductItem) => {
    const isNovo = prod.cat === "Novos" || prod.badge.toLowerCase().includes("lacrado");
    const storageDisplay =
      prod.storage || prod.name.match(/\d+(gb|tb)/i)?.[0]?.toUpperCase() || "128GB";
    const condText = isNovo
      ? "Novo Lacrado de Fábrica"
      : `Seminovo Grade A+${prod.battery ? ` (Saúde da Bateria: ${prod.battery})` : ""}`;

    const text = `Olá, equipe Terephones! Gostaria de pedir este iPhone que vi na Loja:

📱 *Aparelho:* ${prod.name}
💰 *Valor à vista:* ${fmt(prod.price)} (ou até 18x no cartão)
💾 *Capacidade:* ${storageDisplay}
✨ *Condição:* ${condText}

Gostaria de confirmar a disponibilidade para entrega hoje em Teresópolis!`;

    window.open(`https://wa.me/5521964639999?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Filter & Search
  const filtered = productList
    .filter((item) => {
      const matchCat =
        activeFilter === "Todos" ||
        item.cat === activeFilter ||
        (activeFilter === "Lacrados" && (item.cat === "Novos" || item.cat === "Lacrados")) ||
        (activeFilter === "Novos" && (item.cat === "Novos" || item.cat === "Lacrados")) ||
        (activeFilter === "Seminovos" && item.cat === "Seminovos");
      const matchSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.specs && item.specs.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.storage && item.storage.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (activeFilter === "Todos") {
        const is17A = a.name.toLowerCase().includes("iphone 17");
        const is17B = b.name.toLowerCase().includes("iphone 17");
        if (is17A && !is17B) return -1;
        if (!is17A && is17B) return 1;
      }
      return 0;
    });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="pt-20 sm:pt-32 pb-24 sm:pb-16 px-3 sm:px-6 max-w-7xl mx-auto">
        {/* Header da Loja */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold glass mb-2 border border-blue-500/20 text-blue-600 dark:text-sky-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Estoque Hoje ({filtered.length} disponíveis)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Catálogo Completo de <span className="text-gradient-blue">iPhones</span>
          </h1>
        </div>

        {/* Barra de Busca Desktop */}
        <div className="hidden sm:flex mt-6 max-w-2xl mx-auto items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar modelo (ex: 16 Pro, 15, 256GB)..."
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

        {/* Controles Mobile: Filtros de Categoria + Barra de Busca à esquerda dos botões Grade/Vitrine */}
        <div className="sm:hidden mt-3.5 flex flex-col gap-2">
          {/* Categorias Pills */}
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-inner backdrop-blur-md">
            {filters.map((fl) => {
              const count =
                fl === "Todos"
                  ? productList.length
                  : fl === "Lacrados"
                  ? productList.filter((p) => p.cat === "Novos" || p.cat === "Lacrados").length
                  : productList.filter((p) => p.cat === fl).length;
              const isActive = activeFilter === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setActiveFilter(fl)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-1 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "btn-primary-glow text-white shadow-md font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                  }`}
                >
                  <span className="whitespace-nowrap">{fl}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-slate-200/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Linha Combinada: Barra de busca à esquerda + Grade/Vitrine à direita */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar modelo..."
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
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px]">Vitrine</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros Desktop */}
        <div className="hidden sm:flex mt-8 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {filters.map((fl) => {
              const count =
                fl === "Todos"
                  ? productList.length
                  : fl === "Lacrados"
                  ? productList.filter((p) => p.cat === "Novos" || p.cat === "Lacrados").length
                  : productList.filter((p) => p.cat === fl).length;
              const isActive = activeFilter === fl;
              return (
                <button
                  key={fl}
                  onClick={() => setActiveFilter(fl)}
                  className={`px-5 py-2.5 text-sm font-extrabold rounded-full transition-all flex items-center gap-2 cursor-pointer ${
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
            <span>{filtered.length} aparelhos prontos para entrega imediata</span>
          </div>
        </div>

        {/* Grade de Produtos */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center py-16 glass rounded-3xl border border-slate-200 dark:border-slate-800">
            <Smartphone className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold">Nenhum iPhone encontrado para essa busca</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tente buscar por outro modelo ou limpe o filtro de busca.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("Todos");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
            >
              Ver todos os modelos
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
                {/* Badge Superior */}
                <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
                  <span className="text-[10px] sm:text-xs font-extrabold px-2 sm:px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/40">
                    {prod.badge}
                  </span>
                  {prod.quantity && prod.quantity > 1 ? (
                    <span className="text-[10px] font-black text-blue-600 dark:text-sky-400 shrink-0">
                      {prod.quantity} un.
                    </span>
                  ) : prod.storage ? (
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {prod.storage}
                    </span>
                  ) : null}
                </div>

                {/* Imagem do Aparelho */}
                <div className="relative aspect-4/5 w-full flex items-center justify-center p-1 sm:p-4 mb-2 sm:mb-3">
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Dados do Aparelho */}
                <div>
                  <h3 className="text-xs sm:text-sm font-black line-clamp-1 text-slate-900 dark:text-white" title={prod.name}>
                    {prod.name}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {prod.specs || "Garantia Terephones • Testado"}
                  </p>

                  <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm sm:text-lg font-black text-blue-600 dark:text-sky-400">
                        {fmt(prod.price)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                        no PIX
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      ou 12x de {fmt(Math.round((prod.price * 1.15) / 12))}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 pt-1.5 sm:pt-2">
                  <button
                    onClick={() => handleOrderWhatsApp(prod)}
                    className="w-full py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                    <span>Pedir</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetail(prod)}
                    className="w-full py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Info</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modo Vitrine Mobile (1 card horizontal compacto por linha) */}
        {viewMode === "showcase" && (
          <div className="sm:hidden mt-4 space-y-2.5">
            {filtered.map((prod, idx) => (
              <div
                key={prod.name + idx + "-showcase"}
                className="rounded-2xl glass p-2.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-3 transition-all hover:shadow-md"
              >
                {/* Imagem do Aparelho à esquerda */}
                <div className="relative w-24 h-24 shrink-0 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 p-1.5 flex items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
                  <img
                    src={prod.img}
                    alt={prod.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                  />
                </div>

                {/* Informações e Botões à direita */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-sky-800/40 truncate">
                        {prod.badge}
                      </span>
                      {prod.quantity && prod.quantity > 1 ? (
                        <span className="text-[10px] font-black text-blue-600 dark:text-sky-400 shrink-0">
                          {prod.quantity} un.
                        </span>
                      ) : prod.storage ? (
                        <span className="text-[10px] font-black text-slate-400 shrink-0">
                          {prod.storage}
                        </span>
                      ) : null}
                    </div>

                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate" title={prod.name}>
                      {prod.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {prod.specs || "Garantia Terephones • Testado"}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-blue-600 dark:text-sky-400">
                          {fmt(prod.price)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          PIX
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        ou 12x de {fmt(Math.round((prod.price * 1.15) / 12))}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenDetail(prod)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Ver especificações"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOrderWhatsApp(prod)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner de Atendimento WhatsApp & Dúvidas */}
        <div className="mt-16 rounded-3xl p-6 sm:p-10 glass border border-emerald-500/30 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Atendimento Direto & Imediato</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Em dúvida sobre qual iPhone escolher?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2">
              Chame nossa equipe no WhatsApp para tirar dúvidas ou use o botão flutuante de chat no canto da tela. Entregamos em até 1h em Teresópolis!
            </p>
          </div>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition"
          >
            <WhatsAppIcon className="w-5 h-5 text-white" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </main>

      {/* Modal de Especificações */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        whatsappNumber="5521964639999"
      />

      <SiteFooter currentTheme={currentTheme} />
      <WhatsFloat />
      <MobileBottomNav />
    </div>
  );
}
