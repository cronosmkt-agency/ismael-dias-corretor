import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Sparkles,
  Truck,
  Building2,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Phone,
  ArrowRight,
  Package,
  Layers,
} from "lucide-react";
import { SiteNavbar } from "@/components/SiteNavbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ThemeSelectorModal, type ThemeMode } from "@/components/ThemeSelectorModal";
import { BrandLogo } from "@/components/BrandLogo";
import {
  defaultProducts,
  WHATSAPP,
  fmt,
} from "@/data/storeData";
import { fetchGoogleSheetInventory } from "@/services/googleSheets";
import type { ProductItem } from "@/components/ProductDetailModal";
import { toast } from "sonner";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: any;
  }
}

export const Route = createFileRoute("/chat")({
  beforeLoad: () => {
    throw redirect({ to: "/loja" });
  },
  validateSearch: (search: Record<string, unknown>): { produto?: string; modo?: string } => {
    return {
      produto: typeof search.produto === "string" ? search.produto : undefined,
      modo: typeof search.modo === "string" ? search.modo : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Chat & Atendimento Online — Terephones Teresópolis" },
      {
        name: "description",
        content:
          "Tire suas dúvidas ou faça seu pedido de iPhone diretamente pelo Chat oficial da Terephones. Entrega em 1h ou retirada na SejaDelta.",
      },
    ],
  }),
  component: ChatPage,
});

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  options?: { label: string; action: string }[];
  orderCard?: {
    model: string;
    price: number;
    delivery: string;
    payment: string;
    customerName: string;
    customerAddress: string;
  };
  productPicker?: {
    filter?: "Todos" | "Seminovos" | "Novos";
  } | boolean;
}

