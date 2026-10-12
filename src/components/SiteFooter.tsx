import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import type { ThemeMode } from "@/components/ThemeSelectorModal";
import {
  WHATSAPP,
  PHONE_DISPLAY,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  ADDRESS_DISPLAY,
} from "@/data/storeData";
import { Phone, Instagram, Clock, MapPin, Building2, ShieldCheck } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function SiteFooter({ currentTheme }: { currentTheme?: ThemeMode }) {
  const isDark = currentTheme === "black-piano";

  return (
    <footer
      id="contato"
      className="pt-20 pb-32 sm:pb-12 px-4 sm:px-6"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        borderTop: "1px solid var(--glass-border)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <BrandLogo showText={true} dark={isDark} />
            <p
              className="text-sm mt-4 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Atendimento imobiliário com o corretor <strong>Ismael Dias</strong> na Habittat House. Lotes e terrenos em condomínio de alto padrão com a Angeleti Construtora em Teresópolis - RJ.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Ismael Dias • Corretor Habittat House</span>
            </div>
          </div>

          <div>
            <div
              className="font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Empreendimentos
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/lancamentos"
                  className="transition hover:text-blue-600 font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Golden Green Residencial (Albuquerque)
                </Link>
              </li>
              <li>
                <Link
                  to="/lancamentos"
                  className="transition hover:text-blue-600 font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Vale dos Pássaros (Prata)
                </Link>
              </li>
              <li>
                <Link
                  to="/loja"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Casas & Coberturas em Teresópolis
                </Link>
              </li>
              <li>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-emerald-500 font-semibold flex items-center gap-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Plantão de Vendas no WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div
              className="font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Diferenciais & Condições
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <span style={{ color: "var(--text-secondary)" }}>
                  Financiamento direto em até 120x
                </span>
              </li>
              <li>
                <span style={{ color: "var(--text-secondary)" }}>
                  Entrada facilitada a partir de 15%
                </span>
              </li>
              <li>
                <span style={{ color: "var(--text-secondary)" }}>
                  Angeleti Construtora: +20 anos
                </span>
              </li>
              <li>
                <span style={{ color: "var(--text-secondary)" }}>
                  Segurança 24h & Lazer Completo
                </span>
              </li>
              <li>
                <span style={{ color: "var(--text-secondary)" }}>
                  Vistas para o Dedo de Deus
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div
              className="font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Atendimento & Localização
            </div>
            <div
              className="text-sm space-y-2.5"
              style={{ color: "var(--text-secondary)" }}
            >
              <div className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <MapPin className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <span>{ADDRESS_DISPLAY}</span>
              </div>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-500 transition font-medium"
              >
                <Phone
                  className="w-4 h-4 shrink-0 text-emerald-500"
                />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-sky-400 transition"
              >
                <Instagram
                  className="w-4 h-4 shrink-0 text-sky-500"
                />{" "}
                {INSTAGRAM_HANDLE}
              </a>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" /> Seg a Sáb das 9h às 18h (Plantão aos domingos)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl sm:text-3xl font-black text-gradient-blue hover:opacity-80 transition"
          >
            {INSTAGRAM_HANDLE}
          </a>
        </div>

        <div
          className="mt-10 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--blue-primary), var(--blue-vivid), transparent)",
          }}
        />

        <div
          className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <div>
            © {new Date().getFullYear()} Ismael Dias — Corretor de Imóveis | Habittat House Imobiliária (Teresópolis, RJ). Todos os direitos reservados.
          </div>
          <div>
            Parceria Oficial Angeleti Construtora • Terrenos e Imóveis de Alto Padrão
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

