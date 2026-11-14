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
  CheckCircle2,
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
        return { ...prev, essentials: curr.filter((item) => item !== key) };
      }
      if (curr.length >= 2) {
        return { ...prev, essentials: [curr[1], key] };
      }
      return { ...prev, essentials: [...curr, key] };
    });
  };

  const handleReset = () => {
    try {
      sessionStorage.removeItem("wizard_step");
      sessionStorage.removeItem("wizard_answers");
    } catch (_) {}
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
    setSelectedProductModal(null);
  };

  const handleContactWhatsApp = (prop: ProductItem, highlight: string) => {
    trackWhatsAppClick(prop.sku || "", prop.name, prop.bairro || "Teresópolis", prop.price);

    const objLabel =
      answers.objective === "construir"
        ? "Construir / Terreno"
        : "Comprar Imóvel";

    const occupantsLabel =
      answers.occupants === "casal"
        ? "Casal / Solteiro"
        : answers.occupants === "familia_pequena"
        ? "Família com filhos"
        : answers.occupants === "familia_grande"
        ? "Família grande"
        : "Investimento / Renda";

    const regLabel =
      answers.region === "condominios"
        ? "Condomínios (Albuquerque/GG)"
        : answers.region === "serra_natureza"
        ? "Serra & Natureza (Vargem Grande/Alto)"
        : answers.region === "centro"
        ? "Centro & Conveniência"
        : answers.region === "expansao"
        ? "Regiões em Expansão"
        : "Melhor opção disponível";

    const payLabel =
      answers.paymentMethod === "financiamento"
        ? "Financiamento Bancário"
        : answers.paymentMethod === "a_vista"
        ? "À Vista / Recursos Próprios"
        : answers.paymentMethod === "parcelado"
        ? "Parcelado Direto com Incorporadora"
        : answers.paymentMethod === "permuta"
        ? "Estudo Permuta"
        : "Consultoria Financeira";

    const text = `Olá, Ismael Dias! 👋
Fiz o *Guia do Imóvel* no seu site e encontrei o match perfeito para mim!

📋 *Meu Perfil:*
• *Objetivo:* ${objLabel}
• *Perfil:* ${occupantsLabel}
• *Região:* ${regLabel}
• *Pagamento:* ${payLabel}

🎯 *Imóvel Selecionado:*
👉 *${prop.name}*
🔢 *Código:* #${prop.sku || "Habittat"}
📍 *Localização:* ${prop.screen || prop.bairro || "Teresópolis/RJ"}
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
      className="w-full max-w-3xl mx-auto flex flex-col justify-center items-center h-full max-h-full"
    >
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-7 flex flex-col justify-between max-h-[calc(100dvh-7.5rem)] sm:max-h-[calc(100dvh-6.5rem)] overflow-hidden transition-all duration-300">
        
        {/* Barra de Progresso Superior */}
        {step <= 7 && step !== 10 && (
          <div className="mb-3 sm:mb-4 shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 dark:bg-sky-950/70 text-blue-600 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800">
                <Sparkles className="w-3 h-3" />
                <span>Guia do Imóvel Perfeito</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Passo {step} de {totalSteps}
              </span>
            </div>

            <div className="w-full h-1.5 sm:h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 transition-all duration-300 ease-out"
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
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Qual é o seu objetivo hoje?
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecione uma das opções para iniciar:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSelectSimple("objective", "comprar", 2)}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-sky-950/30 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-sky-900/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    Quero Comprar um Imóvel
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Casas, apartamentos ou condomínios prontos
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, objective: "construir", propertyType: "terreno" }));
                  setStep(4);
                }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Terreno para Construir
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Lotes residenciais planos com segurança
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, objective: "vender" }));
                  setStep(10);
                }}
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Quero Vender meu Imóvel
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    Avaliação gratuita e anúncio profissional
                  </p>
                </div>
              </button>

              <Link
                to="/lancamentos"
                className="flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Lançamentos Angeleti
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
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
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Quem vai morar no imóvel?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "casal", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  👫 Só eu ou Casal (sem filhos)
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  1 a 2 quartos, apartamentos práticos ou casas aconchegantes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "familia_pequena", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  👨‍👩‍👧 Família com filhos
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  3 quartos, quintal, condomínio seguro e lazer infantil.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "familia_grande", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  👨‍👩‍👧‍👦 Família grande / Amigos
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  4+ quartos, suítes independentes e espaço gourmet amplo.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "investimento", 3)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  💼 Investimento / Renda
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Foco em liquidez, locação por temporada ou valorização.
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
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Que tipo de imóvel você busca?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "condominio", 4)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Casa em Condomínio Fechado</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Segurança 24h, portaria, lazer e privacidade.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "apartamento", 4)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Apartamento ou Cobertura</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Praticidade urbana, próximo ao centro ou com vista panorâmica.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "casa_avulsa", 4)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <Home className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Casa ou Sítio Fora de Condomínio</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sem taxa de condomínio, terrenos amplos e muita liberdade.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "qualquer", 4)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <Compass className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Estou Aberto a Opções</span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Quero ver o melhor imóvel dentro do meu orçamento.
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
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Qual região de Teresópolis você prefere?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => handleSelectSimple("region", "condominios", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  🏆 Albuquerque & Golden Green
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Condomínios de alto padrão com clima ameno e lazer completo.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "serra_natureza", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  🌿 Serra, Alto & Vargem Grande
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Natureza exuberante, montanhas e silêncio.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "centro", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  🏙️ Centro, Várzea & Agriões
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Conveniência total: comércio, bancos, colégios e hospitais.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "qualquer", 5)}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  🗺️ Sem Preferência / Toda Teresópolis
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Melhor custo-benefício em qualquer localização.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 5: FAIXA DE INVESTIMENTO
           ========================================================================= */}
        {step === 5 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Qual a sua faixa de investimento?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-1.5">
              {[
                { key: "ate_300k", label: "Até R$ 300 mil", desc: "Oportunidades, terrenos e aptos compactos" },
                { key: "300k_600k", label: "R$ 300 mil a R$ 600 mil", desc: "Primeiro imóvel na serra e ótimo custo-benefício" },
                { key: "600k_1m", label: "R$ 600 mil a R$ 1 Milhão", desc: "Casas em condomínio e conforto familiar" },
                { key: "1m_2m", label: "R$ 1 Milhão a R$ 2 Milhões", desc: "Alto padrão em Albuquerque e lazer privativo" },
                { key: "acima_2m", label: "Acima de R$ 2 Milhões", desc: "Mansões exclusivas e alto padrão nobre", span: true },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectSimple("priceRange", opt.key, 6)}
                  className={`flex items-center justify-between p-3 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/40 transition text-left group ${
                    opt.span ? "sm:col-span-2" : ""
                  }`}
                >
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                      {opt.label}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
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
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  O que é ESSENCIAL?
                </h2>
              </div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-sky-400">
                {(answers.essentials || []).length}/2 selecionados
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-1.5">
              {[
                { key: "seguranca", label: "Segurança 24h", icon: ShieldCheck },
                { key: "natureza", label: "Área Verde & Vista", icon: Trees },
                { key: "lazer", label: "Piscina & Gourmet", icon: Waves },
                { key: "sossego", label: "Sossego & Silêncio", icon: Moon },
                { key: "alto_padrao", label: "Alto Padrão / Fino", icon: Sparkles },
                { key: "acesso", label: "Fácil Acesso", icon: Compass },
              ].map((item) => {
                const isSelected = (answers.essentials || []).includes(item.key);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleEssential(item.key)}
                    className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border-2 transition text-left ${
                      isSelected
                        ? "border-blue-600 dark:border-sky-500 bg-blue-50/90 dark:bg-sky-950/50 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
                        {item.label}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(7)}
                className="btn-primary-glow inline-flex items-center gap-1.5 py-2 px-5 rounded-full font-bold text-xs text-white shadow-md active:scale-95 transition"
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
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Como prefere pagar?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-1.5">
              {[
                { key: "financiamento", label: "Financiamento Bancário", desc: "Caixa, Itaú, Bradesco ou Santander com assessoria Ismael Dias" },
                { key: "a_vista", label: "Recursos Próprios / À Vista", desc: "Estuda condição ou desconto especial" },
                { key: "parcelado", label: "Parcelado Direto (sem banco)", desc: "Entrada facilitada + parcelamento direto com incorporadora" },
                { key: "permuta", label: "Estudo Permuta / Troca", desc: "Avaliar outro imóvel ou veículo como parte de pagamento" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectSimple("paymentMethod", opt.key, 8)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/40 transition group"
                >
                  <h3 className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                    {opt.label}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 8: RESULTADO DOS 3 IMÓVEIS (MATCH PERFEITO)
           ========================================================================= */}
        {step === 8 && (
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300 overflow-hidden">
            <div className="text-center mb-1 shrink-0">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Os 3 Melhores Imóveis para o seu Perfil</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Toque em qualquer opção para abrir a ficha completa com fotos e detalhes:
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
                    className="flex sm:flex-col items-center sm:items-stretch gap-2.5 sm:gap-0 p-2 sm:p-0 rounded-xl sm:rounded-2xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 shadow-xs hover:shadow-md transition cursor-pointer active:scale-[0.98] group text-left overflow-hidden shrink-0"
                  >
                    {/* Foto miniatura no mobile, foto em cima no desktop */}
                    <div className="relative w-20 h-20 sm:w-full sm:aspect-[16/10] rounded-lg sm:rounded-none overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                      <img
                        src={prop.img || (prop.images && prop.images[0]) || "/favicon.png"}
                        alt={prop.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black bg-blue-600 text-white shadow-xs">
                          {item.highlightBadge.split("•")[0]}
                        </span>
                      </div>
                    </div>

                    {/* Detalhes do Imóvel */}
                    <div className="flex-1 min-w-0 sm:p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mb-0.5">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{prop.screen || prop.bairro || "Teresópolis/RJ"}</span>
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-blue-600 transition">
                          {prop.name}
                        </h3>

                        <div className="mt-1 text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                          {fmt(prop.price)}
                        </div>
                      </div>

                      <div className="mt-1 sm:mt-2.5 flex items-center justify-between sm:pt-2 sm:border-t sm:border-slate-100 dark:sm:border-slate-800">
                        <span className="text-[10px] text-slate-500 truncate hidden sm:inline">
                          {prop.storage || prop.specs || "Disponível"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform ml-auto">
                          <span>Ver Ficha Completa</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ações Inferiores Discretas */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Refazer</span>
              </button>

              <Link
                to="/loja"
                className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Catálogo Completo</span>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 10: FORMULÁRIO DE PROPRIETÁRIO
           ========================================================================= */}
        {step === 10 && (
          <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Anuncie seu Imóvel com Ismael Dias
              </h2>
            </div>

            <form onSubmit={handleSellerSubmit} className="space-y-2 sm:space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerForm.name}
                    onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={sellerForm.phone}
                    onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-1 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Tipo
                  </label>
                  <select
                    value={sellerForm.propertyType}
                    onChange={(e) => setSellerForm({ ...sellerForm, propertyType: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-hidden"
                  >
                    <option value="Casa em Condomínio">Casa em Condomínio</option>
                    <option value="Casa Fora de Condomínio">Casa Fora Cond.</option>
                    <option value="Apartamento / Cobertura">Apartamento</option>
                    <option value="Terreno / Lote">Terreno / Lote</option>
                    <option value="Sítio / Área Rural">Sítio / Rural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={sellerForm.bairro}
                    onChange={(e) => setSellerForm({ ...sellerForm, bairro: e.target.value })}
                    placeholder="Ex: Albuquerque"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-hidden"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                    Pretensão (R$)
                  </label>
                  <input
                    type="text"
                    value={sellerForm.estimatedPrice}
                    onChange={(e) => setSellerForm({ ...sellerForm, estimatedPrice: e.target.value })}
                    placeholder="Ex: 750.000"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95 transition"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Enviar para Avaliação Gratuita</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal Ficha Completa do Imóvel (com fotos, especificações e contato) */}
      <ProductDetailModal
        product={selectedProductModal}
        isOpen={!!selectedProductModal}
        onClose={() => setSelectedProductModal(null)}
      />
    </div>
  );
}
