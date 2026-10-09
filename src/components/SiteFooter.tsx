import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import type { ThemeMode } from "@/components/ThemeSelectorModal";
import {
  WHATSAPP,
  PHONE_DISPLAY,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
} from "@/data/storeData";
import { Phone, Instagram, Clock } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function SiteFooter({ currentTheme }: { currentTheme?: ThemeMode }) {
  const isDark = currentTheme === "black-piano";

  return (
    <footer
      id="contato"
      className="pt-20 pb-28 sm:pb-12 px-4 sm:px-6"
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
              A sua melhor experiência na compra de iPhones novos e seminovos em
              Teresópolis com entrega express no mesmo dia ou retirada na loja
              parceira SejaDelta.
            </p>
          </div>

          <div>
            <div
              className="font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Navegação
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link
                  to="/loja"
                  className="transition hover:text-blue-600 font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Loja de iPhones (Estoque Real)
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
                  <span>Atendimento no WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="/#delivery"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Entrega Express em 1h
                </a>
              </li>
              <li>
                <a
                  href="/#retirada"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Retirada na SejaDelta
                </a>
              </li>
              <li>
                <a
                  href="/#troca"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Troca com Troco (Trade-In)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div
              className="font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Institucional
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/#sobre"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Sobre a Terephones
                </a>
              </li>
              <li>
                <a
                  href="/#retirada"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ponto Parceiro SejaDelta
                </a>
              </li>
              <li>
                <a
                  href="/#diferenciais"
                  className="transition hover:text-blue-600"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Garantia & Procedência
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-emerald-500"
                  style={{ color: "var(--text-secondary)" }}
                >
                  WhatsApp Oficial
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div
              className="font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Atendimento
            </div>
            <div
              className="text-sm space-y-2.5"
              style={{ color: "var(--text-secondary)" }}
            >
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-500 transition font-medium"
              >
                <Phone
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--blue-primary)" }}
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
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--blue-primary)" }}
                />{" "}
                {INSTAGRAM_HANDLE}
              </a>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" /> Seg a Sáb das 10h às
                18h
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl sm:text-4xl font-black text-gradient-blue hover:opacity-80 transition"
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
            © {new Date().getFullYear()} Terephones — Teresópolis, RJ. Todos os
            direitos reservados.
          </div>
          <div>
            Entrega no mesmo dia • Retirada na loja física parceira SejaDelta
          </div>
        </div>
      </div>
    </footer>
  );
}
