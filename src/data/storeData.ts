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
  "Condomínio Equestre",
  "Lotes Panorâmicos",
] as const;

export const imoveisFilters = [
  "Todos",
  "Casas em Condomínio",
  "Casas",
  "Apartamentos",
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
    neighborhood: "Vargem Grande",
    text: "Conhecemos o projeto do Montares com o Ismael e ficamos encantados com a proposta do universo equestre e o contato direto com a natureza. Lotes amplos e um conceito único que faltava na serra fluminense.",
  },
  {
    name: "Felipe Siqueira",
    neighborhood: "Alto",
    text: "Excelente atendimento imobiliário. Encontrei uma casa em condomínio exatamente como procurava através do Ismael Dias na Habittat House, com segurança jurídica e atendimento pontual. Recomendo de olhos fechados!",
  },
  {
    name: "Juliana Esteves",
    neighborhood: "Agriões",
    text: "Melhor experiência imobiliária da serra. O corretor Ismael Dias me acompanhou nos três condomínios parceiros e recebi todas as orientações sobre topografia, insolação, ventilação e condições de pagamento.",
  },
];

/* -------------------------------------------------------------
   PRODUTOS — LANÇAMENTOS (Condomínios Angeleti)
------------------------------------------------------------- */
export const lancamentosProducts: ProductItem[] = [
  {
    name: "Golden Green Residencial — Lote Panorâmico",
    price: 200000,
    cat: "Lotes Panorâmicos",
    badge: "Vista Dedo de Deus",
    img: "/imoveis/casa-condominio.png",
    specs: "400 m² a 1.500 m² • Entrada 15% • 120x Direto • Vista Panorâmica",
    storage: "400 m² a 1.500 m²",
    condition: "Condomínio Fechado de Alto Padrão em Albuquerque",
    warranty: "Angeleti Construtora (+20 anos)",
    battery: "Topografia Plana e Suave Aclive",
    screen: "Albuquerque — Teresópolis/RJ (~10 min do Centro)",
    camera: "Vista Dedo de Deus e Mulher de Pedra",
    chip: "15% Entrada + até 120x (IPCA + 1% a.m.)",
    boxItems: [
      "Lote demarcado e pronto para projeto arquitetônico",
      "Infraestrutura completa de água, esgoto e energia elétrica",
      "Portaria com segurança 24 horas e guarita blindada",
      "Pavimentação ecológica de alta resistência",
      "Assessoria Habittat House: agendamento de visita e documentação",
    ],
  },
  {
    name: "Vale dos Pássaros — Reserva Residencial",
    price: 200000,
    cat: "Condomínio Clube",
    badge: "Clube de Lazer Completo",
    img: "/imoveis/mansao-neoclassica.png",
    specs: "300 m² a 800 m² • 5 min do Centro • Piscina e Quadras • Lazer Completo",
    storage: "300 m² a 800 m²",
    condition: "Residencial Fechado com Clube de Lazer Privativo",
    warranty: "Angeleti Construtora",
    battery: "Lotes Prontos para Construir",
    screen: "Prata — Teresópolis/RJ (~5 min do Centro)",
    camera: "Piscina Semiolímpica, Quadras de Tênis, Academia e Sauna",
    chip: "15% Entrada + até 120x (IGP-M + 1%) ou até 36x sem juros",
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
    cat: "Condomínio Equestre",
    badge: "Lançamento Equestre",
    img: "/imoveis/apartamento-decorado.png",
    specs: "Lotes ~600 m² • Fazendinha • Baias e Trilhas • Alto Padrão",
    storage: "Lotes Amplos de ~600 m²",
    condition: "Lançamento Residencial com Conceito Equestre Exclusivo",
    warranty: "Angeleti Construtora",
    battery: "Terrenos Planos e Arborizados",
    screen: "Vargem Grande — Teresópolis/RJ (Antigo Equiprime)",
    camera: "Fazendinha, Baias para Cavalos, Pista e Trilhas ao Ar Livre",
    chip: "15% Entrada + até 120x Direto com a Incorporadora",
    boxItems: [
      "Estrutura completa com baias e pista para cavalos",
      "Trilhas exclusivas integradas à natureza da Região Serrana",
      "Fazendinha privativa para vivência com animais e crianças",
      "Portaria com controle rigoroso de acesso 24h",
      "Lotes amplos garantindo máxima privacidade",
    ],
  },
  {
    name: "Golden Green — Lote Topografia Nobre (Fase 2)",
    price: 245000,
    cat: "Lotes Panorâmicos",
    badge: "Sol da Manhã",
    img: "/imoveis/casa-condominio.png",
    specs: "520 m² • Vista Serra dos Órgãos • 15% + 120x • Pronto para Projeto",
    storage: "520 m² Privativos",
    condition: "Lote de Esquina em Condomínio Fechado",
    warranty: "Angeleti Construtora",
    battery: "Topografia 100% Plana",
    screen: "Albuquerque — Teresópolis/RJ",
    camera: "Vista Panorâmica Privilegiada para a Cadeia de Montanhas",
    chip: "15% Entrada + até 120x com a Incorporadora",
    boxItems: [
      "Posição solar privilegiada: sol da manhã",
      "Terreno de esquina com maior flexibilidade arquitetônica",
      "Infraestrutura subterrânea e água encanada",
      "Portaria e vigilância motorizada 24 horas",
    ],
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
