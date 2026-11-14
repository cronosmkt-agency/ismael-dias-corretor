import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ThemeSelectorModal } from "@/components/ThemeSelectorModal";
import { useHabittatTheme } from "@/hooks/useHabittatTheme";
import type { ProductItem } from "@/types/imovel";
import { SiteNavbar } from "@/components/SiteNavbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { trackPageView, seedInitialAnalyticsIfEmpty } from "@/services/analyticsService";
import { getAllProperties } from "@/services/propertiesService";
import { PropertyWizard } from "@/components/PropertyWizard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curadoria Imobiliária em Teresópolis | Ismael Dias • Habittat House" },
      {
        name: "description",
        content:
          "Encontre seu imóvel ideal em Teresópolis com a assessoria exclusiva do corretor Ismael Dias na Habittat House. Curadoria personalizada de casas em condomínio, coberturas e terrenos.",
      },
      { property: "og:title", content: "Curadoria Imobiliária | Ismael Dias • Habittat House" },
      {
        property: "og:description",
        content:
          "Curadoria exclusiva de casas de alto padrão, terrenos e coberturas em Teresópolis com o corretor Ismael Dias.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://ismael-dias-corretor.vercel.app/" }],
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

/* =========================================================================
   PÁGINA PRINCIPAL: 100% TELA ÚNICA COM O GUIA INTERATIVO (ZERO ROLAGEM)
   ========================================================================= */
function BrandStore() {
  const { currentTheme, setCurrentTheme, toggleTheme } = useHabittatTheme();
  const [productList, setProductList] = useState<ProductItem[]>(() => getAllProperties());

  useEffect(() => {
    trackPageView("/");
    const handlePropsChanged = () => {
      setProductList(getAllProperties());
    };
    window.addEventListener("properties-data-changed", handlePropsChanged);

    // Seed analítico assíncrono leve
    const timer = setTimeout(() => {
      seedInitialAnalyticsIfEmpty(getAllProperties());
    }, 400);

    return () => {
      window.removeEventListener("properties-data-changed", handlePropsChanged);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden flex flex-col justify-between text-slate-900 dark:text-white transition-colors duration-300 select-none">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <BackgroundOrbs />
      
      {/* Top Navbar */}
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      {/* Área Central: O Guia Interativo ocupa 100% da tela sem rolagem de página */}
      <main className="flex-1 w-full h-full flex flex-col justify-center items-center pt-20 sm:pt-24 pb-16 sm:pb-6 px-3 sm:px-4 overflow-hidden">
        <PropertyWizard allProperties={productList} />
      </main>

      {/* Navegação Rápida no Rodapé Mobile */}
      <MobileBottomNav />
    </div>
  );
}
