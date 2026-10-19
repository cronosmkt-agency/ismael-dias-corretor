import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { CursorEffects } from "../components/CursorEffects";
import { Toaster } from "@/components/ui/sonner";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center p-6 sm:p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-sky-400 mx-auto flex items-center justify-center font-black text-2xl mb-4">
          404
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Página ou Imóvel Não Encontrado
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          O imóvel ou endereço que você procura pode ter sido vendido ou o link está incorreto.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            to="/loja"
            className="inline-flex items-center justify-center rounded-xl btn-primary-glow px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95"
          >
            Ver Imóveis Disponíveis
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition active:scale-95"
          >
            Ir para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center p-6 sm:p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 shadow-2xl">
        <h1 className="text-xl font-black text-slate-900 dark:text-white">
          Ops, ocorreu uma instabilidade
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Não foi possível carregar as informações no momento. Tente atualizar ou volte para a página inicial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl btn-primary-glow px-5 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
          >
            Tentar Novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 transition active:scale-95"
          >
            Ir para o Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ismael Dias — Corretor de Imóveis | Habittat House Teresópolis" },
      { name: "description", content: "Ismael Dias, corretor de imóveis na Habittat House. Terrenos residenciais nos condomínios Golden Green e Vale dos Pássaros da Angeleti Construtora em Teresópolis/RJ. Entrada de 15% e até 120 parcelas direto." },
      { name: "author", content: "Ismael Dias — Corretor Habittat House" },
      { property: "og:title", content: "Ismael Dias — Corretor de Imóveis | Habittat House Teresópolis" },
      { property: "og:description", content: "Consultoria imobiliária especializada com Ismael Dias. Condomínios fechados da Angeleti Construtora com lazer completo e segurança 24h na serra." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:site_name", content: "Ismael Dias Corretor • Habittat House" },
      { name: "robots", content: "index, follow" },
      { name: "theme-color", content: "#2563eb" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "192x192" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "RealEstateAgent",
              name: "Ismael Dias — Corretor de Imóveis | Habittat House",
              alternateName: "Ismael Dias Corretor",
              telephone: "+5521964639999",
              areaServed: "Teresópolis, RJ",
            },
            {
              "@type": "WebSite",
              name: "Ismael Dias Corretor Habittat House",
              inLanguage: "pt-BR",
            },
          ],
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('habittat_theme') || localStorage.getItem('terephones_theme');
                if (t === 'black-piano') {
                  document.documentElement.classList.add('theme-black-piano', 'dark');
                } else {
                  document.documentElement.classList.add('theme-white');
                }
              } catch (e) {}
            `,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CursorEffects />
      <Toaster position="top-center" offset="84px" duration={1400} richColors />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
