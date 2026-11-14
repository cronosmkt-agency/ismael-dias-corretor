import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Info } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { fmt } from "@/data/storeData";
import type { ProductItem } from "@/types/imovel";

interface PropertyCardProps {
  prod: ProductItem;
  onWhatsApp: (prod: ProductItem) => void;
}

export const PropertyCard = React.memo(function PropertyCard({
  prod,
  onWhatsApp,
}: PropertyCardProps) {
  const isSold =
    prod.badge === "VENDIDA" ||
    prod.condition === "VENDIDA" ||
    Boolean(prod.condition?.includes("VENDIDA"));
  const isReserved = prod.badge === "RESERVADO" || prod.condition === "RESERVADO";

  return (
    <div className="group relative rounded-2xl sm:rounded-3xl glass p-2.5 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl border border-slate-200/60 dark:border-slate-800/80 hover:-translate-y-1 overflow-hidden min-w-0">
      {/* Badge Superior com SKU */}
      <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
        <span
          className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 truncate max-w-[125px] sm:max-w-none ${
            isSold
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
              : isReserved
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/35"
              : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700/60"
          }`}
        >
          {prod.badge || (isSold ? "VENDIDA" : isReserved ? "RESERVADO" : "IMÓVEL")}
        </span>
        {prod.sku && (
          <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 whitespace-nowrap shrink-0">
            #{prod.sku}
          </span>
        )}
      </div>

      {/* Imagem do Imóvel com Metragem Sobreposta */}
      <Link
        to="/imovel/$sku"
        params={{ sku: String(prod.sku || "") }}
        className="relative aspect-4/3 w-full flex items-center justify-center mb-2 cursor-pointer overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 block group/img"
      >
        <img
          src={prod.img}
          alt={prod.name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
        />
        {prod.storage ? (
          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold bg-slate-900/85 text-white backdrop-blur-xs shadow-xs border border-white/10">
            {prod.storage}
          </span>
        ) : null}
      </Link>

      {/* Dados do Imóvel */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link
            to="/imovel/$sku"
            params={{ sku: String(prod.sku || "") }}
            className="font-serif font-bold text-xs sm:text-sm card-property-title text-slate-900 dark:text-stone-100 hover:text-[#1A3828] dark:hover:text-[#C5A880] transition block leading-snug"
            title={prod.name}
          >
            {prod.name}
          </Link>

          <p className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5 flex items-center gap-1 font-sans">
            <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" />
            <span>{prod.screen || `${prod.bairro || "Teresópolis"}, Teresópolis/RJ`}</span>
          </p>
        </div>

        <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-stone-100 dark:border-stone-800/60">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-serif font-bold text-[13px] sm:text-base text-[#1A3828] dark:text-[#C5A880] truncate">
              {fmt(prod.price)}
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
            {prod.chip || "Condições facilitadas"}
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1 sm:gap-1.5 pt-1.5 sm:pt-2">
        <button
          type="button"
          onClick={() => onWhatsApp(prod)}
          className="w-full py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[9.5px] min-[370px]:text-[10px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap min-w-0"
        >
          <WhatsAppIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
          <span className="truncate">WhatsApp</span>
        </button>

        <Link
          to="/imovel/$sku"
          params={{ sku: String(prod.sku || "") }}
          className="w-full py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[9.5px] min-[370px]:text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1 transition cursor-pointer whitespace-nowrap min-w-0"
        >
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>Ficha</span>
        </Link>
      </div>
    </div>
  );
});
