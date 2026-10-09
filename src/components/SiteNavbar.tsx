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
      text: willBeDark ? "Modo Black ativado" : "Modo Branco ativado",
      isDark: willBeDark,
    });

    noticeTimerRef.current = setTimeout(() => {
      setThemeNotice(null);
    }, 1300);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    setAfterHours(minutes >= 18 * 60);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Início", path: "/" },
    { label: "Loja", path: "/loja" },
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
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
                ? "Fechado — Abre amanhã às 10:00"
                : "Aberto até 18:00"}
            </div>

            <span
              className="h-5 border-l"
              style={{ borderColor: "rgba(var(--blue-rgb),0.18)" }}
            />

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pedir-agora text-xs py-2 px-4 rounded-full flex items-center gap-1.5"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
              <span>Pedir no WhatsApp</span>
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
                ? "bg-slate-950/92 text-white border-slate-700/80 shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
                : "bg-white/95 text-slate-900 border-slate-200/90 shadow-[0_8px_25px_rgba(0,0,0,0.12)]"
            }`}
          >
            {themeNotice?.isDark ? (
              <MoonStar className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
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
              aria-label="Página Inicial Terephones"
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
                ? "bg-slate-950/92 text-white border-slate-700/80 shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
                : "bg-white/95 text-slate-900 border-slate-200/90 shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
            }`}
          >
            {themeNotice?.isDark ? (
              <MoonStar className="w-3 h-3 text-sky-400" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
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
      aria-label={isDark ? "Mudar para Branco Titânio" : "Mudar para Black"}
      title={isDark ? "Mudar para Branco Titânio" : "Mudar para Black"}
      className={`relative inline-flex items-center w-[66px] h-[34px] p-[3px] rounded-full transition-all duration-300 cursor-pointer select-none shrink-0 ${
        isDark
          ? "bg-[#18202f] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-slate-700/70"
          : "bg-[#e2e8f0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.14)] border border-slate-300/80"
      } hover:opacity-95 active:scale-95 ${className}`}
    >
      {/* Background Reference Track Icons */}
      <div className="absolute inset-0 px-[9px] flex items-center justify-between pointer-events-none">
        {/* Left: Sun icon visible when knob slides to the right (dark mode) */}
        <Sun
          className={`w-4 h-4 transition-all duration-300 ${
            isDark ? "text-slate-500 opacity-90 scale-100" : "opacity-0 scale-75"
          }`}
          strokeWidth={2.4}
        />
        {/* Right: MoonStar icon visible when knob slides to the left (light mode) */}
        <MoonStar
          className={`w-4 h-4 transition-all duration-300 ${
            !isDark ? "text-slate-400 opacity-90 scale-100" : "opacity-0 scale-75"
          }`}
          strokeWidth={2.4}
        />
      </div>

      {/* Tactile 3D Sliding Knob */}
      <div
        className={`relative z-10 w-[28px] h-[28px] rounded-full flex items-center justify-center transition-all duration-300 ease-out ${
          isDark
            ? "translate-x-[32px] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] text-white shadow-[0_4px_10px_rgba(37,99,235,0.45),0_1px_3px_rgba(0,0,0,0.2)]"
            : "translate-x-0 bg-gradient-to-b from-[#ffa31a] to-[#f97316] text-white shadow-[0_4px_10px_rgba(249,115,22,0.45),0_1px_3px_rgba(0,0,0,0.15)]"
        }`}
      >
        {isDark ? (
          <MoonStar
            className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] animate-in fade-in duration-200"
            strokeWidth={2.5}
          />
        ) : (
          <Sun
            className="w-4 h-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] animate-in fade-in duration-200"
            strokeWidth={2.5}
          />
        )}
      </div>
    </button>
  );
}
