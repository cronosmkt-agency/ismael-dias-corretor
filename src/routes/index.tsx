import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Truck,
  Building2,
  ShieldCheck,
  Star,
  MessageCircle,
  Check,
  MapPin,
  Clock,
  Phone,
  ShoppingBag,
  Zap,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info,
  ChevronDown,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import { ProductDetailModal, type ProductItem } from "@/components/ProductDetailModal";
import {
  fetchGoogleSheetInventory,
  DEFAULT_SHEET_URL,
} from "@/services/googleSheets";
import {
  defaultProducts,
  fmt,
  WHATSAPP,
  PHONE_DISPLAY,
  reviews,
} from "@/data/storeData";
import { SiteNavbar } from "@/components/SiteNavbar";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsFloat } from "@/components/WhatsFloat";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { toast } from "sonner";

const heroIphone = "https://ik.imagekit.io/zinma/tr:w-800,f-webp,q-85/Terephones-iphone.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terephones — iPhones Novos & Seminovos em Teresópolis" },
      {
        name: "description",
        content:
          "Compre seu iPhone novo ou seminovo com Entrega Express em até 1h na sua porta ou retire na loja parceira SejaDelta em Teresópolis - RJ. Pague só na entrega!",
      },
      { property: "og:title", content: "Terephones — iPhones Novos & Seminovos em Teresópolis" },
      {
        property: "og:description",
        content:
          "Entrega no mesmo dia em até 1h ou retirada na SejaDelta. Seu novo iPhone em Teresópolis com garantia e pagamento seguro no ato da entrega.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Terephones",
          description:
            "Venda de iPhones novos e seminovos com Entrega Express no mesmo dia e ponto de retirada na loja parceira SejaDelta em Teresópolis - RJ.",
          telephone: "+5521964639999",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Teresópolis",
            addressLocality: "Teresópolis",
            addressRegion: "RJ",
            addressCountry: "BR",
            postalCode: "25953-040",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              opens: "10:00",
              closes: "18:00",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "500",
          },
        }),
      },
    ],
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