function ChatPage() {
  const { produto: routeProduto, modo: routeModo } = Route.useSearch();
  const [activeChatTab, setActiveChatTab] = useState<"bot" | "live">(
    routeModo === "live" ? "live" : "bot"
  );
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>("white");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load Tawk.to Embedded Script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("tawk-script")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.embedded = "tawk_6aac00529d89af3444bee888";

    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/6aac00529d89af3444bee888/1k2o8b0j4";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    const s0 = document.getElementsByTagName("script")[0];
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, []);

  const [liveProducts, setLiveProducts] = useState<ProductItem[]>(defaultProducts);

  // Order state machine
  const [orderStep, setOrderStep] = useState<
    "idle" | "picking_model" | "picking_delivery" | "picking_payment" | "typing_info" | "finished"
  >("idle");
  const [draftOrder, setDraftOrder] = useState({
    model: "",
    price: 0,
    delivery: "",
    payment: "",
    customerName: "",
    customerAddress: "",
  });

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("terephones_theme") as ThemeMode | null;
      if (saved === "black-piano" || saved === "white") {
        setCurrentTheme(saved);
        const root = document.documentElement;
        root.classList.remove("theme-white", "theme-black-piano", "dark");
        if (saved === "black-piano") {
          root.classList.add("theme-black-piano", "dark");
        } else {
          root.classList.add("theme-white");
        }
      }
      // Sync Google Sheets inventory for Chat
      fetchGoogleSheetInventory()
        .then((items) => {
          if (items && items.length > 0) {
            setLiveProducts(items);
          }
        })
        .catch(() => {});

      // Initial messages
      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Check if user came from "Comprar no Chat" or "Pedir" in store/modal
      let prefilledProduct: {
        name: string;
        price: number;
        cat?: string;
        storage?: string;
        badge?: string;
        battery?: string;
      } | null = null;
      try {
        const rawOrder = sessionStorage.getItem("terephones_order_product");
        if (rawOrder) {
          prefilledProduct = JSON.parse(rawOrder);
          sessionStorage.removeItem("terephones_order_product");
        } else {
          const targetParam =
            routeProduto ||
            (typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("produto")
              : null);
          if (targetParam) {
            const match = defaultProducts.find((p) =>
              p.name.toLowerCase().includes(targetParam.toLowerCase()) ||
              targetParam.toLowerCase().includes(p.name.toLowerCase())
            );
            if (match) {
              prefilledProduct = {
                name: match.name,
                price: match.price,
                cat: match.cat,
                badge: match.badge,
                storage: match.storage,
                battery: match.battery,
              };
            }
          }
        }
      } catch {
        // ignore
      }

      if (prefilledProduct) {
        setDraftOrder((prev) => ({
          ...prev,
          model: prefilledProduct.name,
          price: prefilledProduct.price,
        }));
        setOrderStep("picking_delivery");

        const isNovo =
          prefilledProduct.cat === "Novos" ||
          prefilledProduct.name.toLowerCase().includes("lacrado") ||
          (prefilledProduct.badge && prefilledProduct.badge.toLowerCase().includes("lacrado"));

        const condText = isNovo
          ? "Novo Lacrado de Fábrica com 1 ano Apple"
          : "Seminovo Impecável com 90 dias de garantia";

        setMessages([
          {
            id: "welcome-product-order",
            sender: "bot",
            text: `Olá! Seja bem-vindo à Terephones! 🍎\n\nVocê selecionou o **${prefilledProduct.name}** (${condText}) por **${fmt(prefilledProduct.price)}** no PIX ou em até 18x no cartão com garantia.\n\nComo você prefere prosseguir com seu aparelho hoje em Teresópolis?`,
            time: now,
            options: [
              {
                label: "🚚 Entrega Express na minha porta (até 1h)",
                action: "set_delivery_express",
              },
              {
                label: "🏢 Retirar pessoalmente na Loja SejaDelta",
                action: "set_delivery_sejadelta",
              },
              {
                label: "💬 Falar com Vendedor sobre este iPhone",
                action: "talk_sales_model",
              },
              {
                label: "📱 Escolher Outro Modelo",
                action: "start_order",
              },
            ],
          },
        ]);
        return;
      }

      // Single initial welcome message
      setMessages([
        {
          id: "welcome-single",
          sender: "bot",
          text: "Olá! Seja muito bem-vindo ao Chat Oficial da Terephones em Teresópolis! 👋\n\nPor aqui você pode escolher seu iPhone com entrega express em até 1h na sua porta ou retirada na SejaDelta, tirar dúvidas de garantia e pagamento, ou falar diretamente com a nossa equipe de vendas. Como podemos te ajudar hoje?",
          time: now,
          options: [
            { label: "🛍️ Escolher iPhone para Comprar", action: "start_order" },
            { label: "💬 Falar com um Vendedor", action: "talk_to_sales" },
            { label: "⚡ Entrega em 1h & Retirada", action: "faq_delivery" },
            { label: "🔄 Simular Troca com Troco", action: "faq_tradein" },
          ],
        },
      ]);
    }
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = currentTheme === "black-piano" ? "white" : "black-piano";
    setCurrentTheme(next);
    const root = document.documentElement;
    root.classList.remove("theme-white", "theme-black-piano", "dark");
    if (next === "black-piano") {
      root.classList.add("theme-black-piano", "dark");
    } else {
      root.classList.add("theme-white");
    }
    localStorage.setItem("terephones_theme", next);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: next } }));
    toast.success(next === "black-piano" ? "Modo Black ativado" : "Modo Branco ativado", {
      id: "theme-toggle",
      duration: 1200,
    });
  };

  const addBotMessage = (
    text: string,
    options?: { label: string; action: string }[],
    extra?: Partial<ChatMessage>
  ) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const time = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "bot",
          text,
          time,
          options,
          ...extra,
        },
      ]);
    }, 600);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: "user",
        text,
        time,
      },
    ]);
    if (!textToSend) setInputValue("");

    // If typing info for order
    if (orderStep === "typing_info") {
      const finalOrder = {
        ...draftOrder,
        customerAddress: text,
      };
      setDraftOrder(finalOrder);
      setOrderStep("finished");

      addBotMessage(
        `🎉 Pedido finalizado com sucesso, ${finalOrder.customerName || "Cliente"}!`,
        [
          { label: "📲 Enviar Cópia para o WhatsApp da Loja", action: "copy_whatsapp" },
          { label: "🛍️ Fazer Outro Pedido", action: "start_order" },
          { label: "❓ Tirar Dúvidas", action: "show_faq" },
        ],
        {
          orderCard: finalOrder,
        }
      );
      return;
    }

    // Process user question through knowledge base
    const lower = text.toLowerCase();

    if (
      lower.includes("vendedor") ||
      lower.includes("atendente") ||
      lower.includes("falar com") ||
      lower.includes("humano") ||
      lower.includes("consultor") ||
      lower.includes("whatsapp") ||
      lower.includes("zap")
    ) {
      if (draftOrder.model) {
        handleAction("talk_sales_model");
      } else {
        handleAction("talk_to_sales");
      }
    } else if (
      lower.includes("seminovo") ||
      lower.includes("seminovos") ||
      lower.includes("usado") ||
      lower.includes("usados")
    ) {
      handleAction("filter_seminovos");
    } else if (
      lower.includes("lacrado") ||
      lower.includes("lacrados") ||
      lower.includes("novo") ||
      lower.includes("novos")
    ) {
      handleAction("filter_novos");
    } else if (
      lower.includes("pedido") ||
      lower.includes("comprar") ||
      lower.includes("quero") ||
      lower.includes("pedir") ||
      lower.includes("encomendar") ||
      lower.includes("iphone") ||
      lower.includes("escolher") ||
      lower.includes("aparelho") ||
      lower.includes("modelo") ||
      lower.includes("estoque")
    ) {
      handleAction("start_order");
    } else if (
      lower.includes("entrega") ||
      lower.includes("tempo") ||
      lower.includes("demora") ||
      lower.includes("frete") ||
      lower.includes("1h") ||
      lower.includes("2h") ||
      lower.includes("prazo")
    ) {
      handleAction("faq_delivery");
    } else if (
      lower.includes("sejadelta") ||
      lower.includes("onde") ||
      lower.includes("retirada") ||
      lower.includes("loja") ||
      lower.includes("endereço") ||
      lower.includes("endereco") ||
      lower.includes("presencial")
    ) {
      handleAction("faq_sejadelta");
    } else if (
      lower.includes("pagar") ||
      lower.includes("pagamento") ||
      lower.includes("pix") ||
      lower.includes("cartao") ||
      lower.includes("cartão") ||
      lower.includes("parcel") ||
      lower.includes("juros")
    ) {
      handleAction("faq_payment");
    } else if (
      lower.includes("troca") ||
      lower.includes("trade") ||
      lower.includes("entrada")
    ) {
      handleAction("faq_tradein");
    } else if (
      lower.includes("garantia") ||
      lower.includes("defeito") ||
      lower.includes("original") ||
      lower.includes("procedência") ||
      lower.includes("procedencia")
    ) {
      handleAction("faq_warranty");
    } else {
      addBotMessage(
        "Entendi! Temos 15 iPhones pronta-entrega testados e com garantia hoje em Teresópolis. Como posso te orientar agora?",
        [
          { label: "🛍️ Escolher iPhone para Comprar", action: "start_order" },
          { label: "💬 Falar com um Vendedor", action: "talk_to_sales" },
          { label: "⚡ Como funciona a entrega em 1h?", action: "faq_delivery" },
          { label: "📍 Onde retirar na SejaDelta?", action: "faq_sejadelta" },
        ]
      );
    }
  };

  const handleAction = (action: string, payload?: any) => {
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (action === "start_order") {
      setOrderStep("picking_model");
      addBotMessage(
        "Perfeito! Na Terephones trabalhamos com **iPhones Seminovos Selecionados** (com 90 dias de garantia e bateria testada) e **iPhones Novos Lacrados** (com 1 ano de garantia mundial Apple).\n\nQual categoria você gostaria de ver agora?",
        [
          { label: "✨ Ver iPhones Seminovos", action: "filter_seminovos" },
          { label: "📦 Ver iPhones Novos Lacrados", action: "filter_novos" },
          { label: "📱 Ver Todos os Modelos (15)", action: "filter_all" },
          { label: "💬 Falar com um Vendedor", action: "talk_to_sales" },
        ]
      );
    } else if (action === "filter_seminovos") {
      setOrderStep("picking_model");
      addBotMessage(
        "Aqui estão os nossos **iPhones Seminovos Selecionados** disponíveis a pronta-entrega em Teresópolis! Todos 100% revisados, com bateria de alta saúde e 90 dias de garantia:\n\nEscolha o seu para pedir ou falar com nosso vendedor:",
        [
          { label: "📦 Ver Novos Lacrados", action: "filter_novos" },
          { label: "📱 Ver Todos os Modelos", action: "filter_all" },
          { label: "💬 Falar com Vendedor", action: "talk_to_sales" },
        ],
        { productPicker: { filter: "Seminovos" } }
      );
    } else if (action === "filter_novos") {
      setOrderStep("picking_model");
      addBotMessage(
        "Aqui estão os nossos **iPhones Novos Lacrados** com 1 ano de garantia oficial Apple e entrega express hoje em Teresópolis:\n\nEscolha o seu para pedir ou falar com nosso vendedor:",
        [
          { label: "✨ Ver Seminovos", action: "filter_seminovos" },
          { label: "📱 Ver Todos os Modelos", action: "filter_all" },
          { label: "💬 Falar com Vendedor", action: "talk_to_sales" },
        ],
        { productPicker: { filter: "Novos" } }
      );
    } else if (action === "filter_all") {
      setOrderStep("picking_model");
      addBotMessage(
        "Aqui estão todos os nossos **15 iPhones em estoque** a pronta entrega em Teresópolis:\n\nEscolha o seu abaixo:",
        [
          { label: "✨ Apenas Seminovos", action: "filter_seminovos" },
          { label: "📦 Apenas Novos Lacrados", action: "filter_novos" },
          { label: "💬 Falar com Vendedor", action: "talk_to_sales" },
        ],
        { productPicker: { filter: "Todos" } }
      );
    } else if (action === "talk_to_sales") {
      addBotMessage(
        "Nosso time de vendas em Teresópolis está disponível agora! Você pode falar diretamente pelo **Chat ao Vivo** com nosso atendente (as mensagens apitam no celular dele) ou abrir o WhatsApp da loja:",
        [
          { label: "🟢 Iniciar Chat ao Vivo Agora", action: "open_live_tawk" },
          { label: "📲 Abrir WhatsApp do Vendedor", action: "open_whatsapp_sales" },
          { label: "🛍️ Escolher iPhone no Chat", action: "start_order" },
          { label: "⚡ Como funciona a Entrega em 1h?", action: "faq_delivery" },
        ]
      );
    } else if (action === "talk_sales_model") {
      const model = draftOrder.model || "iPhone selecionado";
      addBotMessage(
        `Perfeito! Para conversar agora com nosso vendedor sobre o **${model}**, tirar dúvidas sobre fotos, saúde da bateria ou formas de parcelamento:`,
        [
          { label: "🟢 Falar no Chat ao Vivo com Atendente", action: "open_live_tawk" },
          { label: "📲 Chamar Vendedor no WhatsApp", action: "open_whatsapp_model" },
          { label: "🚚 Continuar Pedido com Entrega em 1h", action: "set_delivery_express" },
          { label: "🏢 Continuar com Retirada SejaDelta", action: "set_delivery_sejadelta" },
          { label: "📱 Escolher Outro Modelo", action: "start_order" },
        ]
      );
    } else if (action === "open_live_tawk") {
      setActiveChatTab("live");
      if (typeof window !== "undefined" && window.Tawk_API) {
        try {
          if (draftOrder.model) {
            window.Tawk_API.setAttributes?.({
              aparelho: draftOrder.model,
              valor: fmt(draftOrder.price),
            }, () => {});
          }
          window.Tawk_API.maximize?.();
        } catch {}
      }
    } else if (action === "open_whatsapp_sales") {
      const text = "Olá, equipe Terephones! Estou no Chat do site e gostaria de falar com um vendedor sobre os iPhones disponíveis!";
      window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (action === "open_whatsapp_model") {
      const text = `Olá, equipe Terephones! Estou no Chat do site e gostaria de conversar com um vendedor sobre o *${draftOrder.model}* (${fmt(draftOrder.price)}). Poderiam me passar mais informações?`;
      window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (action === "select_product") {
      const prod = payload as typeof defaultProducts[0];
      setDraftOrder((prev) => ({
        ...prev,
        model: prod.name,
        price: prod.price,
      }));
      setOrderStep("picking_delivery");

      const isNovo = prod.cat === "Novos" || prod.name.toLowerCase().includes("lacrado");
      const cond = isNovo ? "Novo Lacrado com 1 ano Apple" : "Seminovo Impecável com 90 dias de garantia";

      addBotMessage(
        `Ótima escolha! O **${prod.name}** (${cond}) sai por **${fmt(prod.price)}** no PIX ou parcelado em até 18x no cartão.\n\nComo você prefere receber seu aparelho hoje em Teresópolis?`,
        [
          {
            label: "🚚 Entrega Express na minha porta (até 1h)",
            action: "set_delivery_express",
          },
          {
            label: "🏢 Retirar pessoalmente na Loja SejaDelta",
            action: "set_delivery_sejadelta",
          },
          {
            label: "💬 Falar com Vendedor sobre este iPhone",
            action: "talk_sales_model",
          },
        ]
      );
    } else if (action === "set_delivery_express" || action === "set_delivery_sejadelta") {
      const deliveryMode =
        action === "set_delivery_express"
          ? "Entrega Express em Domicílio (até 1h)"
          : "Retirada Presencial na Loja SejaDelta";

      setDraftOrder((prev) => ({
        ...prev,
        delivery: deliveryMode,
      }));
      setOrderStep("picking_payment");

      addBotMessage(
        `Perfeito: ${deliveryMode}.\n\nQual será a forma de pagamento na entrega? (Lembrando que você testa o iPhone na sua mão antes de pagar!)`,
        [
          {
            label: "⚡ PIX com Desconto Especial",
            action: "set_payment_pix",
          },
          {
            label: "💳 Cartão de Crédito em até 18x",
            action: "set_payment_card",
          },
        ]
      );
    } else if (action === "set_payment_pix" || action === "set_payment_card") {
      const paymentMode =
        action === "set_payment_pix"
          ? "PIX com Desconto"
          : "Cartão de Crédito (até 18x)";

      setDraftOrder((prev) => ({
        ...prev,
        payment: paymentMode,
      }));
      setOrderStep("typing_info");

      addBotMessage(
        "Quase lá! Por favor, digite seu Nome e Endereço ou Bairro em Teresópolis (ou deixe apenas seu WhatsApp) para separarmos seu aparelho:"
      );
    } else if (action === "copy_whatsapp") {
      const text = `*NOVO PEDIDO PELO CHAT TEREPHONES*\n\n📱 *Aparelho:* ${draftOrder.model}\n💰 *Valor:* ${fmt(draftOrder.price)}\n🚚 *Recebimento:* ${draftOrder.delivery}\n💳 *Pagamento:* ${draftOrder.payment}\n📍 *Dados:* ${draftOrder.customerAddress}\n\nPor favor, confirmem o envio/retirada para hoje!`;
      window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (action === "open_whatsapp") {
      window.open(WHATSAPP, "_blank");
    } else if (action === "faq_delivery") {
      addBotMessage(
        "⚡ *Entrega Express em até 1 Hora:*\n\nNosso motoboy ou motorista oficial leva o iPhone lacrado ou seminovo embalado com termo de garantia diretamente até a sua residência ou trabalho em qualquer bairro de Teresópolis.\n\nVocê liga, testa todas as funções (câmera, Face ID, tela, bateria) e só faz o pagamento quando estiver 100% satisfeito!",
        [
          { label: "🛍️ Fazer Pedido com Entrega Express", action: "start_order" },
          { label: "📍 Prefiro Retirar na SejaDelta", action: "faq_sejadelta" },
        ]
      );
    } else if (action === "faq_sejadelta") {
      addBotMessage(
        "🏢 *Ponto Parceiro Oficial SejaDelta:*\n\nVocê pode retirar seu iPhone presencialmente na SejaDelta, no Centro / Várzea de Teresópolis.\n\nHorário de atendimento: Segunda a Sábado das 10h às 18h. Um ambiente seguro, climatizado, onde aplicamos sua película na hora de cortesia!",
        [
          { label: "🛍️ Reservar iPhone para Retirar", action: "start_order" },
          { label: "💬 Falar com a equipe no WhatsApp", action: "open_whatsapp" },
        ]
      );
    } else if (action === "faq_payment") {
      addBotMessage(
        "💳 *Formas de Pagamento Seguras:*\n\n1. **PIX:** Com o melhor preço e desconto especial à vista.\n2. **Cartão de Crédito:** Parcelamento facilitado em até 12x ou 18x nas melhores taxas.\n3. **Troca inteligente (Trade-In):** Seu iPhone usado entra com desconto abatido na hora.\n\n*O pagamento é feito apenas na entrega ou retirada, após conferir tudo!*",
        [
          { label: "🛍️ Fazer Pedido com PIX ou Cartão", action: "start_order" },
          { label: "🔄 Quero simular troca do meu usado", action: "faq_tradein" },
        ]
      );
    } else if (action === "faq_tradein") {
      addBotMessage(
        "🔄 *Troca Inteligente (Trade-In):*\n\nAceitamos o seu iPhone usado a partir do iPhone 11 como entrada com avaliação justa e honesta.\n\nVocê não precisa ficar sem celular: a troca é feita no momento da entrega do seu novo aparelho!",
        [
          { label: "🛍️ Escolher Meu Novo iPhone", action: "start_order" },
          { label: "💬 Avaliar meu usado no WhatsApp", action: "open_whatsapp" },
        ]
      );
    } else if (action === "faq_warranty") {
      addBotMessage(
        "🛡️ *Garantia & Procedência Terephones:*\n\n- **iPhones Novos Lacrados:** 1 Ano de Garantia Mundial Oficial da Apple.\n- **iPhones Seminovos:** 90 Dias de Garantia total com certificado emitido pela Terephones, bateria original aprovada e aparelhos 100% livres de bloqueios de iCloud.",
        [
          { label: "🛍️ Ver Aparelhos em Estoque", action: "start_order" },
          { label: "⚡ Como funciona a entrega em 1h?", action: "faq_delivery" },
        ]
      );
    } else if (action === "show_faq") {
      addBotMessage("Escolha abaixo o que gostaria de saber:", [
        { label: "⚡ Entrega em 1h", action: "faq_delivery" },
        { label: "📍 Retirada SejaDelta", action: "faq_sejadelta" },
        { label: "💳 Pagamento", action: "faq_payment" },
        { label: "🔄 Troca de Usado", action: "faq_tradein" },
        { label: "🛡️ Garantia", action: "faq_warranty" },
      ]);
    }
  };

  const restartChat = () => {
    setDraftOrder({
      model: "",
      price: 0,
      delivery: "",
      payment: "",
      customerName: "",
      customerAddress: "",
    });
    setOrderStep("idle");
    const now = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages([
      {
        id: `welcome-restart-${Date.now()}`,
        sender: "bot",
        text: "Olá! Seja muito bem-vindo ao Chat Oficial da Terephones em Teresópolis! 👋\n\nPor aqui você pode escolher seu iPhone com entrega express em até 1h na sua porta ou retirada na SejaDelta, tirar dúvidas de garantia e pagamento, ou falar diretamente com a nossa equipe de vendas. Como podemos te ajudar hoje?",
        time: now,
        options: [
          { label: "🛍️ Escolher iPhone para Comprar", action: "start_order" },
          { label: "💬 Falar com um Vendedor", action: "talk_to_sales" },
          { label: "⚡ Entrega em 1h & Retirada", action: "faq_delivery" },
          { label: "🔄 Simular Troca com Troco", action: "faq_tradein" },
        ],
      },
    ]);
  };

  // Mouse Drag-to-Scroll support
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) return;

    const el = scrollContainerRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    startYRef.current = e.pageY - el.offsetTop;
    scrollTopRef.current = el.scrollTop;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      const y = ev.pageY - scrollContainerRef.current.offsetTop;
      const walk = (y - startYRef.current) * 1.3;
      scrollContainerRef.current.scrollTop = scrollTopRef.current - walk;
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "";
        scrollContainerRef.current.style.userSelect = "";
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-screen overflow-hidden bg-background text-foreground flex flex-col">
      <ThemeSelectorModal currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      <SiteNavbar currentTheme={currentTheme} toggleTheme={toggleTheme} />

      <main className="flex-1 min-h-0 w-full max-w-4xl mx-auto flex flex-col pt-[66px] sm:pt-[86px] pb-[64px] sm:pb-3 px-1 sm:px-4">
        {/* Chat Window Container */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl sm:rounded-3xl glass border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          {/* Top Bar do Atendimento */}
          <div className="shrink-0 px-2.5 sm:px-6 py-2 sm:py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-1.5 z-10">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="relative shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <BrandLogo height={18} showText={false} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 shadow-[0_0_6px_#10b981]" />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>TerePhones</span>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"
                    title="Online"
                  />
                </h2>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveChatTab("bot")}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition text-[11px] sm:text-xs cursor-pointer ${
                  activeChatTab === "bot"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Assistente</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveChatTab("live");
                  if (typeof window !== "undefined" && window.Tawk_API?.maximize) {
                    try { window.Tawk_API.maximize(); } catch {}
                  }
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition text-[11px] sm:text-xs cursor-pointer ${
                  activeChatTab === "live"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ao Vivo</span>
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {activeChatTab === "bot" ? (
                <button
                  onClick={restartChat}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition cursor-pointer"
                  title="Reiniciar conversa"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              ) : (
                <a
                  href="https://tawk.to/chat/6aac00529d89af3444bee888/1k2o8b0j4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition cursor-pointer"
                  title="Abrir em tela cheia"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              )}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold transition shadow-xs"
                title="Falar no WhatsApp"
              >
                <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Bot View Container */}
          <div
            className={`flex-1 min-h-0 flex flex-col ${
              activeChatTab === "bot" ? "relative" : "hidden"
            }`}
          >

          {/* Messages Scroll Area */}
          <div
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40 dark:bg-slate-950/30 chat-messages-scroll overscroll-contain"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Bubble */}
                <div
                  className={`${
                    msg.productPicker
                      ? "w-full max-w-[95%] sm:max-w-[85%]"
                      : "max-w-[88%] sm:max-w-[75%]"
                  } rounded-2xl px-3.5 sm:px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white font-medium rounded-tr-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs"
                  }`}
                >
                  <FormattedMessageText text={msg.text} isUser={msg.sender === "user"} />

                  {/* Card de Pedido Confirmado */}
                  {msg.orderCard && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/30 text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>RESUMO DO SEU PEDIDO</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-slate-500">Aparelho:</span>{" "}
                          <strong>{msg.orderCard.model}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Valor no PIX:</span>{" "}
                          <strong className="text-blue-600 dark:text-sky-400">
                            {fmt(msg.orderCard.price)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Recebimento:</span>{" "}
                          <strong>{msg.orderCard.delivery}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Pagamento:</span>{" "}
                          <strong>{msg.orderCard.payment}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Destino/Contato:</span>{" "}
                          <strong>{msg.orderCard.customerAddress}</strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                        📦 Seu pedido já está no sistema! Nossa equipe de logística entrará em contato para alinhar os detalhes da rota.
                      </p>
                    </div>
                  )}

                  {/* Seletor Visual de iPhones em Estoque com Abas Seminovos vs Novos */}
                  {msg.productPicker && (
                    <ChatProductPicker
                      initialFilter={
                        typeof msg.productPicker === "object" && msg.productPicker.filter
                          ? msg.productPicker.filter
                          : "Todos"
                      }
                      products={liveProducts}
                      onSelectProduct={(prod) => handleAction("select_product", prod)}
                    />
                  )}

                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      msg.sender === "user"
                        ? "text-blue-200"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>

                {/* Quick action buttons / Options */}
                {msg.options && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => handleAction(opt.action)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold glass hover:bg-blue-600 hover:text-white transition cursor-pointer border border-blue-500/20 text-blue-700 dark:text-sky-300 active:scale-95 text-left"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-24">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box - Permanently Docked at Bottom */}
          <div className="shrink-0 p-2.5 sm:p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder={
                  orderStep === "typing_info"
                    ? "Digite seu nome e endereço/bairro..."
                    : "Digite sua dúvida ou modelo desejado..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl glass border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition text-slate-900 dark:text-white"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Tawk.to View Container */}
        <div
          className={`flex-1 min-h-0 flex flex-col transition-opacity duration-200 ${
            activeChatTab === "live"
              ? "relative z-10 opacity-100 flex"
              : "absolute inset-0 opacity-0 pointer-events-none -z-10 flex"
          }`}
        >
          {/* Desktop-only subtle notice bar */}
          <div className="hidden md:flex shrink-0 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/50 items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span>
                <strong>Atendimento em Tempo Real:</strong> Notificações chegam diretamente no celular da nossa equipe em Teresópolis!
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-bold"
              >
                <Phone className="w-3 h-3" />
                <span>Prefere WhatsApp?</span>
              </a>
            </div>
          </div>

          {/* Container for Tawk.to - full bleed 100% height */}
          <div className="flex-1 min-h-0 relative w-full h-full bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
            <div
              id="tawk_6aac00529d89af3444bee888"
              className="w-full h-full flex-1 z-10"
              style={{ width: "100%", height: "100%" }}
            />
            {/* Desktop-only subtle footer */}
            <div className="hidden md:flex shrink-0 p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Atendimento oficial verificado Terephones Teresópolis</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://tawk.to/chat/6aac00529d89af3444bee888/1k2o8b0j4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir em Tela Cheia</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

      <MobileBottomNav />
    </div>
  );
}

