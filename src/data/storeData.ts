import type { ProductItem } from "@/components/ProductDetailModal";
import {
  Building2,
  ShieldCheck,
  DollarSign,
  Star,
  Trees,
  Compass,
  KeyRound,
  CalendarCheck,
} from "lucide-react";

export const STORE_NAME = "Habittat House Imobiliária";
export const WHATSAPP_NUMBER = "5521973546445";
export const WHATSAPP = "https://wa.me/" + WHATSAPP_NUMBER;
export const PHONE_DISPLAY = "(21) 97354-6445";
export const INSTAGRAM_HANDLE = "@habittathouse";
export const INSTAGRAM_URL = "https://instagram.com/habittathouse";
export const ADDRESS_DISPLAY = "Rodovia Dr. Rogério Moura Estevão, 3835 - Albuquerque, Teresópolis/RJ";

export const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const filters = [
  "Todos",
  "Terrenos em Condomínio",
  "Lançamentos",
  "Casas & Coberturas",
] as const;

export const differentials = [
  {
    icon: Building2,
    title: "Parceria Angeleti Construtora",
    desc: "+20 anos de tradição desenvolvendo condomínios de alto padrão com infraestrutura completa na Região Serrana.",
  },
  {
    icon: Trees,
    title: "Terrenos Prontos para Construir",
    desc: "Lotes amplos cercados por natureza exuberante, vistas deslumbrantes para o Dedo de Deus e Mulher de Pedra.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança & Condomínio Fechado",
    desc: "Portaria 24 horas, controle de acesso e total privacidade para você e sua família viverem com tranquilidade.",
  },
  {
    icon: DollarSign,
    title: "Financiamento Direto sem Burocracia",
    desc: "Condições facilitadas: 10% de entrada e saldo em até 120 parcelas diretamente com a incorporadora.",
  },
  {
    icon: KeyRound,
    title: "Assessoria Completa com CRECI",
    desc: "Acompanhamento consultivo especializado em todas as etapas, desde a escolha do lote até a escritura e RGI.",
  },
  {
    icon: CalendarCheck,
    title: "Agendamento de Visita VIP",
    desc: "Venha conhecer os condomínios pessoalmente em Teresópolis e escolha a melhor posição solar para sua casa.",
  },
];

export const reviews = [
  {
    name: "Carlos Eduardo & Patrícia",
    neighborhood: "Albuquerque",
    text: "Adquirimos nosso lote no Golden Green com a assessoria da Habittat House. O terreno é espetacular, com vista maravilhosa para o Dedo de Deus e a flexibilidade de parcelamento direto com a Angeleti facilitou muito nosso planejamento.",
  },
  {
    name: "Marcelo Guimarães",
    neighborhood: "Prata",
    text: "O Vale dos Pássaros é simplesmente perfeito para quem tem filhos. O clube de lazer com piscina semiolímpica e quadras de tênis nos conquistou. O atendimento do corretor Zinma foi transparente e ágil do início ao fim.",
  },
  {
    name: "Renata Vasconcellos",
    neighborhood: "Vargem Grande",
    text: "Conhecemos o projeto do Montares e ficamos encantados com a proposta do universo equestre e o contato direto com a natureza. Lotes amplos e um conceito único que faltava na serra fluminense.",
  },
  {
    name: "Felipe Siqueira",
    neighborhood: "Alto",
    text: "Excelente carteira de imóveis de alto padrão. Encontrei uma casa em condomínio exatamente como procurava, com segurança jurídica e atendimento pontual. Recomendo de olhos fechados!",
  },
  {
    name: "Juliana Esteves",
    neighborhood: "Agriões",
    text: "Melhor consultoria imobiliária da serra. Visitei os três condomínios parceiros e recebi todas as orientações sobre topografia, insolação, ventilação e condições de pagamento.",
  },
];

