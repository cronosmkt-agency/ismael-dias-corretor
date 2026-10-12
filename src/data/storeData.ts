import type { ProductItem } from "@/components/ProductDetailModal";
import { allImoveisData } from "@/data/imoveisData";
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

export const STORE_NAME = "Ismael Dias — Corretor de Imóveis | Habittat House";
export const BROKER_NAME = "Ismael Dias";
export const BROKER_ROLE = "Corretor de Imóveis na Habittat House";
export const REAL_ESTATE_AGENCY = "Habittat House Imobiliária";
export const WHATSAPP_NUMBER = "5521964639999";
export const WHATSAPP = "https://wa.me/" + WHATSAPP_NUMBER;
export const PHONE_DISPLAY = "(21) 96463-9999";
export const INSTAGRAM_HANDLE = "@habittathouse";
export const INSTAGRAM_URL = "https://instagram.com/habittathouse";
export const ADDRESS_DISPLAY = "Rodovia Dr. Rogério Moura Estevão, 3835 - Albuquerque, Teresópolis/RJ";

export const fmt = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* -------------------------------------------------------------
   FILTROS ESPECÍFICOS POR PÁGINA
------------------------------------------------------------- */
export const lancamentosFilters = [
  "Todos",
  "Condomínio Clube",
  "Lotes Panorâmicos",
] as const;

export const imoveisFilters = [
  "Todos",
  "Casas em Condomínio",
  "Casas",
  "Apartamentos",
  "Coberturas",
  "Terrenos",
  "Sítios & Rurais",
  "Comerciais",
] as const;

// Filtro legado para compatibilidade geral
export const filters = [
  "Todos",
  "Casas em Condomínio",
  "Casas",
  "Apartamentos",
  "Terrenos",
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
    desc: "Condições facilitadas: 15% de entrada e saldo em até 120 parcelas diretamente com a incorporadora.",
  },
  {
    icon: KeyRound,
    title: "Assessoria com Ismael Dias",
    desc: "Acompanhamento consultivo e seguro em todas as etapas, desde a escolha do lote até a escritura e RGI.",
  },
  {
    icon: CalendarCheck,
    title: "Agendamento de Visita VIP",
    desc: "Venha conhecer os condomínios pessoalmente em Teresópolis com Ismael Dias e escolha a melhor posição solar para sua casa.",
  },
];

export const reviews = [
  {
    name: "Carlos Eduardo & Patrícia",
    neighborhood: "Albuquerque",
    text: "Adquirimos nosso lote no Golden Green com o acompanhamento do Ismael Dias na Habittat House. O terreno é espetacular, com vista maravilhosa para o Dedo de Deus e o parcelamento direto com a Angeleti facilitou nosso planejamento.",
  },
  {
    name: "Marcelo Guimarães",
    neighborhood: "Prata",
    text: "O Vale dos Pássaros é perfeito para quem tem filhos. O clube de lazer com piscina semiolímpica e quadras de tênis nos conquistou. O atendimento do Ismael Dias foi transparente e ágil do início ao fim.",
  },
  {
    name: "Renata Vasconcellos",
    neighborhood: "Albuquerque",
    text: "Conhecemos o projeto do Golden Green com o Ismael e ficamos encantados com a vista panorâmica para o Dedo de Deus e o contato direto com a natureza. Lotes amplos e um conceito de alto padrão que faltava na serra fluminense.",
  },
  {
    name: "Felipe Siqueira",
    neighborhood: "Alto",
    text: "Excelente atendimento imobiliário. Encontrei uma casa em condomínio exatamente como procurava através do Ismael Dias na Habittat House, com segurança jurídica e atendimento pontual. Recomendo de olhos fechados!",
  },
  {
    name: "Juliana Esteves",
    neighborhood: "Agriões",
    text: "Melhor experiência imobiliária da serra. O corretor Ismael Dias me acompanhou nos condomínios parceiros e recebi todas as orientações sobre topografia, insolação, ventilação e condições de pagamento.",
  },
];

