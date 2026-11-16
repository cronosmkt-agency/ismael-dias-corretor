import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { allImoveisData } from "@/data/imoveisData";
import { lancamentosProducts } from "@/data/storeData";

const BASE_URL = "https://ismaeldias.shop";

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

        // Todos os imóveis e lançamentos com links limpos, únicos e canônicos /imovel/{sku}
        const seenSkus = new Set<string>();
        const allProperties = [...lancamentosProducts, ...allImoveisData];

        for (const item of allProperties) {
          if (!item.sku) continue;
          const cleanSku = encodeURIComponent(String(item.sku).trim());
          if (!cleanSku || seenSkus.has(cleanSku)) continue;
          seenSkus.add(cleanSku);

          const isSold =
            item.badge === "VENDIDA" ||
            item.condition === "VENDIDA" ||
            item.condition?.includes("VENDIDA");

          entries.push({
            path: `/imovel/${cleanSku}`,
            lastmod: today,
            changefreq: isSold ? "monthly" : "weekly",
            priority: isSold ? "0.5" : "0.8",
          });
        }

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
