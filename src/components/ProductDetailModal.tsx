import { useEffect } from "react";
import {
  X,
  ShieldCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  Trees,
  Compass,
  MapPin,
  CalendarCheck,
  Home,
  FileCheck2,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/data/storeData";

export interface ProductItem {
  name: string;
  price: number;
  cat: string;
  badge: string;
  img: string;
  specs?: string;
  storage?: string;
  condition?: string;
  warranty?: string;
  battery?: string;
  screen?: string;
  camera?: string;
  chip?: string;
  boxItems?: string[];
  features?: string[];
  quantity?: number;
  imeis?: string[];
}

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  whatsappNumber = WHATSAPP_NUMBER,
}: ProductDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const areaDisplay = product.storage || "Lote Residencial";

  const handleWhatsApp = () => {
    const text = `Olá, equipe Habittat House! Vi este imóvel no site e tenho interesse:

🏡 *Empreendimento:* ${product.name}
📍 *Localização:* ${product.screen || "Teresópolis/RJ"}
📐 *Metragem / Área:* ${areaDisplay}
💰 *Valor:* A partir de ${fmt(product.price)}
✨ *Destaque:* ${product.camera || product.badge}

Gostaria de agendar uma visita e receber a tabela de disponibilidade atualizada!`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const defaultBoxItems = [
    "Infraestrutura completa com água, luz e saneamento",
    "Segurança 24 horas com portaria e controle rigoroso de acesso",
    "Escritura definitiva com procedência jurídica garantida",
    "Assessoria completa de corretor credenciado (CRECI)",
    "Agendamento de visita VIP no local para conhecer a vista e topografia",
  ];

  const boxList = product.boxItems && product.boxItems.length > 0 ? product.boxItems : defaultBoxItems;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-[94vw] sm:max-w-[760px] my-auto product-modal-container overflow-hidden shadow-2xl z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar com badges e botão fechar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200/60 dark:border-white/10 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs product-badge-novo bg-blue-600/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
              {product.badge}
            </span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Trees className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{product.cat}</span>
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-3.5 sm:px-6 py-3.5 sm:py-5 space-y-4 sm:space-y-6">
          {/* Top Section: Imagem + Título + Preço */}
          <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-6 items-center">
            {/* Foto do Empreendimento */}
            <div
              className="relative rounded-2xl p-3 sm:p-5 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50"
              style={{ minHeight: "180px" }}
            >
              <div
                className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30"
                style={{
                  background: "radial-gradient(circle at center, rgba(56, 189, 248, 0.3), rgba(0,0,0,0) 70%)",
                }}
              />
              <img
                src={product.img}
                alt={product.name}
                className="max-h-44 sm:max-h-52 w-auto object-contain transition-transform hover:scale-105 duration-300 relative z-1 rounded-xl"
                style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.22))" }}
              />
            </div>

            {/* Informações Principais & Preço */}
            <div className="flex flex-col justify-center">
              <h2
                id="product-modal-title"
                className="text-lg sm:text-2xl font-black tracking-tight leading-tight text-slate-900 dark:text-white"
              >
                {product.name}
              </h2>

              <p className="text-xs sm:text-sm font-semibold mt-1 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{product.screen || "Teresópolis/RJ"}</span>
              </p>

              {/* Preço em Destaque */}
              <div className="mt-2.5 sm:mt-3 product-modal-price-box p-3 sm:p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="price-label text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-sky-300">
                    A partir de
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    DIRETO C/ INCORPORADORA
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-blue mt-0.5 text-blue-600 dark:text-sky-400">
                  {fmt(product.price)}
                </div>
                <div className="price-installments mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>{product.chip || "10% de entrada e saldo em até 120 parcelas"}</span>
                </div>
              </div>

              {/* Agendamento notice */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CalendarCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>Agende sua visita no local com corretor credenciado</span>
              </div>
            </div>
          </div>

          {/* Ficha Técnica / Características */}
          <div>
            <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-sky-400" />
              Ficha do Imóvel & Diferenciais
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  Área / Metragem
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white">
                  {areaDisplay}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Trees className="w-3.5 h-3.5 text-emerald-400" />
                  Topografia & Terreno
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-emerald-600 dark:text-emerald-400">
                  {product.battery || "Pronto para Construir"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Incorporação / Construtora
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-blue-600 dark:text-sky-300 truncate">
                  {product.warranty || "Angeleti Construtora"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  Localização
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
                  {product.screen || "Teresópolis - RJ"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Trees className="w-3.5 h-3.5 text-sky-400" />
                  Lazer & Vista
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
                  {product.camera || "Vista Deslumbrante"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                  Pagamento Facilitado
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
                  {product.chip || "10% + 120 parcelas"}
                </div>
              </div>
            </div>
          </div>

          {/* O que o empreendimento oferece */}
          <div className="product-modal-box p-3.5 sm:p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
            <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-800 dark:text-white mb-2 sm:mb-2.5 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Infraestrutura & Vantagens Inclusas:
            </h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-100 font-medium">
              {boxList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Compromissos de Segurança */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-200 font-semibold">
            <div className="product-modal-box p-2.5 sm:p-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-white/10">
              <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Angeleti Construtora: +20 anos de tradição</span>
            </div>
            <div className="product-modal-box p-2.5 sm:p-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Segurança jurídica com RGI e escritura</span>
            </div>
            <div className="product-modal-box p-2.5 sm:p-3 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-white/10">
              <CalendarCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Agende sua visita com corretor credenciado</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="product-modal-footer px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          {/* Trust info */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Habittat House Imobiliária</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
              WhatsApp: <span className="font-extrabold text-slate-900 dark:text-sky-300">{PHONE_DISPLAY}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Fechar
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex-1 sm:flex-none btn-whatsapp px-5 sm:px-6 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 text-white whitespace-nowrap bg-emerald-600 hover:bg-emerald-500"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0 text-white" />
              <span>Consultar / Agendar Visita</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;

