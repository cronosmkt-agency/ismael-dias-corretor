import { useState, useEffect } from "react";
import { X, Check, Sun, MoonStar } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export type ThemeMode = "white" | "black-piano";

interface ThemeSelectorModalProps {
  currentTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}

export function ThemeSelectorModal({
  currentTheme: propTheme,
  onThemeChange,
}: ThemeSelectorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>("white");

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = (localStorage.getItem("habittat_theme") || localStorage.getItem("terephones_theme")) as ThemeMode | null;
    const seenModal = localStorage.getItem("habittat_theme_modal_seen") || localStorage.getItem("terephones_theme_modal_seen");

    if (saved === "black-piano" || saved === "white") {
      setSelectedTheme(saved);
      applyTheme(saved);
    }

    if (!seenModal && !saved) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync prop changes if any
  useEffect(() => {
    if (propTheme) {
      setSelectedTheme(propTheme);
    }
  }, [propTheme]);

  // Listen to global open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-theme-modal", handleOpen);
    return () => window.removeEventListener("open-theme-modal", handleOpen);
  }, []);

  const applyTheme = (theme: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("theme-white", "theme-black-piano", "dark");
    if (theme === "black-piano") {
      root.classList.add("theme-black-piano", "dark");
    } else {
      root.classList.add("theme-white");
    }
    localStorage.setItem("habittat_theme", theme);
    if (onThemeChange) {
      onThemeChange(theme);
    }
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme } }));
  };

  const handleSelect = (theme: ThemeMode) => {
    setSelectedTheme(theme);
    applyTheme(theme);
  };

  const handleClose = () => {
    localStorage.setItem("habittat_theme_modal_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
      style={{
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        animation: "fadeUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-[420px] rounded-3xl p-5 sm:p-7 border text-white shadow-2xl transition-all"
        style={{
          background: "linear-gradient(145deg, rgba(16, 24, 20, 0.98) 0%, rgba(9, 13, 11, 0.99) 100%)",
          borderColor: "rgba(197, 168, 128, 0.25)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(197, 168, 128, 0.18)",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white transition hover:bg-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center justify-center mb-2">
            <BrandLogo height={32} showText={true} dark={true} />
          </div>

          <h2
            id="theme-modal-title"
            className="text-lg sm:text-xl font-black tracking-tight text-white"
          >
            Escolha seu Ambiente Visual
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Alterne quando desejar no topo da página.
          </p>
        </div>

        {/* Choice Cards (Branco Linho vs Black Piano) */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {/* Card: Branco Linho */}
          <div
            onClick={() => handleSelect("white")}
            className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 border-2 select-none ${
              selectedTheme === "white"
                ? "border-[#1A3828] bg-white shadow-lg shadow-[#1A3828]/20"
                : "border-stone-800 bg-stone-900/60 hover:border-stone-700"
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1A3828] to-[#2D5A40] text-[#C5A880] flex items-center justify-center shadow-md shadow-[#1A3828]/30 mb-2.5">
              <Sun className="w-5 h-5 stroke-[2.3]" />
            </div>

            <span className={`font-extrabold text-sm ${selectedTheme === "white" ? "text-slate-950" : "text-white"}`}>
              Branco Linho
            </span>
            <span className={`text-[11px] font-medium mt-0.5 ${selectedTheme === "white" ? "text-slate-600" : "text-stone-400"}`}>
              Clássico & Clean
            </span>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold">
              {selectedTheme === "white" ? (
                <span className="flex items-center gap-1 text-[#1A3828]">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ativo</span>
                </span>
              ) : (
                <span className="text-stone-500">Selecionar</span>
              )}
            </div>
          </div>

          {/* Card: Black Piano */}
          <div
            onClick={() => handleSelect("black-piano")}
            className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 border-2 select-none ${
              selectedTheme === "black-piano"
                ? "border-[#C5A880] bg-[#111613] shadow-lg shadow-[#C5A880]/20"
                : "border-stone-800 bg-stone-900/60 hover:border-stone-700"
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#C5A880] to-[#E0CFB3] text-[#111613] flex items-center justify-center shadow-md shadow-[#C5A880]/30 mb-2.5">
              <MoonStar className="w-5 h-5 stroke-[2.3]" />
            </div>

            <span className="font-extrabold text-sm text-white">
              Black Piano
            </span>
            <span className="text-[11px] font-medium text-stone-400 mt-0.5">
              Obsidiana Nobre
            </span>

            <div className="mt-3 flex items-center gap-1 text-[11px] font-bold">
              {selectedTheme === "black-piano" ? (
                <span className="flex items-center gap-1 text-[#C5A880]">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Ativo</span>
                </span>
              ) : (
                <span className="text-stone-500">Selecionar</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full mt-5 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-[#1A3828] hover:bg-[#254F38] active:scale-[0.99] text-[#FAF8F5] border border-[#C5A880]/35 transition shadow-lg shadow-[#1A3828]/35 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continuar</span>
        </button>

        <div className="mt-2.5 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] text-stone-400 hover:text-stone-300 transition cursor-pointer"
          >
            Decidir depois
          </button>
        </div>
      </div>
    </div>
  );
}

export default ThemeSelectorModal;
