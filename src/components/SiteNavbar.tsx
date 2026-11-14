import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Sun, MoonStar } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import type { ThemeMode } from "@/components/ThemeSelectorModal";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WHATSAPP } from "@/data/storeData";

interface SiteNavbarProps {
  currentTheme: ThemeMode;
  toggleTheme: () => void;
}

export function SiteNavbar({ currentTheme, toggleTheme }: SiteNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [afterHours, setAfterHours] = useState(false);
  const [themeNotice, setThemeNotice] = useState<{
    text: string;
    isDark: boolean;
  } | null>(null);
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isDark = currentTheme === "black-piano";

  const handleToggleTheme = () => {
    const willBeDark = !isDark;
    toggleTheme();

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }

    setThemeNotice({
      text: willBeDark ? "Modo Black Piano ativado" : "Modo Branco Linho ativado",
      isDark: willBeDark,
    });

    noticeTimerRef.current = setTimeout(() => {
      setThemeNotice(null);
    }, 1300);
  };

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    setAfterHours(minutes >= 18 * 60);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Guia", path: "/" },
    { label: "Lançamentos", path: "/lancamentos", hasDot: true },
    { label: "Catálogo", path: "/loja" },
  ];

  return (
    <>
      {/* Desktop pill navbar */}
      <div className="hidden lg:flex fixed top-4 inset-x-0 z-50 flex-col items-center pointer-events-none px-6">
        <nav
          className={`pointer-events-auto nav-pill nav-pill-desk ${
            scrolled ? "scrolled" : ""
          } flex items-center justify-between px-6 py-2 w-full max-w-5xl xl:max-w-6xl transition-all duration-300`}
        >
          <Link to="/" className="shrink-0 logo-desk flex items-center">
            <BrandLogo height={38} showText={true} dark={isDark} />
          </Link>

          <div className="flex items-center justify-center gap-1.5">
            {navLinks.map((link) => {
              const isCurrent = currentPath === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                    isCurrent
                      ? "btn-primary-glow text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasDot && (
                    <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse shadow-[0_0_6px_rgba(197,168,128,0.6)]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 justify-end">
            {/* Neumorphic Day/Night Sliding Switch */}
            <ThemeToggleSwitch isDark={isDark} toggleTheme={handleToggleTheme} />

            <div className="badge-aberto text-xs py-1 px-3">
              {afterHours
                ? "Plantão Online • Atendimento WhatsApp"
                : "Plantão de Vendas Aberto"}
            </div>

            <span
              className="h-5 border-l"
              style={{ borderColor: "rgba(197, 168, 128, 0.3)" }}
            />

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pedir-agora text-xs py-2 px-4 rounded-full flex items-center gap-1.5 bg-[#1A3828] hover:bg-[#2A523A] text-white border border-[#C5A880]/30 shadow-xs"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Agendar Visita</span>
            </a>
          </div>
        </nav>

        {/* Notificação rápida posicionada diretamente abaixo da header (Web) */}
        <div
          className={`transition-all duration-250 ease-out transform ${
            themeNotice
              ? "opacity-100 translate-y-2.5 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-xl backdrop-blur-xl border ${
              themeNotice?.isDark
                ? "bg-[#0b1310]/95 text-[#FAF8F5] border-[#C5A880]/30 shadow-[0_8px_25px_rgba(0,0,0,0.65)]"
                : "bg-white/95 text-[#121316] border-[#1A3828]/15 shadow-[0_8px_25px_rgba(26,56,40,0.12)]"
            }`}
          >
            {themeNotice?.isDark ? (
              <MoonStar className="w-3.5 h-3.5 text-[#C5A880]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-[#1A3828]" />
            )}
            <span>{themeNotice?.text}</span>
          </div>
        </div>
      </div>

      {/* Mobile pill navbar */}
      <div className="lg:hidden fixed top-4 left-4 right-4 z-50 flex flex-col items-center pointer-events-none">
        <nav className={`pointer-events-auto w-full nav-pill ${scrolled ? "scrolled" : ""}`}>
          <div className="flex items-center justify-between h-14 px-4 sm:px-5">
            <Link
              to="/"
              className="flex items-center transition-opacity hover:opacity-90 active:scale-95"
              aria-label="Página Inicial - Ismael Dias Corretor Habittat House"
            >
              <BrandLogo height={34} showText={true} dark={isDark} />
            </Link>

            {/* Neumorphic Day/Night Sliding Switch for mobile */}
            <div className="scale-90 origin-right">
              <ThemeToggleSwitch isDark={isDark} toggleTheme={handleToggleTheme} />
            </div>
          </div>
        </nav>

        {/* Notificação rápida posicionada diretamente abaixo da header (Mobile) */}
        <div
          className={`transition-all duration-250 ease-out transform ${
            themeNotice
              ? "opacity-100 translate-y-2 scale-100 pointer-events-auto"
              : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black shadow-lg backdrop-blur-xl border ${
              themeNotice?.isDark
                ? "bg-[#0b1310]/95 text-[#FAF8F5] border-[#C5A880]/30 shadow-[0_6px_20px_rgba(0,0,0,0.55)]"
                : "bg-white/95 text-[#121316] border-[#1A3828]/15 shadow-[0_6px_20px_rgba(26,56,40,0.1)]"
            }`}
          >
            {themeNotice?.isDark ? (
              <MoonStar className="w-3 h-3 text-[#C5A880]" />
            ) : (
              <Sun className="w-3 h-3 text-[#1A3828]" />
            )}
            <span>{themeNotice?.text}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Neumorphic Day/Night Sliding Switch matching the reference UI
 */
export function ThemeToggleSwitch({
  isDark,
  toggleTheme,
  className = "",
}: {
  isDark: boolean;
  toggleTheme: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Mudar para Branco Linho" : "Mudar para Black Piano"}
      title={isDark ? "Mudar para Branco Linho" : "Mudar para Black Piano"}
      className={`relative inline-flex items-center w-[66px] h-[34px] p-[3px] rounded-full transition-all duration-300 cursor-pointer select-none shrink-0 ${
        isDark
          ? "bg-[#0b1310] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] border border-[#C5A880]/30"
          : "bg-[#e5ede7] shadow-[inset_0_2px_4px_rgba(26,56,40,0.12)] border border-[#1A3828]/20"
      } hover:opacity-95 active:scale-95 ${className}`}
    >
      {/* Background Reference Track Icons */}
      <div className="absolute inset-0 px-[9px] flex items-center justify-between pointer-events-none">
        {/* Left: Sun icon visible when knob slides to the right (dark mode) */}
        <Sun
          className={`w-4 h-4 transition-all duration-300 ${
            isDark ? "text-[#C5A880]/70 opacity-90 scale-100" : "opacity-0 scale-75"
          }`}
          strokeWidth={2.4}
        />
        {/* Right: MoonStar icon visible when knob slides to the left (light mode) */}
        <MoonStar
          className={`w-4 h-4 transition-all duration-300 ${
            !isDark ? "text-[#1A3828]/70 opacity-90 scale-100" : "opacity-0 scale-75"
          }`}
          strokeWidth={2.4}
        />
      </div>

      {/* Tactile 3D Sliding Knob */}
      <div
        className={`relative z-10 w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all duration-300 ease-out ${
          isDark
            ? "translate-x-[32px] bg-gradient-to-b from-[#dfca9e] to-[#C5A880] text-[#0d1611] shadow-[0_4px_12px_rgba(197,168,128,0.5),0_1px_3px_rgba(0,0,0,0.4)]"
            : "translate-x-0 bg-gradient-to-b from-[#244d37] to-[#1A3828] text-[#FAF8F5] shadow-[0_4px_10px_rgba(26,56,40,0.35),0_1px_3px_rgba(0,0,0,0.15)]"
        }`}
      >
        {isDark ? (
          <MoonStar
            className="w-4 h-4 text-[#0d1611] drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)] animate-in fade-in duration-200"
            strokeWidth={2.5}
          />
        ) : (
          <Sun
            className="w-4 h-4 text-[#C5A880] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] animate-in fade-in duration-200"
            strokeWidth={2.5}
          />
        )}
      </div>
    </button>
  );
}
