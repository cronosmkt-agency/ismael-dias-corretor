import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function DeliveryPopup() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  const [afterHours, setAfterHours] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname;

  useEffect(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    // Adjusted to 18:00 (18 * 60)
    setAfterHours(minutes >= 18 * 60);

    const t = setTimeout(() => setVisible(true), 3000);
    const dismissTimer = setTimeout(() => setClosed(true), 12000);
    return () => {
      clearTimeout(t);
      clearTimeout(dismissTimer);
    };
  }, []);

  if (currentPath === "/chat" || !visible || closed) return null;

  const title = afterHours ? "🌙 Agende seu iPhone" : "⚡ Entrega Express em até 1h";
  const subtitle = afterHours
    ? "Agende agora ou retire amanhã na SejaDelta!"
    : "Receba na porta ou retire na SejaDelta.";

  return (
    <div
      role="status"
      className="fixed z-[55] bottom-24 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs animate-fade-in"
    >
      {/* Mobile: card compacto, alinhado ao botão de chat */}
      <div className="md:hidden relative flex h-14 items-center gap-2 rounded-2xl glass px-3 py-2 pr-7 shadow-lg">
        <div className="shrink-0 grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
          <BrandLogo height={24} showText={false} />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[11px] font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
            {!afterHours && <span className="animate-pulse">🟢</span>}
            <span className="truncate">{title}</span>
          </p>
          <p className="mt-0.5 truncate text-[10px] leading-tight" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Fechar aviso de entrega"
          className="absolute right-1 top-1 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 cursor-pointer"
          style={{ color: "var(--text-primary)" }}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Desktop: card completo */}
      <div className="hidden md:flex relative items-start gap-3 rounded-2xl glass p-4 pr-8 shadow-lg">
        <div className="shrink-0 grid h-10 w-10 place-items-center rounded-xl bg-primary/10">
          <BrandLogo height={28} showText={false} />
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {!afterHours && <span className="animate-pulse">🟢</span>}
            <span className="truncate">{title}</span>
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Fechar aviso de entrega"
          className="absolute right-2 top-2 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100 cursor-pointer"
          style={{ color: "var(--text-primary)" }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
