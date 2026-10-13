/**
 * Settings Service — Gestão de configurações dinâmicas do site do corretor Ismael Dias.
 * Permite que o corretor altere seu WhatsApp, telefone, bio, Instagram e PIN de segurança pelo painel admin.
 */

export interface SiteSettings {
  realtorName: string;
  phoneDisplay: string;
  whatsappNumber: string;
  creci: string;
  agencyName: string;
  agencyAddress: string;
  instagramUrl: string;
  defaultWhatsAppMessage: string;
  adminPin: string;
  enableChatAssistant: boolean;
  highlightNotice: string;
  hideSoldProperties?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  realtorName: "Ismael Dias",
  phoneDisplay: "(21) 96463-9999",
  whatsappNumber: "5521964639999",
  creci: "CRECI-RJ Ativo",
  agencyName: "Habittat House Imobiliária",
  agencyAddress: "Rodovia Dr. Rogério Moura Estevão, 3835 - Albuquerque, Teresópolis/RJ",
  instagramUrl: "https://instagram.com/ismaeldias.corretor",
  defaultWhatsAppMessage: "Olá Ismael! Vi um imóvel no seu site e gostaria de mais informações e agendar uma visita.",
  adminPin: "1234",
  enableChatAssistant: true,
  highlightNotice: "Condomínios Fechados Angeleti: 15% de entrada e parcelamento direto em até 120x!",
  hideSoldProperties: true,
  supabaseUrl: "https://mzrbinywfezwhdpukdxn.supabase.co",
  supabaseAnonKey: "sb_publishable_XcsVYbA0VZ3e4peR8AVSgw_wHog08eP",
};

const SETTINGS_STORAGE_KEY = "ismael_dias_site_settings_v1";

/**
 * Obtém as configurações atuais do site (carrega do armazenamento local com fallback para os padrões)
 */
export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error("Erro ao carregar configurações do site:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Salva novas configurações do site
 */
export function saveSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const current = getSiteSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

    // Dispara evento customizado para que os componentes do site atualizem em tempo real sem reload
    window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: updated }));
    return updated;
  } catch (err) {
    console.error("Erro ao salvar configurações do site:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Restaura as configurações originais padrão
 */
export function resetSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: DEFAULT_SETTINGS }));
  return DEFAULT_SETTINGS;
}

/**
 * Gera o link direto do WhatsApp com mensagem codificada
 */
export function buildWhatsAppLink(number: string, message: string): string {
  const cleanNumber = number.replace(/\D/g, "");
  const encoded = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