/* -------------------------------------------------------------
   PRODUTOS — LANÇAMENTOS (Condomínios Angeleti)
------------------------------------------------------------- */
export const lancamentosProducts: ProductItem[] = [
  {
    sku: "324009",
    name: "Golden Green",
    price: 267000,
    cat: "Lotes Panorâmicos",
    badge: "Vista Dedo de Deus",
    img: "/imoveis/golden-green-capa.jpg",
    images: [
      "/imoveis/golden-green-capa.jpg",
      "/imoveis/golden-green/foto_01.webp",
      "/imoveis/golden-green/foto_02.webp",
      "/imoveis/golden-green/foto_03.webp",
      "/imoveis/golden-green/foto_04.webp",
      "/imoveis/golden-green/foto_05.webp",
      "/imoveis/golden-green/foto_06.webp",
      "/imoveis/golden-green/foto_07.webp",
      "/imoveis/golden-green/foto_08.webp",
    ],
    specs: "400 m² a 1.500 m² • Entrada 15% • 120x Direto • Vista Panorâmica",
    storage: "400 m² a 1.500 m²",
    condition: "Condomínio Fechado de Alto Padrão em Albuquerque",
    warranty: "Angeleti Construtora (+20 anos)",
    battery: "Topografia Plana e Suave Aclive",
    screen: "Albuquerque — Teresópolis/RJ",
    camera: "Vista Dedo de Deus e Mulher de Pedra",
    chip: "15% Entrada + até 120x (IPCA + 1% a.m.)",
    instagram: "@goldengreenresidencial",
    instagramUrl: "https://www.instagram.com/goldengreenresidencial/",
    description:
      "O Residencial Golden Green é um empreendimento de alto padrão desenvolvido pela Angeleti Incorporadora e Construtora, localizado no KM 4,5 da estrada Teresópolis x Friburgo (bairro Albuquerque), a apenas 10 minutos do Centro. Conta com vista 360º privilegiada para o Dedo de Deus e toda a serra fluminense, portaria 24 horas blindada, pavimentação ecológica, lotes amplos de 400 m² a 1.500 m² prontos para construir e financiamento facilitado direto em até 120 parcelas.",
    boxItems: [
      "Lote demarcado e pronto para projeto arquitetônico",
      "Infraestrutura completa de água, esgoto e energia elétrica",
      "Portaria com segurança 24 horas e guarita blindada",
      "Pavimentação ecológica de alta resistência",
      "Assessoria Habittat House: agendamento de visita e documentação",
      "Financiamento direto: 15% de entrada + saldo em até 120 parcelas",
    ],
    bairro: "Albuquerque",
  },
  {
    sku: "163110",
    name: "Vale dos Pássaros",
    price: 250000,
    cat: "Condomínio Clube",
    badge: "Lançamento Clube",
    img: "/imoveis/vale-dos-passaros-capa.webp",
    images: [
      "/imoveis/vale-dos-passaros-capa.webp",
      "/imoveis/vale-dos-passaros/foto_01.webp",
      "/imoveis/vale-dos-passaros/foto_02.webp",
      "/imoveis/vale-dos-passaros/foto_03.webp",
      "/imoveis/vale-dos-passaros/foto_04.webp",
      "/imoveis/vale-dos-passaros/foto_05.webp",
      "/imoveis/vale-dos-passaros/foto_06.webp",
      "/imoveis/vale-dos-passaros/foto_07.webp",
      "/imoveis/vale-dos-passaros/foto_08.webp",
    ],
    specs: "300 m² a 800 m² • 5 min do Centro • Piscina e Quadras • Lazer Completo",
    storage: "Área Construída",
    condition: "Pronto para Morar",
    warranty: "Angeleti Construtora",
    battery: "Excelente Posição Solar",
    screen: "Prata, Teresópolis - RJ",
    camera: "Lazer e Sossego • Piscina Semiolímpica",
    chip: "15% Entrada + até 120x Direto",
    instagram: "@valedospassarosresidencial",
    instagramUrl: "https://www.instagram.com/valedospassarosresidencial/",
    description:
      "O Condomínio Residencial Vale dos Pássaros é um empreendimento desenvolvido pela Angeleti Incorporadora e Construtora, projetado para oferecer conforto, tranquilidade e contato direto com a natureza, sem abrir mão de segurança e organização urbana.\n\nImplantado em uma área de topografia favorável e solo firme, o condomínio conta com lotes bem dimensionados cercados por mais de 345 mil m² de área verde nativa, clube de lazer completo com piscina adulto semiolímpica e infantil, quadra de tênis e poliesportiva, academia e espaço gourmet.\n\nO Vale dos Pássaros é ideal para quem busca moradia definitiva, casa de veraneio ou valorização patrimonial, contando ainda com fluxo de pagamento facilitado direto com a incorporadora com 15% de entrada e até 120 parcelas.",
    boxItems: [
      "Acesso completo ao clube de lazer para toda a família",
      "Piscina adulto semiolímpica e infantil com solário",
      "Quadras esportivas e quadra de tênis oficial",
      "Mais de 345 mil m² de área verde nativa preservada",
      "Portaria com segurança 24 horas e guarita blindada",
      "Financiamento facilitado: 15% de entrada + saldo em até 120 parcelas direto com a incorporadora Angeleti",
    ],
    bairro: "Prata",
  },
];

/* -------------------------------------------------------------
   PRODUTOS — CARTEIRA COMPLETA DE IMÓVEIS (175 Imóveis Reais)
------------------------------------------------------------- */
export const imoveisAvulsosProducts: ProductItem[] = allImoveisData;

// Portfólio unificado e destaques para exibição na página inicial
export const defaultProducts: ProductItem[] = [
  ...lancamentosProducts,
  ...allImoveisData.slice(0, 12),
];
