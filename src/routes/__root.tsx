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
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CursorEffects } from "../components/CursorEffects";
import { Toaster } from "@/components/ui/sonner";
import { TawkFloatingWidget } from "@/components/TawkFloatingWidget";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
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
      { title: "Terephones — iPhones Novos & Seminovos em Teresópolis" },
      { name: "description", content: "Terephones: iPhones novos e seminovos em Teresópolis/RJ. Entrega Express em até 1h na sua porta ou Retirada na Loja Física Parceira SejaDelta. Garantia de até 1 ano." },
      { name: "author", content: "Terephones" },
      { property: "og:title", content: "Terephones — iPhones Novos & Seminovos em Teresópolis" },
      { property: "og:description", content: "Entrega no mesmo dia em até 1h ou retire presencialmente na SejaDelta. Seu novo iPhone em Teresópolis com procedência e garantia total." },
      { property: "og:image", content: "https://ik.imagekit.io/zinma/tr:w-1200,f-auto,q-85/TerePhones-Logo.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://ik.imagekit.io/zinma/tr:w-1200,f-auto,q-85/TerePhones-Logo.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "https://ik.imagekit.io/zinma/tr:w-64,f-auto,q-85/TerePhones-Logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "https://ik.imagekit.io/zinma/tr:w-180,f-auto,q-85/TerePhones-Logo.png" },
      { rel: "preconnect", href: "https://ik.imagekit.io" },
      { rel: "dns-prefetch", href: "https://ik.imagekit.io" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
      {
        rel: "preload",
        as: "image",
        href: "https://ik.imagekit.io/zinma/tr:w-800,f-webp,q-85/Terephones-iphone.png",
        type: "image/webp",
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Terephones",
              alternateName: "Terephones iPhones Teresópolis",
              telephone: "+5521964639999",
              areaServed: "Teresópolis, RJ",
              logo: "https://ik.imagekit.io/zinma/tr:w-600,f-auto,q-85/TerePhones-Logo.png",
              image: "https://ik.imagekit.io/zinma/tr:w-600,f-auto,q-85/TerePhones-Logo.png",
            },
            {
              "@type": "WebSite",
              name: "Terephones",
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
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('terephones_theme');
                if (t === 'black-piano') {
                  document.documentElement.classList.add('theme-black-piano', 'dark');
                } else if (t === 'white') {
                  document.documentElement.classList.add('theme-white');
                  document.documentElement.classList.remove('dark');
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
      <TawkFloatingWidget />
      <Toaster position="top-center" offset="84px" duration={1400} richColors />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
