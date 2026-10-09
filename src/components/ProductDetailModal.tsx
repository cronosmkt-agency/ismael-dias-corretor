import { useEffect } from "react";
import {
  X,
  ShieldCheck,
  Truck,
  Building2,
  Battery,
  Cpu,
  Camera,
  Smartphone,
  Gift,
  CheckCircle2,
  CreditCard,
  Zap,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

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
  whatsappNumber = "5521964639999",
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

  const isNovo = product.cat === "Novos" || product.badge.toLowerCase().includes("lacrado");

  const storageDisplay =
    product.storage || product.name.match(/\d+(gb|tb)/i)?.[0]?.toUpperCase() || "128GB";

  const handleWhatsApp = () => {
    const condText = isNovo
      ? "Novo Lacrado de Fábrica"
      : `Seminovo Grade A+${product.battery ? ` (Saúde da Bateria: ${product.battery})` : ""}`;

    const text = `Olá, equipe Terephones! Gostaria de pedir este iPhone que vi no site:

📱 *Aparelho:* ${product.name}
💰 *Valor à vista:* ${fmt(product.price)} (ou até 18x no cartão)
💾 *Capacidade:* ${storageDisplay}
✨ *Condição:* ${condText}

Gostaria de confirmar a disponibilidade para entrega hoje em Teresópolis!`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const defaultBoxItems = isNovo
    ? [
        "Aparelho iPhone Novo Lacrado de Fábrica",
        "Cabo original Apple USB-C / Lightning trançado",
        "Documentação oficial & chave de chip",
        "Brinde Terephones: Película 3D de alta proteção instalada",
        "Brinde Terephones: Capa protetora anti-impacto MagSafe",
      ]
    : [
        "Aparelho iPhone Seminovo Grade A+ Impecável",
        "Cabo de carregamento Turbo homologado",
        "Certificado de revisão técnica em 25+ itens",
        "Brinde Terephones: Película 3D instalada na hora",
        "Brinde Terephones: Capa protetora anti-impacto MagSafe",
      ];

  const boxList = product.boxItems && product.boxItems.length > 0 ? product.boxItems : defaultBoxItems;

  const hasBatteryInBadge =
    product.badge.toLowerCase().includes("bateria") || product.badge.toLowerCase().includes("bat");

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
        className="relative w-full max-w-[94vw] sm:max-w-[720px] my-auto product-modal-container overflow-hidden shadow-2xl z-10 max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar com badges e botão fechar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-200/60 dark:border-white/10 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-xs ${
                isNovo ? "product-badge-novo" : "product-badge-seminovo"
              }`}
            >
              {product.badge}
            </span>
            {product.battery && !hasBatteryInBadge && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Battery className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Bateria {product.battery}</span>
              </span>
            )}
            {product.quantity && product.quantity > 1 && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <span>📦 {product.quantity} un. em estoque</span>
              </span>
            )}
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 hidden xs:inline">
              {product.cat}
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
            {/* Foto do Aparelho */}
            <div
              className="relative rounded-2xl p-3 sm:p-5 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50"
              style={{
                minHeight: "140px",
              }}
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
                className="max-h-32 sm:max-h-48 md:max-h-52 w-auto object-contain transition-transform hover:scale-105 duration-300 relative z-1"
                style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.28))" }}
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
                <span>{storageDisplay}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Pronta Entrega em até 1h</span>
              </p>

              {/* Preço em Destaque */}
              <div className="mt-2.5 sm:mt-3 product-modal-price-box p-3 sm:p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="price-label text-[10px] sm:text-[11px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-sky-300">
                    Valor à vista no PIX
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    DESCONTO PIX
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gradient-blue mt-0.5">
                  {fmt(product.price)}
                </div>
                <div className="price-installments mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span>ou até 12x de {fmt(product.price / 12)} (até 18x no cartão)</span>
                </div>
              </div>

              {/* Trade-in notice */}
              <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>Aceitamos seu iPhone usado na troca (Trade-In)</span>
              </div>
            </div>
          </div>

          {/* Ficha Técnica / Especificações em Grid */}
          <div>
            <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-400" />
              Especificações Técnicas
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="product-modal-box p-2.5 sm:p-3">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  Armazenamento
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white">
                  {storageDisplay}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  Saúde da Bateria
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-emerald-600 dark:text-emerald-400">
                  {product.battery || (isNovo ? "100% (Lacrado)" : "88% a 100% (Original)")}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Garantia
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-blue-600 dark:text-sky-300 truncate">
                  {product.warranty || (isNovo ? "1 Ano Apple" : "90 Dias Terephones")}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                  Tela
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
                  {product.screen || "Super Retina XDR"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                  Câmeras
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
                  {product.camera || "Apple Pro / 4K"}
                </div>
              </div>

              <div className="product-modal-box p-2.5 sm:p-3">
                <div className="spec-label flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  Chip
                </div>
                <div className="spec-value text-xs sm:text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">
                  {product.chip || "Apple Bionic / Pro"}
                </div>
              </div>
            </div>
          </div>

          {/* O que vem na embalagem / Pedido */}
          <div className="product-modal-box p-3.5 sm:p-5">
            <h3 className="text-xs sm:text-sm uppercase tracking-wider font-extrabold text-slate-800 dark:text-white mb-2 sm:mb-2.5 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              O que você recebe no seu pedido:
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
            <div className="product-modal-box p-2.5 sm:p-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Entrega Express em até 1h em Teresópolis</span>
            </div>
            <div className="product-modal-box p-2.5 sm:p-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pague somente na entrega após testar</span>
            </div>
            <div className="product-modal-box p-2.5 sm:p-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Retirada presencial na SejaDelta</span>
            </div>
          </div>
        </div>

        {/* Footer Actions (Responsivo e com Botão de Chat no Site) */}
        <div className="product-modal-footer px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shrink-0 border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          {/* Mobile trust info */}
          <div className="flex sm:hidden items-center justify-between w-full text-[11px] text-slate-500 dark:text-slate-300">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Pague só na entrega</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
              Zap: <span className="font-extrabold text-slate-900 dark:text-sky-300">(21) 96463-9999</span>
            </div>
          </div>

          {/* Desktop trust info */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-300 shrink-0">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Pague após testar na mão</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
              WhatsApp: <span className="font-extrabold text-slate-900 dark:text-sky-300">(21) 96463-9999</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Botão Fechar / Voltar */}
            <button
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Fechar
            </button>

            {/* Botão Pedir no WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex-1 sm:flex-none btn-whatsapp px-5 sm:px-6 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 text-white whitespace-nowrap"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0 text-white" />
              <span>Pedir no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductDetailModal;

