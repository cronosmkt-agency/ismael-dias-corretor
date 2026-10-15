import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  shortLabel?: string;
}

export interface FilterDropdownProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
  searchable?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

export function FilterDropdown({
  icon: Icon,
  label,
  value,
  options,
  onChange,
  searchable = false,
  className = "",
  align = "left",
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
      }, 50);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [isOpen]);

  const selectedOpt = options.find((o) => o.value === value);
  const isDefault = !selectedOpt || selectedOpt.value === options[0]?.value;
  const displayText = isDefault ? label : selectedOpt.shortLabel || selectedOpt.label;

  const filteredOptions =
    searchable && searchTerm.trim()
      ? options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options;

  const alignmentClass =
    align === "center"
      ? "left-1/2 -translate-x-1/2"
      : align === "right"
      ? "right-0 left-auto"
      : "left-0 right-auto";

  return (
    <div ref={dropdownRef} className={`relative w-full min-w-0 ${className}`}>
      <button
        type="button"
        title={isDefault ? label : selectedOpt?.label}
        onClick={() => {
          setIsOpen((prev) => !prev);
          setSearchTerm("");
        }}
        className={`w-full flex items-center justify-between gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs border select-none min-w-0 focus:outline-hidden outline-none ${
          !isDefault
            ? "bg-blue-50/90 dark:bg-sky-950/70 border-blue-400 dark:border-sky-600 text-blue-700 dark:text-sky-300 ring-2 ring-blue-500/20"
            : "glass border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-700 bg-white/90 dark:bg-slate-900/90"
        }`}
      >
        <div className="flex items-center gap-1 min-w-0 flex-1 justify-center sm:justify-start">
          <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate text-center sm:text-left">
            {displayText}
          </span>
        </div>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-blue-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute ${alignmentClass} top-full mt-1.5 z-[100] min-w-[210px] sm:min-w-[230px] max-w-[calc(100vw-28px)] rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 max-h-72 flex flex-col`}
        >
          {searchable && (
            <div className="p-1 mb-1 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar bairro..."
                className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="overflow-y-auto overscroll-contain flex-1 divide-y divide-slate-100/40 dark:divide-slate-800/40">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                Nenhuma opção encontrada
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
