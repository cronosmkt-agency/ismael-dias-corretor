import { useEffect, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Hash,
  AlignLeft,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP_NUMBER, PHONE_DISPLAY } from "@/data/storeData";

export interface ProductItem {
  name: string;
  price: number;
  cat: string;
  badge: string;
  img: string;
  images?: string[];
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
  sku?: string;
  description?: string;
  bairro?: string;
  url?: string;
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
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [product]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
      if (e.key === "ArrowRight") {
        if (product?.images && product.images.length > 0) {
          setActiveImgIndex((prev) => (prev < product.images!.length - 1 ? prev + 1 : prev));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, product]);

  if (!isOpen || !product) return null;

  const isSold = product.badge === "VENDIDA" || product.condition?.includes("VENDIDA");
  const areaDisplay = product.storage || "Lote Residencial";
  const imagesList = product.images && product.images.length > 0 ? product.images : [product.img];
  const currentImg = imagesList[activeImgIndex] || product.img;

  const handleWhatsApp = () => {
    let text = "";
    if (isSold) {
      text = `Olá, Ismael Dias! Vi no seu catálogo que o imóvel *${product.name}* (Cód. #${product.sku || ""}) foi vendido.

Gostaria de saber se você tem outras opções semelhantes disponíveis na mesma região (${product.screen || "Teresópolis"})!`;
    } else {
      text = `Olá, Ismael Dias! Vi este imóvel no seu site e tenho interesse:

🏡 *Imóvel:* ${product.name}
🔢 *Código:* #${product.sku || "Habittat"}
📍 *Localização:* ${product.screen || "Teresópolis/RJ"}
📐 *Metragem / Área:* ${areaDisplay}
💰 *Valor:* ${fmt(product.price)}
✨ *Destaque:* ${product.camera || product.badge}

Gostaria de agendar uma visita guiada com você e receber mais detalhes!`;
    }

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const defaultBoxItems = [
    "Infraestrutura completa com água, luz e saneamento",
    "Segurança e tranquilidade na serra fluminense",
    "Escritura e procedência jurídica garantida",
    "Assessoria completa com o corretor Ismael Dias na Habittat House",
    "Agendamento de visita VIP no local para conhecer todos os detalhes",
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
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs border ${
                isSold
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  : "bg-blue-600/10 text-blue-600 dark:text-sky-400 border-blue-500/20"
              }`}
            >
              {product.badge}
            </span>
            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Trees className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{product.cat}</span>
            </span>
            {product.sku && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-0.5">
                <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{product.sku}</span>
              </span>
            )}
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
        <div className="overflow-y-auto overflow-x-hidden px-3.5 sm:px-6 py-3.5 sm:py-5 space-y-4 sm:space-y-6 w-full min-w-0">
          {/* Top Section: Imagem + Título + Preço */}
          <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-6 items-center w-full min-w-0">
            {/* Foto do Empreendimento com Galeria */}
            <div className="flex flex-col gap-2 w-full min-w-0 overflow-hidden">
              <div
                className="relative rounded-2xl p-2 sm:p-3 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-white/10 bg-slate-100/70 dark:bg-slate-900/50 w-full"
                style={{ minHeight: "200px", maxHeight: "240px" }}
              >
                <img
                  src={currentImg}
                  alt={product.name}
                  className="w-full h-48 sm:h-52 object-cover transition-transform duration-300 relative z-1 rounded-xl"
                />

                {/* Setas de Navegação se tiver mais de 1 foto */}
                {imagesList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer backdrop-blur-xs"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer backdrop-blur-xs"
                      aria-label="Próxima foto"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs">
                      {activeImgIndex + 1} / {imagesList.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails Strip */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full min-w-0">
                  {imagesList.slice(0, 8).map((imgUrl, i) => (
                    <button
                      key={imgUrl + i}
                      type="button"
                      onClick={() => setActiveImgIndex(i)}
                      className={`relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                        activeImgIndex === i
                          ? "border-blue-600 dark:border-sky-400 scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
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
                  <span>{product.chip || "15% de entrada e saldo em até 120 parcelas"}</span>
                </div>
              </div>

              {/* Agendamento notice */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CalendarCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>Agende sua visita no local com Ismael Dias</span>
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
              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col justify-between">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Área / Metragem</span>
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-1 text-slate-900 dark:text-white leading-snug break-words">
                  {areaDisplay}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col justify-between">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Trees className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Topografia & Terreno</span>
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-1 text-emerald-600 dark:text-emerald-400 leading-snug break-words">
                  {product.battery || "Pronto para Construir"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col justify-between">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Incorporação / Construtora</span>
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-1 text-blue-600 dark:text-sky-300 leading-snug break-words">
                  {product.warranty || "Angeleti Construtora"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col justify-between">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Localização</span>
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-1 text-slate-900 dark:text-white leading-snug break-words">
                  {product.screen || "Teresópolis - RJ"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col justify-between">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Trees className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Lazer & Vista</span>
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-1 text-slate-900 dark:text-white leading-snug break-words">
                  {product.camera || "Vista Deslumbrante"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col justify-between">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Pagamento Facilitado</span>
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-1 text-slate-900 dark:text-white leading-snug break-words">
                  {product.chip || "15% + 120 parcelas"}
                </div>
              </div>
            </div>
          </div>

          {/* Descrição Completa do Imóvel se disponível */}
          {product.description ? (
            <div className="product-modal-box p-3.5 sm:p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/10">
              <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-800 dark:text-white mb-2 sm:mb-2.5 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-sky-400" />
                Descrição Completa:
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal max-h-56 overflow-y-auto pr-1">
                {product.description}
              </p>
            </div>
          ) : null}

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
              <span>Agende sua visita diretamente com Ismael Dias</span>
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end min-w-0">
            <button
              onClick={onClose}
              className="px-3.5 py-2 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center shrink-0"
            >
              Fechar
            </button>

            <button
              onClick={handleWhatsApp}
              className={`flex-1 sm:flex-none btn-whatsapp px-3 sm:px-6 py-2 sm:py-2 rounded-full text-[11px] sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-md transition-all active:scale-95 text-white whitespace-nowrap min-w-0 ${
                isSold ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0 text-white" />
              <span className="truncate">{isSold ? "Opções Semelhantes" : "Consultar / Agendar Visita"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailModal;

