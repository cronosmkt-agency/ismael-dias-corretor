import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { allImoveisData } from "@/data/imoveisData";

const BASE_URL = "https://ismael-dias-corretor.vercel.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];

        const entries: SitemapEntry[] = [
          { path: "/", lastmod: today, changefreq: "daily", priority: "1.0" },
          { path: "/loja", lastmod: today, changefreq: "daily", priority: "0.9" },
          { path: "/lancamentos", lastmod: today, changefreq: "weekly", priority: "0.9" },
        ];

        // Todos os 175 imóveis com link exclusivo /imovel/{sku}
        allImoveisData.forEach((item) => {
          if (item.sku) {
            entries.push({
              path: `/imovel/${encodeURIComponent(String(item.sku))}`,
              lastmod: today,
              changefreq: "weekly",
              priority: "0.8",
            });
          }
        });

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      },
    },
  },
});
