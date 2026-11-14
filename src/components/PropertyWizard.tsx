import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Home,
  ShieldCheck,
  Building2,
  Trees,
  KeyRound,
  DollarSign,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  RotateCcw,
  Phone,
  Waves,
  Moon,
  Send,
  Compass,
  SlidersHorizontal,
  ChevronRight,
  User,
  CheckCircle2,
} from "lucide-react";
import type { ProductItem } from "@/types/imovel";
import { fmt, WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/data/storeData";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { scoreProperties, type WizardAnswers, type ScoredProperty } from "@/lib/wizardScoring";
import { trackWhatsAppClick } from "@/services/analyticsService";

interface PropertyWizardProps {
  allProperties: ProductItem[];
  onBrowseAll?: () => void;
}

export function PropertyWizard({ allProperties, onBrowseAll }: PropertyWizardProps) {
  // Estado das respostas
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<WizardAnswers>({
    objective: undefined,
    occupants: undefined,
    propertyType: undefined,
    region: undefined,
    priceRange: undefined,
    essentials: [],
    paymentMethod: undefined,
  });

  // Estado do formulário de captação de vendedores
  const [sellerForm, setSellerForm] = useState({
    name: "",
    phone: "",
    propertyType: "Casa em Condomínio",
    bairro: "",
    estimatedPrice: "",
    details: "",
  });
  const [sellerSubmitted, setSellerSubmitted] = useState(false);

  // Referência para rolar suavemente ao topo do card ao trocar de passo
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToWizard = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Motor de Recomendação calculado
  const recommendedProperties: ScoredProperty[] = useMemo(() => {
    if (step < 8) return [];
    return scoreProperties(allProperties, answers);
  }, [allProperties, answers, step]);

  // Manipuladores de respostas simples
  const handleSelectSimple = (key: keyof WizardAnswers, value: any, nextStep: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep(nextStep);
    scrollToWizard();
  };

  // Manipulador para P6 (seleção múltipla, max 2)
  const toggleEssential = (key: string) => {
    setAnswers((prev) => {
      const curr = prev.essentials || [];
      if (curr.includes(key)) {
        return { ...prev, essentials: curr.filter((item) => item !== key) };
      }
      if (curr.length >= 2) {
        // Substitui a mais antiga se já tiver 2 selecionadas
        return { ...prev, essentials: [curr[1], key] };
      }
      return { ...prev, essentials: [...curr, key] };
    });
  };

  // Resetar o Wizard
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
    setSellerSubmitted(false);
    scrollToWizard();
  };

  // Gerar mensagem do WhatsApp para o Imóvel escolhido
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
        ? "Família grande (espaço amplo)"
        : "Investimento / Renda";

    const regLabel =
      answers.region === "condominios"
        ? "Condomínios de Alto Padrão (Albuquerque/GG)"
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
        ? "À Vista / Proposta"
        : answers.paymentMethod === "parcelado"
        ? "Parcelado Direto com Incorporadora"
        : answers.paymentMethod === "permuta"
        ? "Estudo Permuta"
        : "Consultoria Financeira";

    const text = `Olá, Ismael Dias! 👋
Fiz o *Guia do Imóvel* no seu site e encontrei o match perfeito para mim!

📋 *Meu Perfil de Busca:*
• *Objetivo:* ${objLabel}
• *Perfil:* ${occupantsLabel}
• *Região Preferida:* ${regLabel}
• *Forma de Pagamento:* ${payLabel}

🎯 *Imóvel Selecionado no Guia:*
👉 *${prop.name}*
🔢 *Código:* #${prop.sku || "Habittat"}
📍 *Localização:* ${prop.screen || prop.bairro || "Teresópolis/RJ"}
💰 *Valor:* ${fmt(prop.price)}
✨ *Destaque:* ${highlight || "Recomendado para o meu perfil"}

Gostaria de tirar algumas dúvidas e agendar uma visita com você no local!`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Disparo do formulário de captação de vendedores
  const handleSellerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerForm.name || !sellerForm.phone) return;

    setSellerSubmitted(true);

    const text = `Olá, Ismael Dias! 🔑
Gostaria de avaliar e anunciar meu imóvel com você e a Habittat House:

👤 *Proprietário:* ${sellerForm.name}
📞 *WhatsApp / Contato:* ${sellerForm.phone}
🏡 *Tipo do Imóvel:* ${sellerForm.propertyType}
📍 *Bairro em Teresópolis:* ${sellerForm.bairro || "A combinar"}
💰 *Valor Estimado:* ${sellerForm.estimatedPrice || "Gostaria de uma avaliação"}
📝 *Detalhes adicionais:* ${sellerForm.details || "Nenhum detalhe informado"}

Podemos conversar sobre a avaliação comercial e divulgação?`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Renderizador da Barra de Progresso
  const totalSteps = 7;
  const progressPercent = Math.min(100, Math.round(((step - 1) / totalSteps) * 100));

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto py-2 sm:py-6 px-3 sm:px-4">
      {/* Container Principal do Card Interativo */}
      <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-5 sm:p-8 lg:p-10 transition-all duration-300">
        
        {/* Header do Guia com Progresso */}
        {step <= 7 && step !== 10 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-sky-950/70 text-blue-600 dark:text-sky-400 border border-blue-200/80 dark:border-sky-800">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consultoria Guiada Ismael Dias</span>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Passo {step} de {totalSteps} ({progressPercent}%)
              </span>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 1: OBJETIVO PRINCIPAL
           ========================================================================= */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Qual é o seu objetivo principal hoje?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Escolha uma das opções abaixo para iniciarmos sua consultoria personalizada:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSelectSimple("objective", "comprar", 2)}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-sky-950/30 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-sky-900/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    Quero Comprar um Imóvel
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Casas, apartamentos ou condomínios fechados prontos
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, objective: "construir", propertyType: "terreno" }));
                  setStep(4); // Pula direto para a região de terrenos
                  scrollToWizard();
                }}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Trees className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Terreno para Construir
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Lotes em condomínio fechado com lazer e topografia plana
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, objective: "vender" }));
                  setStep(10); // Rota especial: formulário de captação
                  scrollToWizard();
                }}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Quero Vender meu Imóvel
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Avaliação comercial gratuita e anúncio profissional com Ismael Dias
                  </p>
                </div>
              </button>

              <Link
                to="/lancamentos"
                className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Lançamentos Angeleti
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Golden Green e Vale dos Pássaros (15% entrada + 120x)
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
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Perfil Familiar
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Quem vai morar no imóvel?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Isso nos ajuda a calcular a metragem e a quantidade ideal de quartos:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "casal", 3)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  👫 Só eu ou Casal (sem filhos)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  1 a 2 quartos, apartamentos práticos, coberturas ou casas aconchegantes.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "familia_pequena", 3)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  👨‍👩‍👧 Família com filhos
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  3 quartos, quintal amplo, condomínio seguro e área de lazer infantil.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "familia_grande", 3)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  👨‍👩‍👧‍👦 Família grande / Amigos
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  4 ou mais quartos, suítes independentes, espaço gourmet e piscina privativa.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("occupants", "investimento", 3)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  💼 Investimento / Renda
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Foco em liquidez, locação por temporada ou grande potencial de valorização.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 3: TIPO DE IMÓVEL
           ========================================================================= */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Categoria Desejada
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Que tipo de imóvel você procura?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Selecione o formato que mais combina com a sua rotina:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "condominio", 4)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Casa em Condomínio Fechado</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Segurança 24 horas, portaria, privacidade e clube de lazer na serra.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "apartamento", 4)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Apartamento ou Cobertura</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Praticidade urbana, próximo ao comércio ou com vista panorâmica.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "casa_avulsa", 4)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <Home className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Casa ou Sítio Fora de Condomínio</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sem taxa condominial, terrenos espaçosos e total liberdade.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("propertyType", "qualquer", 4)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600">
                  <Compass className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0" />
                  <span>Estou Aberto a Opções</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(answers.objective === "construir" ? 1 : 3)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Localização em Teresópolis
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Qual região de Teresópolis você prefere?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Cada bairro tem um clima e características próprias:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => handleSelectSimple("region", "condominios", 5)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  🏆 Albuquerque & Vale dos Pássaros
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Região nobre com os melhores condomínios fechados e clima ameno.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "serra_natureza", 5)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  🌿 Serra, Alto & Vargem Grande
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Contato direto com a natureza, montanhas, ar puro e silêncio.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "centro", 5)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  🏙️ Centro, Várzea & Agriões
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Conveniência total: faça tudo a pé, perto de bancos, colégios e hospitais.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSimple("region", "qualquer", 5)}
                className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group"
              >
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                  🗺️ Sem Preferência / Toda Teresópolis
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Busque pela melhor relação custo-benefício em qualquer localidade.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 5: FAIXA DE INVESTIMENTO
           ========================================================================= */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Orçamento Planejado
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Qual a sua faixa de investimento ideal?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Eliminamos o que foge do seu orçamento para focar nas melhores escolhas:
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3">
              {[
                { key: "ate_300k", label: "Até R$ 300 mil", desc: "Oportunidades de entrada, terrenos e apartamentos compactos" },
                { key: "300k_600k", label: "R$ 300 mil a R$ 600 mil", desc: "Primeiro imóvel na serra, excelente custo-benefício e condomínios acessíveis" },
                { key: "600k_1m", label: "R$ 600 mil a R$ 1 Milhão", desc: "Casas em condomínio estruturado, conforto familiar e lazer privativo" },
                { key: "1m_2m", label: "R$ 1 Milhão a R$ 2 Milhões", desc: "Alto padrão em Albuquerque, residências modernas e segurança 24h" },
                { key: "acima_2m", label: "Acima de R$ 2 Milhões", desc: "Mansões exclusivas, propriedades cinematográficas e áreas nobres" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectSimple("priceRange", opt.key, 6)}
                  className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition text-left group"
                >
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      {opt.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 6: O QUE É ESSENCIAL (ATÉ 2 ESCOLHAS)
           ========================================================================= */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Estilo de Vida & Lazer
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              O que é ESSENCIAL para você?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Escolha <strong>até 2 opções</strong> que não podem faltar no seu imóvel:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "seguranca", label: "Segurança 24h & Portaria", icon: ShieldCheck, desc: "Condomínio com controle de acesso rigoroso" },
                { key: "natureza", label: "Natureza & Vista das Montanhas", icon: Trees, desc: "Muito verde, ar puro e paisagens deslumbrantes" },
                { key: "lazer", label: "Piscina & Área Gourmet", icon: Waves, desc: "Espaço para churrasco, piscina e convívio familiar" },
                { key: "sossego", label: "Sossego Absoluto & Silêncio", icon: Moon, desc: "Refúgio tranquilo sem barulho ou trânsito" },
                { key: "alto_padrao", label: "Alto Padrão & Fino Acabamento", icon: Sparkles, desc: "Arquitetura contemporânea e materiais nobres" },
                { key: "acesso", label: "Fácil Acesso & Próximo ao Centro", icon: Compass, desc: "Logística rápida para o dia a dia e serviços" },
              ].map((item) => {
                const isSelected = (answers.essentials || []).includes(item.key);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleEssential(item.key)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition text-left ${
                      isSelected
                        ? "border-blue-600 dark:border-sky-500 bg-blue-50/80 dark:bg-sky-950/40 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {item.label}
                        </h4>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Botão de Avançar do Passo 6 */}
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                {(answers.essentials || []).length} de 2 selecionados
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep(7);
                  scrollToWizard();
                }}
                className="btn-primary-glow inline-flex items-center gap-2 py-3 px-6 rounded-full font-bold text-sm text-white shadow-lg active:scale-95 transition"
              >
                <span>Próximo Passo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 7: FORMA DE PAGAMENTO
           ========================================================================= */}
        {step === 7 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400">
                Condições de Pagamento
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Como você prefere realizar o pagamento?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              O corretor Ismael Dias assessora toda a aprovação de crédito e negociação:
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {[
                { key: "financiamento", label: "Financiamento Bancário", desc: "Utilizar Caixa, Itaú, Bradesco ou Santander com as melhores taxas" },
                { key: "a_vista", label: "Recursos Próprios / À Vista", desc: "Estuda desconto especial para pagamento com recursos disponíveis" },
                { key: "parcelado", label: "Parcelado Direto com Incorporadora", desc: "Opções como entrada de 15% e saldo em até 120x sem banco" },
                { key: "permuta", label: "Estudo Permuta / Troca", desc: "Avaliar inclusão de outro imóvel ou veículo como parte do pagamento" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectSimple("paymentMethod", opt.key, 8)}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left bg-slate-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/40 transition group"
                >
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
                    {opt.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 8: TELA FINAL DE RESULTADO (TOP 3 MATCHES)
           ========================================================================= */}
        {step === 8 && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Match Calculado com Sucesso!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Encontramos os 3 imóveis perfeitos para o seu perfil em Teresópolis!
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Clique no imóvel desejado para receber o atendimento VIP imediato com Ismael Dias:
              </p>
            </div>

            {/* Grid dos Top 3 Imóveis Recomendados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {recommendedProperties.map((item, idx) => {
                const prop = item.property;
                return (
                  <div
                    key={prop.sku || idx}
                    className="flex flex-col rounded-2xl overflow-hidden border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 group"
                  >
                    {/* Imagem com Badge */}
                    <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={prop.img || (prop.images && prop.images[0]) || "/favicon.png"}
                        alt={prop.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-600 text-white shadow-md">
                          {item.highlightBadge.split("•")[0]}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                          #{prop.sku}
                        </span>
                      </div>
                    </div>

                    {/* Informações do Imóvel */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{prop.screen || prop.bairro || "Teresópolis/RJ"}</span>
                        </div>

                        {/* Título com 2 linhas padronizadas */}
                        <h3
                          className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 transition"
                          title={prop.name}
                        >
                          {prop.name}
                        </h3>

                        {/* Preço em Destaque */}
                        <div className="mt-2.5 text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {fmt(prop.price)}
                        </div>

                        {/* Metragem e Especificações */}
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {prop.storage || prop.specs || "Excelente oportunidade"}
                        </div>

                        {/* Motivos do Match */}
                        {item.matchReasons.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                            {item.matchReasons.map((reason, rIdx) => (
                              <span
                                key={rIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>{reason}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação do Card */}
                      <div className="mt-4 pt-3 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleContactWhatsApp(prop, item.highlightBadge)}
                          className="btn-primary-glow w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md active:scale-95 transition"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                          <span>Quero este Imóvel</span>
                        </button>

                        <Link
                          to="/imovel/$sku"
                          params={{ sku: prop.sku || "" }}
                          className="w-full text-center py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                        >
                          Ver Todas as Fotos & Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ações Inferiores: Refazer ou Navegar no Catálogo */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refazer o Guia com outras preferências</span>
              </button>

              <Link
                to="/loja"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 dark:text-sky-400 hover:underline"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Ver todos os 200 imóveis do catálogo completo</span>
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASSO 10: FORMULÁRIO DE CAPTAÇÃO DE PROPRIETÁRIOS (QUERO VENDER)
           ========================================================================= */}
        {step === 10 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Captação de Imóveis • Habittat House
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Anuncie seu Imóvel com Ismael Dias
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Avaliação de mercado gratuita, divulgação com fotos profissionais e atendimento exclusivo para proprietários.
            </p>

            <form onSubmit={handleSellerSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerForm.name}
                    onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Seu WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={sellerForm.phone}
                    onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipo do Imóvel
                  </label>
                  <select
                    value={sellerForm.propertyType}
                    onChange={(e) => setSellerForm({ ...sellerForm, propertyType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                  >
                    <option value="Casa em Condomínio">Casa em Condomínio</option>
                    <option value="Casa Fora de Condomínio">Casa Fora de Condomínio</option>
                    <option value="Apartamento / Cobertura">Apartamento / Cobertura</option>
                    <option value="Terreno / Lote">Terreno / Lote</option>
                    <option value="Sítio / Área Rural">Sítio / Área Rural</option>
                    <option value="Imóvel Comercial">Imóvel Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bairro em Teresópolis
                  </label>
                  <input
                    type="text"
                    value={sellerForm.bairro}
                    onChange={(e) => setSellerForm({ ...sellerForm, bairro: e.target.value })}
                    placeholder="Ex: Albuquerque, Alto, Várzea"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pretensão de Valor (R$)
                  </label>
                  <input
                    type="text"
                    value={sellerForm.estimatedPrice}
                    onChange={(e) => setSellerForm({ ...sellerForm, estimatedPrice: e.target.value })}
                    placeholder="Ex: 750.000 ou A avaliar"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Observações ou Detalhes do Imóvel
                </label>
                <textarea
                  rows={2}
                  value={sellerForm.details}
                  onChange={(e) => setSellerForm({ ...sellerForm, details: e.target.value })}
                  placeholder="Ex: Casa reformada recentemente, 3 quartos sendo 2 suítes, vista para a serra..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Voltar ao início
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg active:scale-95 transition"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Solicitar Avaliação Gratuita no WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
