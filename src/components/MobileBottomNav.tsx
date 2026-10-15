import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Trees, Compass } from "lucide-react";

export function MobileBottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isInicio = currentPath === "/";
  const isLancamentos = currentPath === "/lancamentos";
  const isLoja = currentPath === "/loja" || currentPath.startsWith("/imovel");

  return (
    <nav
      aria-label="Navegação rápida mobile"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/92 dark:bg-slate-950/92 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] px-4 py-2 pb-[max(0.65rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-3 max-w-sm mx-auto items-center gap-2">
        {/* Início */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
            isInicio
              ? "text-blue-600 dark:text-sky-400 font-black scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
          }`}
        >
          <Home
            className={`w-5 h-5 transition-transform ${
              isInicio ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
            }`}
          />
          <span className="text-[10px] leading-none">Início</span>
        </Link>

        {/* Lançamentos */}
        <Link
          to="/lancamentos"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all relative ${
            isLancamentos
              ? "text-blue-600 dark:text-sky-400 font-black scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
          }`}
        >
          <div className="relative">
            <Trees
              className={`w-5 h-5 transition-transform ${
                isLancamentos ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
              }`}
            />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-[10px] leading-none">Lançamentos</span>
        </Link>

        {/* Imóveis Avulsos */}
        <Link
          to="/loja"
          className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
            isLoja
              ? "text-blue-600 dark:text-sky-400 font-black scale-105"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
          }`}
        >
          <Compass
            className={`w-5 h-5 transition-transform ${
              isLoja ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
            }`}
          />
          <span className="text-[10px] leading-none">Imóveis</span>
        </Link>
      </div>
    </nav>
  );
}
