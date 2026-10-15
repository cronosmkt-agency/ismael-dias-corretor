import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Building2,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Sparkles,
  Info,
  ChevronDown,
  Trees,
  Compass,
  Home,
  CheckCircle2,
  DollarSign,
  CalendarCheck,
  KeyRound,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import { ProductDetailModal, type ProductItem } from "@/components/ProductDetailModal";
import {
  defaultProducts,
  fmt,
  WHATSAPP,
  WHATSAPP_NUMBER,
  PHONE_DISPLAY,
  ADDRESS_DISPLAY,
  reviews,
} from "@/data/storeData";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { toast } from "sonner";
import { trackPageView, seedInitialAnalyticsIfEmpty } from "@/services/analyticsService";
import { getAllProperties } from "@/services/propertiesService";

const heroHouse = "/imoveis/mansao-neoclassica.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ismael Dias — Corretor de Imóveis | Habittat House Teresópolis" },
      {
        name: "description",
        content:
          "Encontre lotes e casas em condomínio fechado em Teresópolis com o corretor Ismael Dias na Habittat House. Especialista nos condomínios Golden Green e Vale dos Pássaros da Angeleti Construtora. Entrada de 15% e saldo em até 120x direto com a incorporadora.",
      },
      { property: "og:title", content: "Ismael Dias — Corretor de Imóveis | Habittat House" },
      {
        property: "og:description",
        content:
          "Consultoria imobiliária especializada em Teresópolis com Ismael Dias. Condomínios fechados da Angeleti Construtora com lazer completo e segurança 24h.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),

  component: BrandStore,
});

/* ---------- Visual Background Elements ---------- */
function BackgroundOrbs() {
  return (
    <div className="brand-bg" aria-hidden="true">
      <div className="brand-orb brand-orb-1" />
      <div className="brand-orb brand-orb-2" />
      <div className="brand-orb brand-orb-3" />
    </div>
  );
}

/* ---------- 3D Floating Tilt House Image (Desktop Only) ---------- */
function TiltHouse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(2,132,199,0.22), transparent 65%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <img
        src={heroHouse}
        alt="Empreendimentos em destaque com Ismael Dias"
        fetchPriority="high"
        decoding="async"
        width={540}
        height={400}
        className="relative z-10 w-[320px] lg:w-[500px] h-auto rounded-3xl object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
        style={{
          filter: "drop-shadow(0 25px 40px rgba(15,23,42,0.35))",
          userSelect: "none",
        }}
        draggable={false}
      />
    </div>
  );
}

