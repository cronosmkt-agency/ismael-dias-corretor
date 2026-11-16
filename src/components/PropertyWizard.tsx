import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home,
  ShieldCheck,
  Building2,
  Trees,
  KeyRound,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  RotateCcw,
  Waves,
  Moon,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  Send,
} from "lucide-react";
import type { ProductItem } from "@/types/imovel";
import { fmt, WHATSAPP_NUMBER } from "@/data/storeData";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { scoreProperties, type WizardAnswers, type ScoredProperty } from "@/lib/wizardScoring";
import { trackWhatsAppClick } from "@/services/analyticsService";
import { ProductDetailModal } from "@/components/ProductDetailModal";

interface PropertyWizardProps {
  allProperties: ProductItem[];
  onBrowseAll?: () => void;
}

export function PropertyWizard({ allProperties }: PropertyWizardProps) {
  const [step, setStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem("wizard_step");
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 1 && val <= 10) return val;
      }
    } catch (_) {}
    return 1;
  });

  const [answers, setAnswers] = useState<WizardAnswers>(() => {
    try {
      const saved = sessionStorage.getItem("wizard_answers");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      objective: undefined,
      occupants: undefined,
      propertyType: undefined,
      region: undefined,
      priceRange: undefined,
      essentials: [],
      paymentMethod: undefined,
    };
  });

  const [sellerForm, setSellerForm] = useState({
    name: "",
    phone: "",
    propertyType: "Casa em Condomínio",
    bairro: "",
    estimatedPrice: "",
    details: "",
  });

  const [selectedProductModal, setSelectedProductModal] = useState<ProductItem | null>(null);
  const [replacedNotice, setReplacedNotice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem("wizard_step", String(step));
    } catch (_) {}
  }, [step]);

  useEffect(() => {
    try {
      sessionStorage.setItem("wizard_answers", JSON.stringify(answers));
    } catch (_) {}
  }, [answers]);

  const recommendedProperties: ScoredProperty[] = useMemo(() => {
    if (step < 8) return [];
    return scoreProperties(allProperties, answers);
  }, [allProperties, answers, step]);

  const handleSelectSimple = (key: keyof WizardAnswers, value: any, nextStep: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep(nextStep);
  };

  const handleFinalizeCuration = (paymentKey: any) => {
    setAnswers((prev) => ({ ...prev, paymentMethod: paymentKey }));
    setIsAnalyzing(true);
    setAnalysisStage(0);

    setTimeout(() => setAnalysisStage(1), 450);
    setTimeout(() => setAnalysisStage(2), 950);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(8);
    }, 1400);
  };

  const toggleEssential = (key: string) => {
    setAnswers((prev) => {
      const curr = prev.essentials || [];
      if (curr.includes(key)) {
        return { ...prev, essentials: curr.filter((k) => k !== key) };
      }
      if (curr.length >= 2) {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(25);
          } catch (_) {}
        }
        setReplacedNotice("Seleção atualizada (máx. 2 itens)");
        setTimeout(() => setReplacedNotice(null), 1800);
        return { ...prev, essentials: [curr[1], key] };
      }
      return { ...prev, essentials: [...curr, key] };
    });
  };

  const handleReset = () => {
    setAnswers({
      objective: undefined,
      occupants: undefined,
      propertyType: undefined,
      region: undefined,
      priceRange: undefined,
      essentials: [],
      paymentMethod: undefined,
    });
    setStep(1);
    try {
      sessionStorage.removeItem("wizard_step");
      sessionStorage.removeItem("wizard_answers");
    } catch (_) {}
  };

  const handleContactProperty = (prop: ProductItem, rankLabel: string, highlight?: string) => {
    trackWhatsAppClick("wizard_match", prop.sku);

    const getObjectiveLabel = (obj?: string) => {
      if (obj === "comprar") return "Comprar Imóvel Pronto";
      if (obj === "construir") return "Construir meu Refúgio (Terreno)";
      if (obj === "lancamentos") return "Lançamentos Angeleti";
      return "Aquisição em Teresópolis";
    };

    const getOccupantsLabel = (occ?: string) => {
      if (occ === "casal") return "Individual / Casal (1 a 2 quartos)";
      if (occ === "familia_pequena") return "Família com Filhos (2 a 3 quartos)";
      if (occ === "familia_grande") return "Família Ampliada (4+ quartos)";
      if (occ === "investimento") return "Investimento / Renda";
      return "Moradia";
    };

    const getPropertyTypeLabel = (pt?: string) => {
      if (pt === "condominio") return "Casa em Condomínio Fechado";
      if (pt === "apartamento") return "Apartamento / Cobertura Nobre";
      if (pt === "casa_avulsa") return "Casa ou Sítio em Área Aberta";
      if (pt === "terreno") return "Terreno / Lote em Condomínio";
      if (pt === "comercial") return "Comercial / Ponto";
      return "Qualquer Tipologia Nobre";
    };

    const getRegionLabel = (reg?: string) => {
      if (reg === "condominios") return "Região dos Condomínios (Albuquerque / Green Valley)";
      if (reg === "serra_natureza") return "Serra & Natureza (Vargem Grande / Alto / Quebra Frascos)";
      if (reg === "centro") return "Central & Urbano (Várzea / Agriões / Golfe)";
      if (reg === "expansao") return "Expansão & Tranquilidade (Posse / Vieira / Venda Nova)";
      return "Qualquer Região de Teresópolis";
    };

    const getPriceRangeLabel = (pr?: string) => {
      if (pr === "ate_300k") return "Até R$ 300 mil";
      if (pr === "300k_600k") return "R$ 300 mil a R$ 600 mil";
      if (pr === "600k_1m") return "R$ 600 mil a R$ 1 Milhão";
      if (pr === "1m_2m") return "R$ 1 Milhão a R$ 2 Milhões";
      if (pr === "acima_2m") return "Acima de R$ 2 Milhões";
      return "A combinar";
    };

    const getPaymentLabel = (pm?: string) => {
      if (pm === "financiamento") return "Financiamento Bancário";
      if (pm === "a_vista") return "Recursos Próprios / À Vista";
      if (pm === "parcelado") return "Parcelamento Direto com Incorporadora";
      if (pm === "permuta") return "Estuda Permuta / Troca";
      return "Consultoria Personalizada";
    };

    const text = `Olá, Ismael Dias! 🏡
Acabei de concluir a Curadoria no seu site (ismaeldias.shop) e gostaria de conversar sobre minha recomendação:

📋 *Meu Perfil de Busca:*
• Objetivo: ${getObjectiveLabel(answers.objective)}
• Para quem: ${getOccupantsLabel(answers.occupants)}
• Tipologia: ${getPropertyTypeLabel(answers.propertyType)}
• Região: ${getRegionLabel(answers.region)}
• Investimento: ${getPriceRangeLabel(answers.priceRange)}
• Pagamento: ${getPaymentLabel(answers.paymentMethod)}

⭐ *Recomendação Selecionada:*
${rankLabel}
🏡 *Imóvel:* ${prop.name}
📍 *Localização:* ${prop.bairro || prop.screen || "Teresópolis/RJ"}
🔢 *Código:* #${prop.sku || "Habittat"}
💰 *Valor:* ${fmt(prop.price)}
🔗 *Link:* https://ismaeldias.shop/imovel/${prop.sku || ""}

Podemos conversar sobre as condições e agendar uma visita guiada?`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name || !sellerForm.phone) return;

    const text = `Olá, Ismael Dias! 🔑
Gostaria de avaliar e anunciar meu imóvel com você e a Habittat House:

👤 *Proprietário:* ${sellerForm.name}
📞 *WhatsApp / Contato:* ${sellerForm.phone}
🏡 *Tipo do Imóvel:* ${sellerForm.propertyType}
📍 *Bairro em Teresópolis:* ${sellerForm.bairro || "A combinar"}
💰 *Valor Estimado:* ${sellerForm.estimatedPrice || "Gostaria de uma avaliação"}
📝 *Detalhes:* ${sellerForm.details || "Nenhum detalhe adicional informado"}

Podemos conversar sobre a avaliação comercial?`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const totalSteps = 7;
  const progressPercent = Math.min(100, Math.round(((step - 1) / totalSteps) * 100));

  return (
    <div
      ref={containerRef}
      className="w-full max-w-3xl mx-auto flex flex-col justify-center items-center h-full max-h-full font-sans"
    >
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#FBFBF9]/95 dark:bg-[#0D0E11]/95 backdrop-blur-2xl border border-stone-200/90 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-3.5 sm:p-6 lg:p-7 flex flex-col justify-between max-h-[calc(100dvh-9.25rem)] sm:max-h-[calc(100dvh-7.5rem)] overflow-hidden transition-all duration-300">
        
        {/* Barra de Progresso Superior */}
        {step <= 7 && step !== 10 && !isAnalyzing && (
          <div className="mb-3 sm:mb-4 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-serif font-bold tracking-wider uppercase bg-stone-100 dark:bg-stone-900 text-[#1A3828] dark:text-[#C5A880] border border-stone-200 dark:border-white/10">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Curadoria Ismael Dias</span>
              </div>
              <span className="text-[11px] font-sans font-medium text-stone-500 dark:text-stone-400">
                Etapa {step} de {totalSteps}
              </span>
            </div>

            <div className="w-full h-1 sm:h-1.5 rounded-full bg-stone-200/70 dark:bg-stone-800/80 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1A3828] via-[#2A523A] to-[#C5A880] dark:from-[#C5A880] dark:to-[#E8DCC8] transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            MICRO-INTERAÇÃO: ANÁLISE DE CURADORIA (TRANSIÇÃO ENTRE PASSO 7 E 8)
           ========================================================================= */}
        {isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 text-center animate-in fade-in duration-300">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-[#C5A880]/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#C5A880] border-r-transparent border-b-[#1A3828] border-l-transparent animate-spin" />
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#C5A880] animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-900 text-[#1A3828] dark:text-[#C5A880] border border-stone-200 dark:border-white/10 mb-2">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>Inteligência Imobiliária • Ismael Dias</span>
            </div>

            <h3 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight transition-all duration-300 min-h-[32px]">
              {analysisStage === 0 && "Cruzando suas preferências com 212 imóveis..."}
              {analysisStage === 1 && "Avaliando segurança, zoneamento, lazer e liquidez..."}
              {analysisStage === 2 && "Curadoria concluída! Selecionando a tríade de ouro..."}
            </h3>

            <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 max-w-sm mt-1">
              Processando o acervo boutique em Teresópolis para entregar recomendações com sinergia absoluta.
            </p>

            <div className="w-48 sm:w-64 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-[#1A3828] via-[#C5A880] to-[#E8DCC8] transition-all duration-400 ease-out"
                style={{ width: analysisStage === 0 ? "35%" : analysisStage === 1 ? "75%" : "100%" }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 1: OBJETIVO PRINCIPAL
           ========================================================================= */}
        {step === 1 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="text-center mb-2.5 sm:mb-4">
              <h2 className="font-serif text-lg sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Qual é o seu objetivo em Teresópolis?
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Selecione uma opção para personalizarmos a sua curadoria:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSelectSimple("objective", "comprar", 2)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <Home className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Comprar Imóvel Pronto</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Casas em condomínio, coberturas ou apartamentos de alto padrão prontos para morar.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("objective", "construir", 2)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <Trees className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Construir meu Refúgio</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Lotes e terrenos selecionados com vista panorâmica e infraestrutura completa.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStep(10)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <KeyRound className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Avaliar e Vender meu Imóvel</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Divulgue seu imóvel para a base qualificada de clientes de alto padrão da Habittat House.
                </p>
              </button>

              <Link
                to="/lancamentos"
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Building2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Lançamentos Angeleti</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#1A3828] dark:text-[#C5A880]">
                    120x Direto
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Conheça o Golden Green e Vale dos Pássaros com financiamento direto sem banco.
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 2: QUEM VAI MORAR
           ========================================================================= */}
        {step === 2 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Para quem é o imóvel?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "casal", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Individual ou Casal
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  1 a 2 quartos, apartamentos práticos ou casas aconchegantes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "familia_pequena", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Família com Filhos
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  3 quartos, quintal amplo, condomínio seguro com infraestrutura infantil.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "familia_grande", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Família Ampliada / Amigos
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  4+ quartos, suítes independentes e generoso espaço gourmet.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "investimento", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Investimento / Renda Patrimonial
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Foco em liquidez, locação por temporada ou valorização de capital.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 3: TIPO DE IMÓVEL (CONDICIONAL: SE CONSTRUIR -> LOTES)
           ========================================================================= */}
        {step === 3 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {answers.objective === "construir"
                  ? "Que perfil de terreno você procura?"
                  : "Que tipologia você busca?"}
              </h2>
            </div>

            {answers.objective === "construir" ? (
              // Opções específicas para quem quer construir
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "condominio", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Lote em Condomínio Clube</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Portaria 24h, clube com piscina, quadras e segurança total.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "terreno", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Trees className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Terreno em Bairro Nobre</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Vista panorâmica indevassável para as montanhas e privacidade.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "casa_avulsa", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Home className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Chácara / Gleba com Nascente</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Metragem generosa para refúgio rural, pomar e contato puro com a mata.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "qualquer", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Compass className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Qualquer Lote com Potencial</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Avaliar todas as melhores oportunidades de topografia e valor de m².
                  </p>
                </button>
              </div>
            ) : (
              // Opções para imóveis prontos
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "condominio", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Casa em Condomínio Fechado</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Segurança 24h, portaria, lazer privativo e privacidade.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "apartamento", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Building2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Apartamento ou Cobertura Nobre</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Conveniência urbana, próximo ao centro ou com vista panorâmica.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "casa_avulsa", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Home className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Casa ou Sítio em Área Aberta</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Sem taxa condominial, terrenos generosos e total liberdade.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSimple("propertyType", "qualquer", 4)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    <Compass className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Quero ver as Melhores Oportunidades</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Sem preferência fixa: apresentar as opções de maior custo-benefício.
                  </p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            PASSO 4: REGIÃO PREFERIDA
           ========================================================================= */}
        {step === 4 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Em qual região você prefere estar?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectSimple("region", "condominios", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Região dos Condomínios Nobres</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Albuquerque, Green Valley, Comary, Golfe e Carlos Guinle.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "serra_natureza", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <Trees className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Serra & Natureza Preservada</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Vargem Grande, Quebra Frascos, Alto, Parque do Imbuí e Tijuca.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "centro", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <Building2 className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Central, Urbano & Gastronomia</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Várzea, Agriões, Centro e proximidades com comércio a pé.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "qualquer", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  <Compass className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>Aberto a Sugestões de Teresópolis</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Priorizar a qualidade e valor do imóvel antes da localização exata.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 5: FAIXA DE INVESTIMENTO
           ========================================================================= */}
        {step === 5 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Qual a sua faixa de investimento prevista?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5 mt-1 sm:mt-1.5">
              {[
                { key: "ate_300k", label: "Até R$ 300 mil", desc: "Oportunidades, terrenos e compactos" },
                { key: "300k_600k", label: "R$ 300 mil a R$ 600 mil", desc: "Primeiro imóvel na serra e ótimo custo-benefício" },
                { key: "600k_1m", label: "R$ 600 mil a R$ 1 Milhão", desc: "Casas em condomínio e conforto familiar" },
                { key: "1m_2m", label: "R$ 1 Milhão a R$ 2 Milhões", desc: "Alto padrão em Albuquerque e lazer privativo" },
                { key: "acima_2m", label: "Acima de R$ 2 Milhões", desc: "Mansões exclusivas e alto padrão nobre", span: true },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectSimple("priceRange", opt.key, 6)}
                  className={`flex items-center justify-between py-2 px-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 active:scale-[0.98] transition-all text-left group cursor-pointer ${
                    opt.span ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <h3 className="font-serif font-bold text-[11px] sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors truncate">
                      {opt.label}
                    </h3>
                    <p className="text-[9.5px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {opt.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] shrink-0 transition-colors ml-1" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 6: O QUE É ESSENCIAL (ATÉ 2 ESCOLHAS)
           ========================================================================= */}
        {step === 6 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  O que é indispensável na sua escolha?
                </h2>
              </div>
              <div className="shrink-0">
                {replacedNotice ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#1A3828]/10 dark:bg-[#C5A880]/15 text-[#1A3828] dark:text-[#C5A880] border border-[#1A3828]/20 dark:border-[#C5A880]/30 animate-in fade-in duration-200 shadow-2xs">
                    {replacedNotice}
                  </span>
                ) : (
                  <span className="text-[11px] font-sans font-medium text-stone-600 dark:text-stone-300">
                    {(answers.essentials || []).length}/2 selecionados
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-1.5">
              {[
                { key: "seguranca", label: "Segurança 24h & Portaria", icon: ShieldCheck },
                { key: "natureza", label: "Área Verde & Vista", icon: Trees },
                { key: "lazer", label: "Piscina & Gourmet", icon: Waves },
                { key: "sossego", label: "Sossego & Privacidade", icon: Moon },
                { key: "alto_padrao", label: "Acabamento Nobre", icon: Sparkles },
                { key: "acesso", label: "Acesso Rápido à Cidade", icon: Compass },
              ].map((item) => {
                const isSelected = (answers.essentials || []).includes(item.key);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleEssential(item.key)}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all active:scale-[0.97] text-left cursor-pointer ${
                      isSelected
                        ? "border-[#1A3828] dark:border-[#C5A880] bg-[#1A3828]/5 dark:bg-[#C5A880]/10 shadow-xs"
                        : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#1A3828] dark:bg-[#C5A880] text-white dark:text-[#0D0E11]"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif font-bold text-[11px] sm:text-xs text-stone-900 dark:text-stone-100 truncate">
                        {item.label}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1A3828] dark:text-[#C5A880] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/70 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(7)}
                className="btn-primary-glow inline-flex items-center gap-1.5 py-2 px-5 rounded-full font-sans font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 7: FORMA DE PAGAMENTO (DISPARA A TRANSIÇÃO DE CURADORIA)
           ========================================================================= */}
        {step === 7 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Qual formato de negociação você prefere?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              {[
                { key: "financiamento", label: "Financiamento Bancário", desc: "Caixa, Itaú, Bradesco ou Santander com assessoria Ismael Dias" },
                { key: "a_vista", label: "Recursos Próprios / À Vista", desc: "Condição especial para pagamento à vista e agilidade de escritura" },
                { key: "parcelado", label: "Parcelado Direto (sem banco)", desc: "Entrada facilitada + parcelamento direto com incorporadora" },
                { key: "permuta", label: "Estudo Permuta / Troca", desc: "Avaliar outro imóvel ou veículo como parte de pagamento" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleFinalizeCuration(opt.key)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
                >
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    {opt.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 8: RESULTADO DOS 3 IMÓVEIS (A TRÍADE ESTRATÉGICA DE CURADORIA)
           ========================================================================= */}
        {step === 8 && !isAnalyzing && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300 overflow-hidden">
            {/* Cabeçalho de Resultados */}
            <div className="text-center mb-1.5 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-serif font-bold tracking-wider uppercase bg-stone-100 dark:bg-stone-900 text-[#1A3828] dark:text-[#C5A880] border border-stone-200 dark:border-white/10 mb-0.5">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Tríade de Ouro • Curadoria Ismael Dias</span>
              </div>
              <h2 className="font-serif text-sm sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Os 3 Imóveis Selecionados para o seu Perfil
              </h2>
              <p className="text-[10.5px] sm:text-xs text-stone-500 dark:text-stone-400">
                Toque para abrir a apresentação ou fale direto com Ismael no WhatsApp:
              </p>
            </div>

            {/* Os 3 Cards Estratégicos */}
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-y-auto overscroll-contain pr-0.5 py-1 max-h-[calc(100dvh-17rem)] sm:max-h-[calc(100dvh-14.5rem)] scrollbar-thin">
              {recommendedProperties.map((item, idx) => {
                const prop = item.property;
                const isRank1 = idx === 0;
                const isRank2 = idx === 1;

                return (
                  <div
                    key={prop.sku || idx}
                    className={`group rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col justify-between p-2.5 sm:p-3 relative bg-white dark:bg-stone-900/80 hover:shadow-lg ${
                      isRank1
                        ? "border-[#C5A880]/80 dark:border-[#C5A880]/60 ring-1 ring-[#C5A880]/30 shadow-md"
                        : isRank2
                        ? "border-stone-300/90 dark:border-white/20"
                        : "border-stone-200 dark:border-white/10"
                    }`}
                  >
                    {/* Topo do Card com Badge Editorial e Sinergia */}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[9.5px] font-sans font-bold tracking-tight uppercase truncate max-w-[70%] ${
                            isRank1
                              ? "bg-[#1A3828] text-[#C5A880] border border-[#C5A880]/40"
                              : isRank2
                              ? "bg-stone-800 text-amber-200 border border-amber-300/20"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          {item.highlightBadge}
                        </span>

                        <span className="text-[10px] font-sans font-bold text-[#1A3828] dark:text-[#C5A880] shrink-0">
                          {item.matchPercentage}% Sinergia
                        </span>
                      </div>

                      {/* Foto com Zoom e Overlay */}
                      <div
                        onClick={() => setSelectedProductModal(prop)}
                        className="relative aspect-16/10 rounded-lg sm:rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer mb-2"
                      >
                        <img
                          src={prop.img || "https://ismaeldias.shop/favicon.png"}
                          alt={prop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white text-[10px] font-sans">
                          <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-medium">
                            <MapPin className="w-2.5 h-2.5 text-[#C5A880]" />
                            <span className="truncate max-w-[120px]">{prop.bairro || "Teresópolis"}</span>
                          </span>
                          <span className="text-[9px] font-semibold text-stone-300">
                            Cód. #{prop.sku}
                          </span>
                        </div>
                      </div>

                      {/* Nome & Preço */}
                      <div className="mb-1.5">
                        <h3
                          onClick={() => setSelectedProductModal(prop)}
                          className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors cursor-pointer"
                        >
                          {prop.name}
                        </h3>
                        <div className="mt-0.5 font-serif text-sm sm:text-base font-bold text-[#1A3828] dark:text-[#C5A880]">
                          {fmt(prop.price)}
                        </div>
                      </div>

                      {/* Pílulas de Critérios Atendidos */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.matchedPills.map((pill, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-sans font-medium bg-stone-100 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60"
                          >
                            <Check className="w-2.5 h-2.5 text-[#1A3828] dark:text-[#C5A880]" />
                            <span>{pill}</span>
                          </span>
                        ))}
                      </div>

                      {/* Parecer Assinado de Ismael Dias */}
                      <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 text-[9.5px] sm:text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed font-sans mb-2.5">
                        <p className="line-clamp-2 sm:line-clamp-3 italic">
                          "{item.brokerNote}"
                        </p>
                      </div>
                    </div>

                    {/* Ações: Ver Apresentação + WhatsApp */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProductModal(prop)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-sans font-bold text-[10.5px] sm:text-[11px] transition text-center cursor-pointer truncate"
                      >
                        Apresentação
                      </button>

                      <button
                        type="button"
                        onClick={() => handleContactProperty(prop, item.highlightBadge, item.tagline)}
                        className="btn-primary-glow inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-white font-sans font-bold text-[10.5px] sm:text-[11px] shadow-xs active:scale-95 transition cursor-pointer shrink-0"
                        title="Conversar com Ismael no WhatsApp sobre este imóvel"
                      >
                        <WhatsAppIcon className="w-3 h-3 text-white" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ações Inferiores: Voltar ao Passo 7, Refazer, Ver Catálogo */}
            <div className="mt-1.5 pt-1.5 border-t border-stone-200/70 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[10.5px] sm:text-[11px] shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-[#1A3828] dark:hover:text-[#C5A880] font-sans font-medium cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao Passo 7</span>
                </button>
                <span className="text-stone-300 dark:text-stone-700">|</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-sans font-medium cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer Consulta</span>
                </button>
              </div>

              <Link
                to="/loja"
                className="inline-flex items-center gap-1 font-sans font-bold text-[#1A3828] dark:text-[#C5A880] hover:underline"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Ver Catálogo Completo (212 Imóveis)</span>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 10: FORMULÁRIO DE PROPRIETÁRIO
           ========================================================================= */}
        {step === 10 && (
          <div className="flex-1 flex flex-col justify-start sm:justify-center animate-in fade-in duration-200 overflow-y-auto overscroll-contain pr-1 max-h-[calc(100dvh-10rem)] sm:max-h-none touch-pan-y">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                  Avaliação & Venda Exclusiva
                </h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Conte com a assessoria direta de Ismael Dias e da Habittat House
                </p>
              </div>
            </div>

            <form onSubmit={handleSellerSubmit} className="space-y-2 sm:space-y-3 font-sans pb-3 sm:pb-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerForm.name}
                    onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:border-[#1A3828] dark:focus:border-[#C5A880] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={sellerForm.phone}
                    onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs focus:border-[#1A3828] dark:focus:border-[#C5A880] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                    Tipo do Imóvel
                  </label>
                  <select
                    value={sellerForm.propertyType}
                    onChange={(e) => setSellerForm({ ...sellerForm, propertyType: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs outline-hidden"
                  >
                    <option value="Casa em Condomínio">Casa em Condomínio</option>
                    <option value="Casa Fora de Condomínio">Casa Fora Cond.</option>
                    <option value="Apartamento / Cobertura">Apartamento / Cobertura</option>
                    <option value="Terreno / Lote">Terreno / Lote</option>
                    <option value="Sítio / Área Rural">Sítio / Área Rural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                    Bairro em Teresópolis
                  </label>
                  <input
                    type="text"
                    value={sellerForm.bairro}
                    onChange={(e) => setSellerForm({ ...sellerForm, bairro: e.target.value })}
                    placeholder="Ex: Albuquerque"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs outline-hidden"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-0.5">
                    Pretensão de Valor (R$)
                  </label>
                  <input
                    type="text"
                    value={sellerForm.estimatedPrice}
                    onChange={(e) => setSellerForm({ ...sellerForm, estimatedPrice: e.target.value })}
                    placeholder="Ex: 750.000"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:white cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="btn-primary-glow inline-flex items-center gap-1.5 py-2 px-4 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition cursor-pointer"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                  <span>Enviar para Avaliação Gratuita</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal Apresentação Completa do Imóvel (com fotos, especificações e contato) */}
      <ProductDetailModal
        product={selectedProductModal}
        isOpen={!!selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
      />
    </div>
  );
}