/**
 * Formats chat message text, converting **bold** and *bold* into bold elements
 * without displaying the asterisks as plain text, and keeping line spacing clean.
 */
function FormattedMessageText({
  text,
  isUser = false,
}: {
  text: string;
  isUser?: boolean;
}) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-2" />;
        }

        const parts: (string | React.ReactNode)[] = [];
        const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            parts.push(line.slice(lastIndex, match.index));
          }
          const boldText = match[2] || match[3];
          parts.push(
            <strong
              key={`b-${lineIdx}-${match.index}`}
              className={
                isUser
                  ? "font-black text-white"
                  : "font-black text-slate-900 dark:text-white"
              }
            >
              {boldText}
            </strong>
          );
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
          parts.push(line.slice(lastIndex));
        }

        return (
          <div key={lineIdx} className="leading-relaxed">
            {parts}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Interactive product picker inside chat bubbles, featuring filter tabs
 * (Todos, Seminovos, Novos Lacrados) and direct selection.
 */
function ChatProductPicker({
  initialFilter = "Todos",
  products = defaultProducts,
  onSelectProduct,
}: {
  initialFilter?: "Todos" | "Seminovos" | "Novos";
  products?: ProductItem[];
  onSelectProduct: (prod: ProductItem) => void;
}) {
  const [activeTab, setActiveTab] = useState<"Todos" | "Seminovos" | "Novos">(initialFilter);

  const filtered = products.filter((p) => {
    if (activeTab === "Todos") return true;
    if (activeTab === "Novos") return p.cat === "Novos" || p.cat === "Lacrados";
    return p.cat === activeTab;
  });

  return (
    <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800">
      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1 mb-2.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60">
        {(["Todos", "Seminovos", "Novos"] as const).map((tab) => {
          const count = products.filter((p) => {
            if (tab === "Todos") return true;
            if (tab === "Novos") return p.cat === "Novos" || p.cat === "Lacrados";
            return p.cat === tab;
          }).length;
          const isActive = activeTab === tab;
          const label = tab === "Seminovos" ? "Seminovos" : tab === "Novos" ? "Lacrados" : "Todos";
          const icon = tab === "Seminovos" ? "✨" : tab === "Novos" ? "📦" : "📱";
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer select-none whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{icon} {label}</span>
              <span className="text-[9px] sm:text-[10px] opacity-75 font-semibold">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Product List */}
      <div className="max-h-72 overflow-y-auto space-y-2 pr-1 chat-messages-scroll overscroll-contain">
        {filtered.map((prod, idx) => {
          const isNovo = prod.cat === "Novos" || prod.cat === "Lacrados";
          return (
            <div
              key={prod.name + idx}
              onClick={() => onSelectProduct(prod)}
              className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white/70 dark:bg-slate-800/60 hover:bg-blue-50/80 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200/80 dark:border-slate-700/70 group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-12 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-800">
                  <img
                    src={prod.img}
                    alt={prod.name}
                    className="w-full h-full object-contain drop-shadow-xs"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                        isNovo
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/15 text-blue-600 dark:text-sky-400 border border-blue-500/20"
                      }`}
                    >
                      {isNovo ? (prod.quantity && prod.quantity > 1 ? `Lacrado • ${prod.quantity} un.` : "Lacrado 1 Ano") : "Seminovo 90d"}
                    </span>
                    {prod.badge && (
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold truncate">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                    {prod.name}
                  </p>
                  <div className="text-[11px] font-black text-blue-600 dark:text-sky-400">
                    {fmt(prod.price)}{" "}
                    <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                      no PIX
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(prod);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-black cursor-pointer transition shadow-xs shrink-0"
              >
                Escolher
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