/* ---------- Reusable Section Title ---------- */
function SectionTitle({
  eyebrow,
  title,
  subtitle,
  badge,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800/80 mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>
      )}
      {eyebrow && (
        <div className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-extrabold text-blue-600 dark:text-sky-400 mb-2">
          {eyebrow}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   1. HERO SECTION (Ismael Dias Corretor Habittat House)
   ========================================================================= */
function Hero() {
  return (
    <section
      id="inicio"
      className="hero-section-fold relative pt-20 pb-4 sm:pt-24 sm:pb-8 lg:py-0 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20 my-auto">
        {/* Left Column */}
        <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center">
          {/* Eyebrow Pill — Compacto e Auto-Ajustável (w-fit) */}
          <div className="inline-flex w-fit self-center lg:self-start items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-blue-50/90 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800/80 shadow-xs mb-3 sm:mb-4 whitespace-nowrap">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Parceria Oficial Angeleti Construtora (+20 anos) • Teresópolis/RJ</span>
            <span className="sm:hidden">Angeleti Construtora (+20 anos) • Teresópolis</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white">
            Seu lote ou casa em{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-teal-300">
              condomínio fechado
            </span>
            <br />
            em Teresópolis.
          </h1>

          {/* Value Prop Subtitle */}
          <p className="mt-3 sm:mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Encontre o terreno ou residência ideal para você e sua família nos condomínios{" "}
            <strong className="text-slate-900 dark:text-white font-bold">Golden Green</strong> e{" "}
            <strong className="text-slate-900 dark:text-white font-bold">Vale dos Pássaros</strong>.
            Entrada a partir de 15% e{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              saldo em até 120 parcelas direto com a incorporadora Angeleti!
            </strong> 🏔️🌲
          </p>

          {/* Action CTAs — Clean (Apenas 2 botões elegantes) */}
          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center lg:justify-start">
            <Link
              to="/lancamentos"
              className="btn-primary-glow inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-full font-bold text-sm text-white shadow-lg active:scale-95 transition"
            >
              <Trees className="w-4 h-4" />
              <span>Ver Lançamentos</span>
            </Link>

            <Link
              to="/loja"
              className="inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-full font-bold text-sm border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm active:scale-95 transition"
            >
              <Home className="w-4 h-4" />
              <span>Imóveis Avulsos</span>
            </Link>
          </div>

          {/* Micro Trust Indicators — Habittat House e Angeleti lado a lado, 15% + 120x centralizado abaixo no mobile */}
          <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            {/* Linha 1 no mobile: Habittat House e Angeleti um ao lado do outro */}
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap text-[11px] sm:text-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Habittat House Imobiliária</span>
              </div>
              <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 whitespace-nowrap text-[11px] sm:text-xs">
                <Trees className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Angeleti (+20 anos)</span>
              </div>
            </div>

            {/* Linha 2 no mobile: 15% + 120x Direto centralizado abaixo */}
            <div className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-black shadow-2xs whitespace-nowrap text-[11px] sm:text-xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>15% + 120x Direto</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Tilt House Image on Desktop */}
        <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
          <TiltHouse />
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   2. FEATURED PROPERTIES (Curated Highlights)
   ========================================================================= */
function FeaturedProducts({
  products,
  onSelectProduct,
}: {
  products: ProductItem[];
  onSelectProduct: (p: ProductItem) => void;
}) {
  const featured = products && products.length > 0 ? products : defaultProducts;

  const handleBuyWhatsApp = (prod: ProductItem) => {
    const text = `Olá, Ismael Dias! Vi este imóvel em destaque no seu site e gostaria de mais informações:

🏡 *Empreendimento:* ${prod.name}
📍 *Localização:* ${prod.screen || "Teresópolis/RJ"}
📐 *Metragem:* ${prod.storage || "Lote Residencial"}
💰 *Valor:* A partir de ${fmt(prod.price)}
✨ *Condição:* ${prod.chip || "15% entrada + parcelas"}

Gostaria de agendar uma visita guiada com você para conhecer o local!`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="destaques" className="py-8 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          badge="Oportunidades em Teresópolis"
          eyebrow="Carteira de Imóveis & Lotes"
          title="Condomínios & Imóveis Selecionados"
          subtitle="Lotes amplos com topografia privilegiada, estrutura completa de lazer e assessoria exclusiva do corretor Ismael Dias."
        />

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-5">
          {featured.map((item) => (
            <div
              key={item.name}
              className="glass-card flex flex-col justify-between p-4 sm:p-5 rounded-2xl group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative border border-slate-200/70 dark:border-slate-800/70"
            >
              {/* Top Tags */}
              <div className="flex items-center justify-between gap-1 mb-2 min-w-0">
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-sky-800/60 shrink-0 whitespace-nowrap">
                  {item.cat}
                </span>
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 whitespace-nowrap ${
                    item.badge === "VENDIDA"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-black"
                      : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              {/* Photo */}
              <div
                className="relative py-3 sm:py-4 flex items-center justify-center cursor-pointer overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/50"
                onClick={() => onSelectProduct(item)}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-44 sm:h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105 select-none"
                />
                {item.storage ? (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900/85 text-white backdrop-blur-xs shadow-xs border border-white/10">
                    {item.storage}
                  </span>
                ) : null}
              </div>

              {/* Info */}
              <div className="mt-3 text-left">
                <h3
                  onClick={() => onSelectProduct(item)}
                  className="font-black text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-sky-400 transition"
                  title={item.name}
                >
                  {item.name}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{item.screen || "Teresópolis/RJ"}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium line-clamp-1">
                  {item.specs}
                </div>

                {/* Price */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">A partir de</div>
                    <div className="text-base sm:text-xl font-black text-blue-600 dark:text-sky-400 leading-tight">
                      {fmt(item.price)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.chip ? "15% + 120x" : "Facilitado"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleBuyWhatsApp(item)}
                  className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Consultar no WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProduct(item)}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Ver Ficha & Diferenciais</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Transition Banner */}
        <div className="mt-8 glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border border-blue-500/20 text-center sm:text-left">
          <div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Quer conhecer a tabela completa de lotes disponíveis?
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Receba o mapa dos condomínios com metragens, topografia e valores atualizados.
            </div>
          </div>
          <Link
            to="/loja"
            className="btn-primary-glow shrink-0 py-2 sm:py-2.5 px-5 rounded-full text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2 shadow-md active:scale-95 transition"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   3. PERFIL DO CORRETOR — ISMAEL DIAS (HABITTAT HOUSE)
   ========================================================================= */
function BrokerProfileSection() {
  return (
    <section id="sobre-corretor" className="py-10 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card rounded-3xl p-6 sm:p-12 border border-blue-500/25 relative overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left presentation */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-50/90 dark:bg-sky-950/70 text-blue-600 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800/80 mb-4 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Corretor Credenciado • Habittat House Imobiliária</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                Olá, sou <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-teal-300">Ismael Dias</span>.
                <br />
                Seu corretor de confiança na serra.
              </h2>

              <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Atuo como corretor imobiliário credenciado na <strong>Habittat House</strong>, focado em trazer transparência, segurança jurídica e as melhores oportunidades em condomínios fechados na serra de Teresópolis. Especialista nos condomínios da <strong>Angeleti Construtora</strong> e nos melhores imóveis de alto padrão da região.
              </p>

              <div className="grid sm:grid-cols-2 gap-3.5 mt-6">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Visita Técnica Guiada</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Análise presencial da melhor topografia, insolação e potencial arquitetônico de cada lote.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Parceria Oficial Angeleti</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Acesso direto às tabelas de Golden Green e Vale dos Pássaros (15% + 120x).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Segurança Jurídica & RGI</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Certidões negativas, análise contratual e acompanhamento completo de documentação em cartório.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Atendimento Pessoal Direto</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Comunicação rápida diretamente comigo pelo WhatsApp, sem filas ou robôs impessoais.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-glow py-3 px-6 rounded-full font-bold text-xs sm:text-sm text-white inline-flex items-center gap-2 shadow-md active:scale-95 transition"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-white" />
                  <span>Falar com Ismael Dias no WhatsApp</span>
                </a>

                <Link
                  to="/loja"
                  className="py-3 px-6 rounded-full font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-2 transition"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explorar Imóveis & Lotes</span>
                </Link>
              </div>
            </div>

            {/* Right Card / Visual Credential */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-blue-600/10 via-sky-500/5 to-transparent border border-blue-500/20 text-center relative shadow-lg">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl mb-4">
                  <Home className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.2} />
                </div>

                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Ismael Dias
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider mt-0.5">
                  Corretor de Imóveis • Habittat House
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span>Imobiliária:</span>
                    <strong className="text-slate-900 dark:text-white">Habittat House</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Atuação:</span>
                    <strong className="text-slate-900 dark:text-white">Teresópolis & Região Serrana</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-black">Habittat House ✅</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Telefone / WhatsApp:</span>
                    <strong className="text-blue-600 dark:text-sky-400 font-extrabold">{PHONE_DISPLAY}</strong>
                  </div>
                </div>

                <div className="mt-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Plantão de Vendas & Atendimento Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   4. TRUST & PILLARS
   ========================================================================= */
function TrustAndHybrid() {
  const pillars = [
    {
      icon: Building2,
      color: "from-sky-500 to-blue-600",
      title: "Angeleti Construtora (+20 anos)",
      desc: "Tradição consolidada em Teresópolis desenvolvendo condomínios de alto padrão com infraestrutura e segurança completa.",
    },
    {
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      title: "Financiamento em até 120x",
      desc: "Compre direto com a incorporadora com apenas 15% de entrada. Condições flexíveis sem a lentidão dos bancos tradicionais.",
    },
    {
      icon: Trees,
      color: "from-indigo-500 to-purple-600",
      title: "Condomínios com Clube & Lazer",
      desc: "Piscina semiolímpica, quadras de tênis, academia, sauna, trilhas ecológicas e propostas exclusivas como o condomínio equestre.",
    },
    {
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-600",
      title: "Segurança Jurídica & RGI",
      desc: "Lotes registrados em cartório, 100% legalizados, prontos para você projetar e construir sua casa dos sonhos na serra.",
    },
  ];

  return (
    <section id="diferenciais" className="py-10 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          badge="Segurança & Tradição"
          eyebrow="Por que escolher a Habittat House?"
          title="A Melhor Experiência Imobiliária de Teresópolis"
          subtitle="Comprar seu lote ou casa com transparência jurídica, consultoria especializada e condições facilitadas de pagamento."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between transition hover:-translate-y-1"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${p.color} shadow-md mb-4`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   4. FINANCIAMENTO DIRETO SECTION
   ========================================================================= */
function FinanciamentoDireto() {
  const handleSimularWhatsApp = () => {
    const text = `Olá, equipe Habittat House! Gostaria de fazer uma simulação de financiamento direto para compra de lote nos condomínios da Angeleti (Golden Green ou Vale dos Pássaros).`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const steps = [
    {
      num: "1",
      title: "Escolha o Empreendimento",
      desc: "Golden Green (Albuquerque) ou Vale dos Pássaros (Prata).",
    },
    {
      num: "2",
      title: "Entrada Facilitada (15%)",
      desc: "Inicie seu investimento com entrada a partir de 15% e fluxo flexível.",
    },
    {
      num: "3",
      title: "Saldo em até 120x",
      desc: "Parcelamento direto com a incorporadora sem burocracia bancária.",
    },
  ];

  return (
    <section id="financiamento" className="py-10 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-4xl mx-auto glass-card p-6 sm:p-10 rounded-3xl border border-blue-500/25 text-center">
        <SectionTitle
          badge="Condições Diretas"
          eyebrow="Financiamento Facilitado"
          title="Seu Terreno na Serra em até 120 Parcelas"
          subtitle="Compre seu lote residencial com entrada a partir de 15% e parcelamento direto com a construtora."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 mt-4 text-left">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                {s.num}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {s.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSimularWhatsApp}
            className="btn-primary-glow py-3.5 px-8 rounded-full font-bold text-sm text-white inline-flex items-center gap-2 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Simular Parcelamento no WhatsApp</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
          Atendimento personalizado com o corretor Ismael Dias na Habittat House.
        </p>
      </div>
    </section>
  );
}

/* =========================================================================
   5. REVIEWS & LOCATION
   ========================================================================= */
function ReviewsAndLocation() {
  const doubled = [...reviews, ...reviews];

  return (
    <section id="sobre" className="py-10 sm:py-16 px-4 sm:px-6 overflow-hidden scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          badge="Avaliações de Clientes"
          eyebrow="Depoimentos Reais"
          title="Quem Compra na Serra Recomenda"
          subtitle="Atendimento consultivo, segurança na negociação e excelência em cada detalhe."
        />

        {/* Reviews Marquee */}
        <div className="relative mt-4 mb-12 sm:mb-16 overflow-hidden py-2">
          <div className="marquee">
            {doubled.map((r, i) => (
              <div
                key={i}
                className="glass-card p-4 sm:p-5 w-[280px] sm:w-[320px] rounded-2xl shrink-0 text-left border border-slate-200/70 dark:border-slate-800/70"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs bg-gradient-to-br from-blue-600 to-sky-500 shadow-xs">
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-sky-400 font-semibold">
                      {r.neighborhood} • Teresópolis
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2 text-amber-400 text-xs">
                  {"★".repeat(5)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{r.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-blue-500/20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>Atendimento Presencial</span>
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Habittat House Imobiliária em Teresópolis
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Nosso escritório e ponto de apoio fica estrategicamente localizado em Albuquerque, com fácil acesso aos principais condomínios da Angeleti Construtora.
              </p>

              <div className="mt-4 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>{ADDRESS_DISPLAY}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Segunda a Sábado das 9h às 18h (Plantão aos domingos sob agendamento)</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>WhatsApp de Plantão: {PHONE_DISPLAY}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center gap-3">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-glow w-full py-3 px-5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span>Agendar Visita com Corretor</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   MAIN COMPONENT: BrandStore (Home Page)
   ========================================================================= */
function BrandStore() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("white");
  const [productList, setProductList] = useState<ProductItem[]>(defaultProducts);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync theme
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
      trackPageView("/");
      seedInitialAnalyticsIfEmpty(getAllProperties());

      const onThemeChanged = (e: any) => {
        if (e.detail?.theme) {
          setCurrentTheme(e.detail.theme);
        }
      };
      window.addEventListener("theme-changed", onThemeChanged);
      return () => window.removeEventListener("theme-changed", onThemeChanged);
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

  const handleOpenDetail = (product: ProductItem) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-900 dark:text-white transition-colors duration-300">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <BackgroundOrbs />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main>
        {/* 1. Hero com Empreendimentos e Imóveis */}
        <Hero />

        {/* 2. Destaques: Lotes Golden Green e Vale dos Pássaros */}
        <FeaturedProducts
          products={productList}
          onSelectProduct={handleOpenDetail}
        />

        {/* 3. Apresentação do Corretor Ismael Dias (Habittat House) */}
        <BrokerProfileSection />

        {/* 4. Diferenciais & Parceria Angeleti */}
        <TrustAndHybrid />

        {/* 5. Financiamento Direto em até 120x */}
        <FinanciamentoDireto />

        {/* 6. Depoimentos e Localização */}
        <ReviewsAndLocation />
      </main>

      {/* Modal de Detalhes do Imóvel */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <SiteFooter currentTheme={currentTheme} />
      <WhatsFloat />
      <MobileBottomNav />
    </div>
  );
}