/* ---------- 3D Floating Tilt Phone (Desktop Only) ---------- */
function TiltPhone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | undefined>(undefined);
  const targetRef = useRef({ rotX: 0, rotY: 0 });
  const currentRef = useRef({ rotX: 0, rotY: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let isRunning = false;

    const animate = () => {
      const speed = 0.08;
      const diffX = targetRef.current.rotX - currentRef.current.rotX;
      const diffY = targetRef.current.rotY - currentRef.current.rotY;
      currentRef.current.rotX += diffX * speed;
      currentRef.current.rotY += diffY * speed;
      el.style.transform = `perspective(900px) rotateX(${currentRef.current.rotX}deg) rotateY(${currentRef.current.rotY}deg) scale3d(1.04, 1.04, 1.04)`;

      if (
        Math.abs(diffX) > 0.02 ||
        Math.abs(diffY) > 0.02 ||
        targetRef.current.rotX !== 0 ||
        targetRef.current.rotY !== 0
      ) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        isRunning = false;
        frameRef.current = undefined;
      }
    };

    const startAnimate = () => {
      if (!isRunning) {
        isRunning = true;
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      targetRef.current = { rotX: -dy * 16, rotY: dx * 16 };

      if (glowRef.current) {
        const gx = ((e.clientX - rect.left) / rect.width) * 100;
        const gy = ((e.clientY - rect.top) / rect.height) * 100;
        glowRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(26,111,232,0.18), transparent 65%)`;
      }
      startAnimate();
    };

    const onLeave = () => {
      targetRef.current = { rotX: 0, rotY: 0 };
      startAnimate();
    };

    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(26,111,232,0.18), transparent 65%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <img
        src={heroIphone}
        alt="iPhone Terephones em destaque"
        fetchPriority="high"
        decoding="async"
        width={500}
        height={500}
        className="relative z-10 w-[300px] lg:w-[460px] h-auto float-slow"
        style={{
          filter: "drop-shadow(0 35px 50px rgba(13,27,62,0.22))",
          transformStyle: "preserve-3d",
          userSelect: "none",
          pointerEvents: "none",
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
   1. HERO SECTION (Compact, Magnetic & High-Conversion)
   ========================================================================= */
function Hero() {
  return (
    <section
      id="inicio"
      className="hero-section-fold relative pt-20 pb-4 sm:pt-24 sm:pb-8 lg:py-0 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-20 my-auto">
        {/* Left Column: Headlines & High-Value Buying CTAs */}
        <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-50/90 dark:bg-sky-950/60 text-blue-600 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800/80 shadow-xs mb-3 sm:mb-4 mx-auto lg:mx-0 w-fit">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>iPhones Novos & Seminovos em Teresópolis</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white">
            O seu novo{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-teal-300">
              iPhone
            </span>
            ,<br />
            na sua mão hoje.
          </h1>

          {/* Value Prop Subtitle */}
          <p className="mt-3 sm:mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Entrega Express em até 1 hora na sua porta ou Retirada presencial na loja parceira{" "}
            <strong className="text-slate-900 dark:text-white font-bold">SejaDelta</strong>.
            Aparelhos revisados com até 1 ano de garantia Apple e{" "}
            <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              pagamento somente na entrega!
            </strong>{" "}
            🍎⚡
          </p>

          {/* Action CTAs */}
          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center lg:justify-start">
            <Link
              to="/loja"
              className="btn-primary-glow inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-full font-bold text-sm text-white shadow-lg active:scale-95 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Catálogo na Loja</span>
            </Link>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 sm:py-3.5 px-6 rounded-full font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Pedir no WhatsApp</span>
            </a>
          </div>

          {/* Micro Trust Indicators */}
          <div className="mt-5 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span><strong>4,9</strong> no Google</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <Truck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Entrega em até 1h</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
              <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Ponto SejaDelta</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-emerald-600 dark:text-emerald-400 font-black">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Pague só na Entrega</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Tilt Phone on Desktop */}
        <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
          <TiltPhone />
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   2. FEATURED PRODUCTS (Curated Top 4 Best-Sellers + Direct Store CTA)
   ========================================================================= */
function FeaturedProducts({
  products,
  onSelectProduct,
}: {
  products: ProductItem[];
  onSelectProduct: (p: ProductItem) => void;
}) {
  // Select top 4 best-sellers featuring iPhone 17 and iPhone 16
  const featured = (() => {
    const list = products && products.length > 0 ? products : defaultProducts;

    const findModel = (query: string) =>
      list.find((p) => p.name.toLowerCase().includes(query.toLowerCase()));

    const p1 = findModel("iPhone 17 Pro Max") || list[0];
    const p2 = findModel("iPhone 17 Pro") || findModel("iPhone 17 256GB") || findModel("iPhone 17") || list[1];
    const p3 = findModel("iPhone 16 Pro Max") || findModel("iPhone 16 Pro") || list[2];
    const p4 = findModel("iPhone 16 128GB") || findModel("iPhone 16") || findModel("iPhone 16 Pro") || list[3];

    const chosen: ProductItem[] = [];
    [p1, p2, p3, p4].forEach((p) => {
      if (p && !chosen.some((c) => c.name === p.name)) {
        chosen.push(p);
      }
    });

    if (chosen.length < 4) {
      for (const p of list) {
        if (!chosen.some((c) => c.name === p.name)) {
          chosen.push(p);
        }
        if (chosen.length === 4) break;
      }
    }

    return chosen;
  })();

  const handleBuyWhatsApp = (prod: ProductItem) => {
    const isNovo = prod.cat === "Novos" || prod.badge.toLowerCase().includes("lacrado");
    const storageDisplay =
      prod.storage || prod.name.match(/\d+(gb|tb)/i)?.[0]?.toUpperCase() || "128GB";
    const condText = isNovo
      ? "Novo Lacrado de Fábrica"
      : `Seminovo Grade A+${prod.battery ? ` (Saúde da Bateria: ${prod.battery})` : ""}`;

    const text = `Olá, equipe Terephones! Gostaria de pedir este iPhone em destaque que vi no site:

📱 *Aparelho:* ${prod.name}
💰 *Valor à vista:* ${fmt(prod.price)} (ou até 18x no cartão)
💾 *Capacidade:* ${storageDisplay}
✨ *Condição:* ${condText}

Gostaria de confirmar a disponibilidade para entrega hoje em Teresópolis!`;

    window.open(`https://wa.me/5521964639999?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="destaques" className="py-8 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          badge="Pronta Entrega em Terê"
          eyebrow="Oportunidades em Destaque"
          title="Os iPhones Mais Pedidos da Semana"
          subtitle="Aparelhos 100% testados em mais de 25 itens técnicos. Escolha o seu e receba hoje em mãos."
        />

        {/* 4 Curated Cards in 2x2 Grid (Mobile) / 4 Columns (Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mt-5">
          {featured.map((item) => {
            const catLabel = item.cat.toLowerCase().includes("semi") ? "Seminovo" : "Novo Lacrado";
            const batteryLabel = item.badge ? item.badge.replace("Bateria ", "Bat. ") : "Revisado";

            return (
              <div
                key={item.name}
                className="glass-card flex flex-col justify-between p-3 sm:p-5 rounded-2xl group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
              >
                {/* Top Tags */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 border border-blue-200/60 dark:border-sky-800/60 shrink-0">
                    {catLabel}
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                    {batteryLabel}
                  </span>
                </div>

                {/* Product Photo */}
                <div
                  className="relative py-2 sm:py-4 flex items-center justify-center cursor-pointer"
                  onClick={() => onSelectProduct(item)}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    loading="lazy"
                    className="w-24 h-24 sm:w-36 sm:h-36 object-contain transition-transform duration-300 group-hover:scale-105 select-none"
                  />
                </div>

                {/* Product Info */}
                <div className="mt-1 sm:mt-2 text-left">
                  <h3
                    onClick={() => onSelectProduct(item)}
                    className="font-black text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 dark:hover:text-sky-400 transition"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 truncate">
                    {item.specs || item.storage || "Pronta entrega em Teresópolis"}
                  </div>

                  {/* Price Display */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="text-sm sm:text-xl font-black text-blue-600 dark:text-sky-400 leading-tight">
                      {fmt(item.price)}
                    </div>
                    <div className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                      à vista ou até 18x no cartão
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleBuyWhatsApp(item)}
                    className="w-full py-1.5 sm:py-2 px-2 rounded-xl font-bold text-[11px] sm:text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Pedir no Zap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(item)}
                    className="w-full py-1 sm:py-1.5 px-2 rounded-xl text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>Ver Detalhes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Transition Banner to Full Store */}
        <div className="mt-6 sm:mt-8 glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border border-blue-500/20 text-center sm:text-left">
          <div>
            <div className="text-xs sm:text-base font-black text-slate-900 dark:text-white">
              Buscando outro modelo, cor ou capacidade?
            </div>
            <div className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Temos estoque completo atualizado diariamente com garantia Apple de até 1 ano.
            </div>
          </div>
          <Link
            to="/loja"
            className="btn-primary-glow shrink-0 py-2 sm:py-2.5 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold text-white inline-flex items-center gap-2 shadow-md active:scale-95 transition"
          >
            <span>Ver Catálogo Completo na Loja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   3. TRUST & HYBRID MODEL (Unified Value Proposition Without Redundancy)
   ========================================================================= */
function TrustAndHybrid() {
  const pillars = [
    {
      icon: Truck,
      color: "from-sky-500 to-blue-600",
      title: "Entrega Express em até 1h",
      desc: "Levamos seu iPhone na sua porta em qualquer bairro de Teresópolis. Rápido, seguro e sem espera de dias.",
    },
    {
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600",
      title: "Pague Só na Entrega",
      desc: "Zero risco de golpe na internet: confira a caixa, teste a câmera, tela e funções na sua mão antes de fazer o pagamento.",
    },
    {
      icon: Building2,
      color: "from-indigo-500 to-purple-600",
      title: "Ponto Físico na SejaDelta",
      desc: "Prefere retirar presencialmente? Atendimento exclusivo na loja parceira SejaDelta no centro de Teresópolis.",
    },
    {
      icon: Star,
      color: "from-amber-500 to-orange-600",
      title: "Até 1 Ano de Garantia",
      desc: "Novos lacrados com garantia mundial Apple e seminovos aprovados em 25+ testes com 90 dias de garantia total.",
    },
  ];

  return (
    <section id="diferenciais" className="py-10 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          badge="Segurança Total"
          eyebrow="Por que a Terephones?"
          title="A Experiência Apple Mais Segura de Teresópolis"
          subtitle="Comprar seu iPhone novo ou seminovo não precisa ser arriscado nem demorado."
        />

        {/* 4 Pillars Grid */}
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
   4. TRADE-IN SECTION (Streamlined High-Conversion Card)
   ========================================================================= */
function TradeIn() {
  const handleTradeWhatsApp = () => {
    const text = `Olá, equipe Terephones! Gostaria de simular a troca do meu iPhone usado por um modelo novo/seminovo. Tenho interesse na Troca Inteligente (Trade-In)!`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const steps = [
    {
      num: "1",
      title: "Informe seu aparelho",
      desc: "Diga qual modelo você tem e a saúde da bateria.",
    },
    {
      num: "2",
      title: "Avaliação em 5 min",
      desc: "Receba a melhor proposta da região pelo WhatsApp.",
    },
    {
      num: "3",
      title: "Pague só a diferença",
      desc: "Entregamos o novo e pegamos seu usado na hora.",
    },
  ];

  return (
    <section id="troca" className="py-10 sm:py-16 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-4xl mx-auto glass-card p-6 sm:p-10 rounded-3xl border border-blue-500/25 text-center">
        <SectionTitle
          badge="Melhor Avaliação de Terê"
          eyebrow="Troca Inteligente (Trade-In)"
          title="Seu iPhone Usado Vale Dinheiro na Troca"
          subtitle="Aceitamos seu iPhone a partir do modelo XR como entrada no novo. Avaliação rápida, justa e sem burocracia."
        />

        {/* 3 Quick Step Cards */}
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

        {/* Fast Action CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleTradeWhatsApp}
            className="btn-primary-glow py-3.5 px-8 rounded-full font-bold text-sm text-white inline-flex items-center gap-2 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 shrink-0" />
            <span>Simular Troca no WhatsApp Agora</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
          Atendimento humanizado e resposta imediata durante o horário comercial.
        </p>
      </div>
    </section>
  );
}

/* =========================================================================
   5. REVIEWS & LOCATION (Social Proof & SejaDelta Partner Card)
   ========================================================================= */
function ReviewsAndLocation() {
  const doubled = [...reviews, ...reviews];

  return (
    <section id="sobre" className="py-10 sm:py-16 px-4 sm:px-6 overflow-hidden scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          badge="Google 4,9 ★"
          eyebrow="Depoimentos Reais"
          title="Quem Compra em Teresópolis Recomenda"
          subtitle="Mais de 500 clientes atendidos com nota máxima em procedência e rapidez."
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

        {/* Ponto Físico SejaDelta & Localização Card (Sem Iframe que trava o scroll) */}
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-blue-500/20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Ponto Físico Oficial de Apoio</span>
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Loja Parceira SejaDelta em Teresópolis
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Você conta com o suporte e a segurança de um endereço presencial no centro da cidade para retirar aparelhos, aplicar películas ou tirar dúvidas pessoalmente.
              </p>

              <div className="mt-4 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Av. José Joaquim de Araújo Regadas, 146 — Várzea, Teresópolis - RJ</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Segunda a Sábado — 10:00 às 18:00</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Phone className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>WhatsApp de Suporte: {PHONE_DISPLAY}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center gap-3">
              <a
                href="https://maps.google.com/?q=Av.+Jos%C3%A9+Joaquim+de+Ara%C3%BAjo+Regadas,+146+-+V%C3%A1rzea,+Teres%C3%B3polis+-+RJ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-glow w-full py-3 px-5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Abrir no Google Maps</span>
              </a>

              <a
                href={`${WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de agendar uma retirada na loja SejaDelta em Teresópolis.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-center"
              >
                Agendar Retirada na Loja
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
      const onThemeChanged = (e: any) => {
        if (e.detail?.theme) {
          setCurrentTheme(e.detail.theme);
        }
      };
      window.addEventListener("theme-changed", onThemeChanged);
      return () => window.removeEventListener("theme-changed", onThemeChanged);
    }
  }, []);

  // Fetch real inventory
  useEffect(() => {
    const sheetUrl =
      (import.meta.env.VITE_GOOGLE_SHEET_URL as string) || DEFAULT_SHEET_URL;
    if (sheetUrl) {
      fetchGoogleSheetInventory(sheetUrl)
        .then((items) => {
          if (items && items.length > 0) {
            setProductList(items);
          }
        })
        .catch((err) => {
          console.warn("Catálogo padrão Terephones ativo:", err);
        });
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
        {/* 1. Hero Compacto & Magnético com CTAs e Selos de Confiança */}
        <Hero />

        {/* 2. Destaques da Semana: 4 Melhores Oportunidades + Atalho Loja */}
        <FeaturedProducts
          products={productList}
          onSelectProduct={handleOpenDetail}
        />

        {/* 3. Diferenciais & Modelo Híbrido SejaDelta Sem Redundâncias */}
        <TrustAndHybrid />

        {/* 4. Troca Inteligente de Usado (Trade-In com Troco em 3 Passos) */}
        <TradeIn />

        {/* 5. Depoimentos Reais no Google & Card Ponto de Apoio SejaDelta */}
        <ReviewsAndLocation />
      </main>

      {/* Modal de Detalhes do Produto */}
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