export const defaultProducts: ProductItem[] = [
  {
    name: "Golden Green Residencial — Lote Panorâmico",
    price: 200000,
    cat: "Terrenos em Condomínio",
    badge: "Vista Dedo de Deus",
    img: "/imoveis/casa-condominio.png",
    specs: "400 m² a 1.500 m² • Entrada 10% • 120x Direto • Vista Panorâmica",
    storage: "400 m² a 1.500 m²",
    condition: "Condomínio Fechado de Alto Padrão em Albuquerque",
    warranty: "Angeleti Construtora (+20 anos)",
    battery: "Topografia Plana e Suave Aclive",
    screen: "Albuquerque — Teresópolis/RJ (~10 min do Centro)",
    camera: "Vista Dedo de Deus e Mulher de Pedra",
    chip: "10% Entrada + até 120x (IPCA + 1% a.m.)",
    boxItems: [
      "Lote demarcado e pronto para projeto arquitetônico",
      "Infraestrutura completa de água, esgoto e energia elétrica",
      "Portaria com segurança 24 horas e guarita blindada",
      "Pavimentação ecológica de alta resistência",
      "Assessoria Habittat House: acompanhamento de visita e documentação",
    ],
  },
  {
    name: "Vale dos Pássaros — Reserva Residencial",
    price: 200000,
    cat: "Terrenos em Condomínio",
    badge: "Clube de Lazer Completo",
    img: "/imoveis/mansao-neoclassica.png",
    specs: "300 m² a 800 m² • 5 min do Centro • Piscina e Quadras • Lazer Completo",
    storage: "300 m² a 800 m²",
    condition: "Residencial Fechado com Clube de Lazer Privativo",
    warranty: "Angeleti Construtora",
    battery: "Lotes Prontos para Construir",
    screen: "Prata — Teresópolis/RJ (~5 min do Centro)",
    camera: "Piscina Semiolímpica, Quadras de Tênis, Academia e Sauna",
    chip: "10% Entrada + até 120x (IGP-M + 1%) ou até 36x sem juros",
    boxItems: [
      "Acesso completo ao clube de lazer para toda a família",
      "Piscina adulto semiolímpica e infantil com solário",
      "Quadras esportivas e quadra de tênis oficial",
      "Academia climatizada, sauna e salão de jogos",
      "Salão de festas com espaço gourmet integrado",
    ],
  },
  {
    name: "Montares Residencial — Condomínio Equestre",
    price: 400000,
    cat: "Lançamentos",
    badge: "Lançamento Equestre",
    img: "/imoveis/apartamento-decorado.png",
    specs: "Lotes ~600 m² • Fazendinha • Baias e Trilhas • Alto Padrão",
    storage: "Lotes Amplos de ~600 m²",
    condition: "Lançamento Residencial com Conceito Equestre Exclusivo",
    warranty: "Angeleti Construtora",
    battery: "Terrenos Planos e Arborizados",
    screen: "Vargem Grande — Teresópolis/RJ (Antigo Equiprime)",
    camera: "Fazendinha, Baias para Cavalos, Pista e Trilhas ao Ar Livre",
    chip: "Condições Especiais de Lançamento Direto com a Incorporadora",
    boxItems: [
      "Estrutura completa com baias e pista para cavalos",
      "Trilhas exclusivas integradas à natureza da Região Serrana",
      "Fazendinha privativa para vivência com animais e crianças",
      "Portaria com controle rigoroso de acesso 24h",
      "Lotes amplos garantindo máxima privacidade",
    ],
  },
  {
    name: "Casa Moderna em Condomínio — Albuquerque",
    price: 1250000,
    cat: "Casas & Coberturas",
    badge: "Pronta para Morar",
    img: "/imoveis/casa-condominio.png",
    specs: "4 Suítes • 320 m² • Terreno 650 m² • Área Gourmet e Piscina",
    storage: "Área Construída: 320 m²",
    condition: "Construção Nova em Condomínio Fechado de Luxo",
    warranty: "Habittat House Imobiliária (CRECI)",
    battery: "Acabamento em Madeira Nobre e Porcelanato 120x120",
    screen: "Albuquerque — Teresópolis/RJ",
    camera: "Vista Panorâmica Privilegiada para a Mata Atlântica",
    chip: "Aceita Financiamento Bancário e Estuda Propostas",
    boxItems: [
      "4 Suítes amplas (Master com closet e hidromassagem)",
      "Espaço gourmet moderno com churrasqueira e forno de pizza",
      "Piscina aquecida com borda infinita e deck molhado",
      "Garagem coberta para 3 veículos com ponto de recarga elétrica",
      "Documentação 100% legalizada com RGI e Habite-se",
    ],
  },
  {
    name: "Cobertura Duplex Panorâmica — Agriões",
    price: 980000,
    cat: "Casas & Coberturas",
    badge: "Vista 360° Serra",
    img: "/imoveis/cobertura-mar.png",
    specs: "3 Quartos (2 Suítes) • 210 m² • Terraço Privativo com Spa • 2 Vagas",
    storage: "Área Privativa: 210 m²",
    condition: "Imóvel Decorado em Localização Nobre",
    warranty: "Habittat House Imobiliária (CRECI)",
    battery: "Sol da Manhã e Terraço Gourmet com Hidromassagem",
    screen: "Agriões — Teresópolis/RJ (Bairro Nobre Central)",
    camera: "Vista Indevassável para a Serra dos Órgãos e Dedo de Deus",
    chip: "Condições de Pagamento Facilitadas e Carta de Crédito",
    boxItems: [
      "Living integrado em 2 ambientes com piso em tábua corrida",
      "Terraço com churrasqueira a carvão e jacuzzi aquecida",
      "Cozinha planejada com armários embutidos de primeira linha",
      "2 Vagas de garagem cobertas na escritura",
      "Edifício com elevador, salão de festas e portaria segura",
    ],
  },
];

