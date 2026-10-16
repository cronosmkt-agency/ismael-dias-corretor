import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  MapPin,
  Trees,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Share2,
  CalendarCheck,
  CheckCircle2,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Sparkles,
  X,
  Building2,
  Check,
  Sun,
  MoonStar,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import type { ProductItem } from "@/components/ProductDetailModal";
import {
  getPropertyBySku,
  getRelatedProperties,
  getPropertyCanonicalUrl,
} from "@/services/propertiesService";
import { trackPageView, trackWhatsAppClick } from "@/services/analyticsService";
import { getSiteSettings, type SiteSettings } from "@/services/settingsService";
import { WHATSAPP_NUMBER, PHONE_DISPLAY, fmt } from "@/data/storeData";
import { toast } from "sonner";

export const Route = createFileRoute("/imovel/$sku")({
  component: PropertyDetailPage,
  head: ({ params }) => {
    const property = getPropertyBySku(params.sku);
    if (!property) {
      return {
        meta: [
          { title: "Imóvel Não Encontrado | Ismael Dias Corretor em Teresópolis" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }

    const title = `${property.name} | Ismael Dias Corretor Teresópolis`;
    const desc = `${property.name}. Imóvel em ${property.bairro || "Teresópolis/RJ"}, valor ${fmt(property.price)}. ${property.storage || ""}. Fotos completas, detalhes e agendamento de visita com Ismael Dias • Habittat House.`;
    const canonical = getPropertyCanonicalUrl(params.sku);
    const cover = property.img || "https://ismael-dias-corretor.vercel.app/favicon.png";

    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      name: property.name,
      description: property.description || desc,
      url: canonical,
      image: property.images && property.images.length > 0 ? property.images : [cover],
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: "BRL",
        availability:
          property.badge === "VENDIDA"
            ? "https://schema.org/Sold"
            : "https://schema.org/InStock",
      },
      contentLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: property.bairro || "Teresópolis",
          addressRegion: "RJ",
          addressCountry: "BR",
        },
      },
      author: {
        "@type": "RealEstateAgent",
        name: "Ismael Dias",
        telephone: "+5521964639999",
        worksFor: {
          "@type": "RealEstateAgent",
          name: "Habittat House Imobiliária",
        },
      },
    };

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: cover },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "pt_BR" },
        { property: "og:site_name", content: "Ismael Dias Corretor • Habittat House" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: cover },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(schemaJson),
        },
      ],
    };
  },
});

