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

  const toggleEssential = (key: string) => {
    setAnswers((prev) => {
      const curr = prev.essentials || [];
      if (curr.includes(key)) {
        return { ...prev, essentials: curr.filter((k) => k !== key) };
      }
      if (curr.length >= 2) {
        // Feedback tátil via Vibration API no celular
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

    const text = `Olá, Ismael Dias! 🏡
Concluí a curadoria no seu site e me interessei pela minha recomendação:

🏆 *Curadoria:* ${rankLabel}
✨ *Imóvel:* ${prop.name}
📍 *Localização:* ${prop.screen || "Teresópolis/RJ"}
🔢 *Código:* #${prop.sku || "Habittat"}
💰 *Valor:* ${fmt(prop.price)}
✨ *Destaque:* ${highlight || "Recomendado"}

Gostaria de agendar uma visita e tirar dúvidas!`;

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
        {step <= 7 && step !== 10 && (
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
            PASSO 1: OBJETIVO PRINCIPAL
           ========================================================================= */}
        {step === 1 && (
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
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#1A3828] dark:text-[#C5A880] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    Quero Comprar um Imóvel
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    Casas em condomínio, coberturas ou opções prontas
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, objective: "construir", propertyType: "terreno" }));
                  setStep(4);
                }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#1A3828] dark:text-[#C5A880] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    Terreno para Construir
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    Lotes residenciais com segurança e clube privativo
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, objective: "vender" }));
                  setStep(10);
                }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#1A3828] dark:text-[#C5A880] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    Quero Vender meu Imóvel
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    Avaliação técnica e divulgação para clientes qualificados
                  </p>
                </div>
              </button>

              <Link
                to="/lancamentos"
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#1A3828] dark:text-[#C5A880] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                    Lançamentos Angeleti
                  </h3>
                  <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                    Golden Green & Vale dos Pássaros (120x direto)
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 2: QUEM VAI MORAR
           ========================================================================= */}
        {step === 2 && (
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
            PASSO 3: TIPO DE IMÓVEL
           ========================================================================= */}
        {step === 3 && (
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
                Que tipologia você busca?
              </h2>
            </div>

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
                  <span>Aberto a Sugestões</span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Priorizar a melhor oportunidade dentro do investimento planejado.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 4: REGIÃO / BAIRROS
           ========================================================================= */}
        {step === 4 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setStep(answers.objective === "construir" ? 1 : 3)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-base sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Qual região de Teresópolis você prefere?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectSimple("region", "condominios", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Albuquerque & Golden Green
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Condomínios de alto padrão com clima ameno e lazer completo.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "serra_natureza", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Serra, Alto & Vargem Grande
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Natureza exuberante, montanhas, paz e silêncio.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "centro", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Várzea, Centro & Agriões
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Conveniência total: comércio nobre, gastronomia, colégios e hospitais.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "qualquer", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/90 dark:border-stone-800 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 bg-white dark:bg-stone-900/60 hover:bg-stone-50 dark:hover:bg-stone-900/90 transition text-left group cursor-pointer"
              >
                <h3 className="font-serif font-bold text-xs sm:text-sm md:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                  Sem Preferência / Toda Teresópolis
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Melhor custo-benefício e potencial de valorização na serra.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 5: FAIXA DE INVESTIMENTO
           ========================================================================= */}
        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200 overflow-y-auto sm:overflow-visible overscroll-contain pr-0.5">
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition cursor-pointer"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-sm sm:text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
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
        {step === 6 && (
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
            PASSO 7: FORMA DE PAGAMENTO
           ========================================================================= */}
        {step === 7 && (
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
                  onClick={() => handleSelectSimple("paymentMethod", opt.key, 8)}
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
            PASSO 8: RESULTADO DOS 3 IMÓVEIS (CURADORIA EXCLUSIVA)
           ========================================================================= */}
        {step === 8 && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300 overflow-hidden">
            <div className="text-center mb-1 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-serif font-bold tracking-wider uppercase bg-stone-100 dark:bg-stone-900 text-[#1A3828] dark:text-[#C5A880] border border-stone-200 dark:border-white/10 mb-0.5">
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                <span>Curadoria Exclusiva • Ismael Dias</span>
              </div>
              <h2 className="font-serif text-sm sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Os 3 Imóveis Selecionados para o seu Perfil
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Toque em qualquer opção para abrir a apresentação completa com fotos e detalhes:
              </p>
            </div>

            {/* NO MOBILE: UM ABAIXO DO OUTRO (FLEX-COL). NO DESKTOP: GRID 3 COLUNAS */}
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3 overflow-y-auto sm:overflow-visible pr-0.5 max-h-[calc(100dvh-13.5rem)] sm:max-h-none">
              {recommendedProperties.map((item, idx) => {
                const prop = item.property;
                return (
                  <div
                    key={prop.sku || idx}
                    onClick={() => setSelectedProductModal(prop)}
                    className="flex sm:flex-col items-center sm:items-stretch gap-3 sm:gap-0 p-2.5 sm:p-0 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/90 hover:border-[#1A3828] dark:hover:border-[#C5A880]/70 shadow-xs hover:shadow-md transition cursor-pointer active:scale-[0.98] group text-left overflow-hidden shrink-0"
                  >
                    {/* Foto miniatura no mobile, foto em cima no desktop */}
                    <div className="relative w-24 h-24 sm:w-full sm:aspect-[16/10] rounded-xl sm:rounded-none overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                      <img
                        src={prop.img || (prop.images && prop.images[0]) || "/favicon.png"}
                        alt={prop.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Selo de Sinergia Nobre */}
                      <div className="absolute top-1.5 left-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-black/65 backdrop-blur-md text-[#F5E6D3] border border-white/15 shadow-sm whitespace-nowrap">
                          <Sparkles className="w-2.5 h-2.5 text-[#C5A880] shrink-0" />
                          <span>{item.matchPercentage}% Sinergia</span>
                        </span>
                      </div>
                    </div>

                    {/* Detalhes do Imóvel */}
                    <div className="flex-1 min-w-0 sm:p-3 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1 text-[10px] text-stone-500 font-medium truncate font-sans">
                            <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" />
                            <span className="truncate">{prop.screen || prop.bairro || "Teresópolis/RJ"}</span>
                          </div>

                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-sans font-bold tracking-wider uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60 whitespace-nowrap shrink-0">
                            {idx === 0 ? "Curadoria Principal" : idx === 1 ? "Opção em Destaque" : "Excelente Opção"}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-tight group-hover:text-[#1A3828] dark:group-hover:text-[#C5A880] transition-colors">
                          {prop.name}
                        </h3>

                        <div className="mt-1 font-serif text-sm sm:text-base font-bold text-[#1A3828] dark:text-[#C5A880]">
                          {fmt(prop.price)}
                        </div>
                      </div>

                      <div className="mt-1 sm:mt-2 flex items-center justify-between pt-1 sm:pt-2 sm:border-t sm:border-stone-100 dark:sm:border-stone-800">
                        <span className="text-[10px] text-stone-500 truncate hidden sm:inline font-sans">
                          {prop.storage || prop.specs || "Disponível"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-[#1A3828] dark:text-[#C5A880] group-hover:translate-x-0.5 transition-transform ml-auto">
                          <span>Ver Apresentação</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ações Inferiores Discretas */}
            <div className="mt-2 pt-2 border-t border-stone-200/70 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="inline-flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-[#1A3828] dark:hover:text-[#C5A880] font-sans font-medium cursor-pointer transition-colors"
                  title="Refinar escolhas sem perder os dados preenchidos"
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
                <span>Ver Catálogo Completo</span>
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
                  className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-white cursor-pointer"
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