function PropertyDetailPage() {
  const { sku } = Route.useParams();
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("white");
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const siteSettings: SiteSettings = useMemo(() => getSiteSettings(), []);
  const property = useMemo(() => getPropertyBySku(sku), [sku]);
  const relatedProperties = useMemo(() => getRelatedProperties(sku, 4), [sku]);

  // Tema inicial do usuário
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
      localStorage.setItem("habittat_theme", "black-piano");
    } else {
      root.classList.add("theme-white");
      localStorage.setItem("habittat_theme", "white");
    }
  };

  // SEO dinâmico no cliente e analytics
  useEffect(() => {
    if (property) {
      document.title = `${property.name} | Ismael Dias Corretor em Teresópolis`;
      trackPageView(
        `/imovel/${sku}`,
        property.name,
        property.sku,
        property.bairro || "Teresópolis"
      );
    }
    setActiveImgIndex(0);
    setIsLightboxOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sku]);

  // Teclado para a galeria e lightbox
  useEffect(() => {
    const imagesCount = property?.images?.length || 1;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : imagesCount - 1));
      } else if (e.key === "ArrowRight") {
        setActiveImgIndex((prev) => (prev < imagesCount - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [property?.images?.length]);

  // Se o imóvel não existir
  if (!property) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
        <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />
        <main className="flex-1 flex items-center justify-center p-6 text-center max-w-lg mx-auto pt-28">
          <div className="p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <Home className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black">Imóvel Não Encontrado</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              O imóvel com código <strong>#{sku}</strong> pode ter sido vendido ou o link está incorreto.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                to="/loja"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              >
                Ver Todos os Imóveis Disponíveis
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl glass border border-slate-300 dark:border-slate-700 font-bold text-xs transition"
              >
                Ir para o Início
              </Link>
            </div>
          </div>
        </main>
        <SiteFooter currentTheme={currentTheme} />
      </div>
    );
  }

  const isSold = property.badge === "VENDIDA" || property.condition?.includes("VENDIDA");
  const isReserved = property.badge === "RESERVADO";
  const images = property.images && property.images.length > 0 ? property.images : [property.img];
  const currentImg = images[activeImgIndex] || property.img;
  const canonicalUrl = getPropertyCanonicalUrl(property.sku || sku);

  const handleWhatsApp = () => {
    trackWhatsAppClick(
      property.sku || sku,
      property.name,
      property.bairro || "Teresópolis",
      property.price
    );

    let text = "";
    if (isSold) {
      text = `Olá, Ismael Dias! Vi no seu site que o imóvel *${property.name}* (Cód. #${property.sku || ""}) foi vendido.

Gostaria de saber se você tem outras opções semelhantes disponíveis na mesma região (${property.bairro || "Teresópolis"})!`;
    } else {
      text = `Olá, Ismael Dias! Vi este imóvel no seu site e tenho interesse:

🏡 *Imóvel:* ${property.name}
🔢 *Código:* #${property.sku || "Habittat"}
📍 *Localização:* ${property.bairro || "Teresópolis/RJ"}
📐 *Metragem / Área:* ${property.storage || "Área Privativa"}
💰 *Valor:* ${fmt(property.price)}
✨ *Status:* ${property.badge || "Disponível"}

Gostaria de agendar uma visita guiada com você e tirar algumas dúvidas! Link: ${canonicalUrl}`;
    }

    const targetNumber = siteSettings.whatsappNumber || WHATSAPP_NUMBER;
    const url = `https://wa.me/${targetNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.name,
          text: `Confira este imóvel em Teresópolis com Ismael Dias: ${property.name} - ${fmt(property.price)}`,
          url: canonicalUrl,
        });
        return;
      } catch (_) {}
    }

    // Fallback: Copiar para área de transferência
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopiedLink(true);
      toast.success("Link do imóvel copiado com sucesso!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (_) {
      toast.info(`Link do imóvel: ${canonicalUrl}`);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/loja";
    }
  };

  const featuresList = property.features && property.features.length > 0
    ? property.features
    : [
        "Documentação 100% verificada",
        "Infraestrutura de água, luz e saneamento",
        "Localização privilegiada na serra fluminense",
        "Assessoria exclusiva com Ismael Dias",
      ];

  return (
    <div className="relative min-h-screen overflow-x-hidden lg:overflow-x-visible bg-background text-foreground flex flex-col justify-between">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

      {/* Top Header Mobile: Compacto, limpo e profissional */}
      <header className="sm:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 flex items-center justify-between shadow-xs">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar para a listagem anterior"
          className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          <span>Voltar</span>
        </button>

        <div className="flex flex-col items-center min-w-0 px-2 text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-sky-400">
            #{property.sku || sku}
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[170px]">
            {property.bairro || "Teresópolis"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar imóvel"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition cursor-pointer"
          >
            {currentTheme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <MoonStar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>
      </header>

      {/* Navbar Desktop */}
      <div className="hidden sm:block">
        <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />
      </div>

      <main className="pt-20 sm:pt-28 lg:pt-32 pb-32 sm:pb-24 px-3 sm:px-6 max-w-7xl mx-auto w-full min-w-0 max-w-full overflow-x-hidden lg:overflow-x-visible">
        {/* Barra Superior Desktop: Botão Voltar + Breadcrumb */}
        <div className="hidden sm:flex items-center justify-between gap-4 mb-5">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 border border-slate-200/80 dark:border-slate-700/80 group"
            title="Voltar para a listagem mantendo seus filtros e posição"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar</span>
          </button>

          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap py-1"
          >
            <Link to="/" className="hover:text-blue-600 dark:hover:text-sky-400 transition">
              Início
            </Link>
            <span>/</span>
            <button
              type="button"
              onClick={handleBack}
              className="hover:text-blue-600 dark:hover:text-sky-400 transition cursor-pointer"
            >
              Imóveis
            </button>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
              {property.bairro || "Teresópolis"}
            </span>
            <span>/</span>
            <span className="text-blue-600 dark:text-sky-400 font-bold">
              #{property.sku || sku}
            </span>
          </nav>
        </div>

        {/* Header Desktop do Imóvel: Badges + Título Grande */}
        <div className="hidden sm:block mb-6 space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {(isSold || isReserved) && (
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border shadow-2xs whitespace-nowrap shrink-0 ${
                  isSold
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                }`}
              >
                {isSold ? "🔴 Vendida" : "🟡 Reservado"}
              </span>
            )}

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20 flex items-center gap-1 whitespace-nowrap shrink-0">
              <Trees className="w-3.5 h-3.5 shrink-0" />
              <span>{property.cat}</span>
            </span>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 whitespace-nowrap shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{property.screen || `${property.bairro || "Teresópolis"}, Teresópolis/RJ`}</span>
            </span>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0">
              Cód. #{property.sku || sku}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {property.name}
          </h1>
        </div>

        {/* Grid Principal: Galeria & Detalhes (2 colunas no desktop) */}
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-8 items-start w-full min-w-0 max-w-full">
          {/* Coluna Esquerda: Galeria de Fotos + Especificações + Descrição (8 colunas) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-hidden">
            {/* Foto Principal com Galeria e Miniaturas — Padrão Card de Imóvel */}
            <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-4 glass border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm flex flex-col gap-2 sm:gap-3 w-full min-w-0 max-w-full overflow-hidden">
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full h-52 sm:h-80 lg:h-[480px] rounded-xl sm:rounded-2xl overflow-hidden cursor-zoom-in group bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 min-w-0 shadow-inner"
              >
                <img
                  src={currentImg}
                  alt={property.name}
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-102"
                />

                {/* Gradiente sutil inferior para legibilidade perfeita dos selos */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Badges Flutuantes sobre a Foto Principal */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap">
                  {(isSold || isReserved) && (
                    <span
                      className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md shadow-md ${
                        isSold
                          ? "bg-rose-600/90 text-white"
                          : "bg-amber-500/90 text-white"
                      }`}
                    >
                      {isSold ? "🔴 Vendida" : "🟡 Reservado"}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-md bg-black/65 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                    <Trees className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{property.cat}</span>
                  </span>
                </div>

                {/* Botão Ver em Tela Cheia */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] sm:text-xs font-bold backdrop-blur-xs transition shadow-md cursor-pointer"
                >
                  <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Tela cheia</span>
                </button>

                {/* Metragem Sobreposta (Padrão Card de Imóvel) */}
                {property.storage && (
                  <span className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900/85 text-white backdrop-blur-xs shadow-xs border border-white/10">
                    {property.storage}
                  </span>
                )}

                {/* Contador de Fotos */}
                <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                  {activeImgIndex + 1} / {images.length}
                </div>

                {/* Setas de navegação direta */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer shadow-md"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer shadow-md"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Tira de Miniaturas (Thumbnails) no mesmo padrão do Modal de Detalhes - Isolado contra estouro de largura */}
              {images.length > 1 && (
                <div className="w-full min-w-0 max-w-full overflow-hidden">
                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none w-full min-w-0 max-w-full">
                    {images.map((imgUrl, idx) => (
                      <button
                        key={imgUrl + idx}
                        type="button"
                        onClick={() => setActiveImgIndex(idx)}
                        className={`relative w-11 h-11 sm:w-16 sm:h-16 shrink-0 rounded-lg sm:rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                          activeImgIndex === idx
                            ? "border-blue-600 dark:border-sky-400 scale-105 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Miniatura ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card Mobile de Título & Preço & Ações Rápidas (Logo abaixo da foto no celular) */}
            <div className="sm:hidden p-3 rounded-2xl glass border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-sm space-y-2.5 w-full min-w-0 max-w-full overflow-hidden">
              {/* Badges de Localização e Código */}
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20 flex items-center gap-1 min-w-0 shrink">
                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                  <span className="truncate">{property.screen || `${property.bairro || "Teresópolis"}, Teresópolis/RJ`}</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                  Cód. #{property.sku || sku}
                </span>
              </div>

              {/* Título Principal */}
              <h1 className="text-sm font-black text-slate-900 dark:text-white leading-snug break-words">
                {property.name}
              </h1>

              {/* Valor de Venda */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between gap-1.5 min-w-0">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block">
                    Valor de Venda
                  </span>
                  <div className="text-xl font-black text-blue-600 dark:text-sky-400 truncate">
                    {fmt(property.price)}
                  </div>
                </div>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  ✓ Entrada facilitada
                </span>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="grid grid-cols-2 gap-2 pt-0.5 w-full min-w-0">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-2 px-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition cursor-pointer min-w-0 overflow-hidden"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="py-2 px-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md active:scale-95 transition cursor-pointer min-w-0 overflow-hidden"
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" />
                  <span className="truncate">Agendar Visita</span>
                </button>
              </div>
            </div>

            {/* Destaques / Especificações Principais */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl glass border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4 w-full min-w-0 max-w-full overflow-hidden">
              <h2 className="text-xs sm:text-sm font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Características Principais</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full min-w-0">
                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                    Área / Metragem
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate block">
                    {property.storage || "Sob consulta"}
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                    Bairro Oficial
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate block">
                    {property.bairro || "Teresópolis"}
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                    Categoria
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate block">
                    {property.cat || "Residencial"}
                  </span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                    Código do Imóvel
                  </span>
                  <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-sky-400 truncate block">
                    #{property.sku || sku}
                  </span>
                </div>
              </div>

              {/* Tags de Comodidades e Diferenciais */}
              <div className="pt-2 w-full min-w-0">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  Diferenciais e Infraestrutura:
                </span>
                <div className="flex flex-wrap gap-1.5 w-full min-w-0">
                  {featuresList.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-semibold bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-sky-300 border border-blue-200/60 dark:border-blue-900/50 flex items-center gap-1.5 max-w-full"
                    >
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="break-words">{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Descrição Completa do Imóvel */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl glass border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4 w-full min-w-0 max-w-full overflow-hidden">
              <h2 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                <span>Sobre este Imóvel</span>
              </h2>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line break-words w-full min-w-0">
                {property.description ? (
                  property.description
                ) : (
                  <p>
                    Excelente oportunidade em {property.bairro || "Teresópolis/RJ"}. Imóvel selecionado com alto padrão de acabamento, documentação garantida e assessoria jurídica completa com o corretor Ismael Dias na Habittat House.
                  </p>
                )}
              </div>
            </div>

            {/* Card do Corretor Ismael Dias para Mobile */}
            <div className="lg:hidden p-3.5 rounded-2xl glass border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3 w-full min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
                  ID
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    {siteSettings.realtorName || "Ismael Dias"}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {siteSettings.agencyName || "Habittat House Imobiliária"}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 block truncate">
                    {siteSettings.creci || "CRECI-RJ Ativo"}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed break-words">
                Corretor especialista na região serrana de Teresópolis. Atendimento consultivo e assessoria jurídica completa.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{siteSettings.phoneDisplay || PHONE_DISPLAY}</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Box de Preço + Botões de Ação + Card do Corretor (Desktop: 4 colunas sticky) */}
          <div className="hidden lg:block lg:col-span-4 space-y-5 lg:sticky lg:top-28 self-start">
            {/* Card de Valor & Condições */}
            <div className="p-6 rounded-3xl glass border border-blue-500/25 dark:border-sky-500/30 shadow-xl space-y-4 bg-white/95 dark:bg-slate-900/90 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="text-[11px] uppercase font-black text-slate-400 tracking-wider block">
                  Valor de Venda
                </span>
                <div className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                  {fmt(property.price)}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Condições facilitadas de negociação</span>
                </div>
              </div>

              {/* Botão de Contato Principal no WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <WhatsAppIcon className="w-5 h-5 text-white shrink-0" />
                <span>Falar no WhatsApp com Ismael</span>
              </button>

              {/* Botão Secundário: Agendar Visita */}
              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                <span>Agendar Visita no Imóvel</span>
              </button>

              {/* Botão Compartilhar Imóvel */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 px-4 rounded-2xl glass hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>Compartilhar Este Imóvel</span>
                  </>
                )}
              </button>

              {/* Selo de Confiança */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Documentação e Certidões 100% Verificadas</span>
              </div>
            </div>

            {/* Card do Corretor Ismael Dias Desktop */}
            <div className="p-5 rounded-3xl glass border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3 bg-white/95 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-md shrink-0">
                  ID
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {siteSettings.realtorName || "Ismael Dias"}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                    {siteSettings.agencyName || "Habittat House Imobiliária"}
                  </span>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-sky-400 block truncate">
                    {siteSettings.creci || "CRECI-RJ Ativo"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Corretor especialista na região serrana de Teresópolis. Atendimento consultivo, transparente e com total segurança jurídica para você e sua família.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{siteSettings.phoneDisplay || PHONE_DISPLAY}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Imóveis Relacionados */}
        {relatedProperties.length > 0 && (
          <section className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-200/70 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Outros Imóveis em {property.bairro || "Teresópolis"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Opções selecionadas na mesma região para você comparar
                </p>
              </div>

              <Link
                to="/loja"
                className="text-xs font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                <span>Ver todos os {property.cat || "imóveis"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProperties.map((rel) => (
                <Link
                  key={String(rel.sku)}
                  to="/imovel/$sku"
                  params={{ sku: String(rel.sku) }}
                  className="group rounded-2xl glass border border-slate-200/70 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                    <img
                      src={rel.img}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                      #{rel.sku}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{rel.screen || `${rel.bairro || "Teresópolis"}, Teresópolis/RJ`}</span>
                      </span>
                      <h4 className="font-bold text-xs card-property-title text-slate-900 dark:text-white mt-1 group-hover:text-blue-500 transition-colors">
                        {rel.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {fmt(rel.price)}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-sky-400">
                        Ver Detalhes →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox / Zoom em Tela Cheia */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Fechar tela cheia"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
                aria-label="Próxima foto"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImg}
              alt={property.name}
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-3 text-center text-xs font-bold text-white/80">
              {property.name} • Foto {activeImgIndex + 1} de {images.length}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <SiteFooter currentTheme={currentTheme} />

      {/* Barra Fixa de Conversão Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 p-2.5 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Valor do Imóvel
          </span>
          <span className="text-base font-black text-slate-900 dark:text-white truncate block">
            {fmt(property.price)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Compartilhar"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Falar com Ismael</span>
          </button>
        </div>
      </div>
    </div>
  );
}
