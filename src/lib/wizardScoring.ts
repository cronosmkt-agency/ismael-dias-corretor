import type { ProductItem } from "@/types/imovel";

export interface WizardAnswers {
  objective?: "comprar" | "construir" | "vender" | "lancamentos";
  occupants?: "casal" | "familia_pequena" | "familia_grande" | "investimento";
  propertyType?: "condominio" | "casa_avulsa" | "apartamento" | "terreno" | "comercial" | "qualquer";
  region?: "condominios" | "serra_natureza" | "centro" | "expansao" | "qualquer";
  priceRange?: "ate_300k" | "300k_600k" | "600k_1m" | "1m_2m" | "acima_2m";
  essentials?: string[]; // máximo 2 escolhas
  paymentMethod?: "financiamento" | "a_vista" | "parcelado" | "permuta" | "consultoria";
}

export interface ScoredProperty {
  property: ProductItem;
  score: number;
  matchPercentage: number;
  highlightBadge: string;
  matchReasons: string[];
}

const REGION_BAIRROS: Record<string, string[]> = {
  condominios: ["Albuquerque", "Green Valley", "Vale Encantado", "Carlos Guinle"],
  serra_natureza: ["Vargem Grande", "Alto", "Canoas", "Caneca Fina", "Pimenteiras", "Tijuca", "Quebra Frascos"],
  centro: ["Centro", "Várzea", "Agriões", "Golfe", "Barra do Imbuí", "Nossa Senhora de Fátima", "Fonte Santa"],
  expansao: ["Vieira", "Venda Nova", "Posse", "Pessegueiros", "Taumaturgo", "Prata dos Aredes", "Bonsucesso"],
};

const ESSENTIAL_KEYWORDS: Record<string, string[]> = {
  seguranca: ["condomínio", "portaria", "segurança 24h", "guarita", "fechado"],
  natureza: ["verde", "vista", "montanha", "nascente", "natureza", "árvores", "pomar", "jardim", "bosque"],
  lazer: ["piscina", "churrasqueira", "área gourmet", "gourmet", "lazer", "sauna", "playground", "salão de festas", "campo"],
  sossego: ["tranquilo", "sossego", "silêncio", "paz", "refúgio", "bucólico", "privacidade"],
  alto_padrao: ["alto padrão", "luxo", "cobertura", "fino acabamento", "suíte master", "closet", "arquitetura moderna", "mansão"],
  acesso: ["fácil acesso", "centro", "comércio", "escola", "ônibus", "conveniência", "próximo"],
};

export function scoreProperties(properties: ProductItem[], answers: WizardAnswers): ScoredProperty[] {
  // 1. Filtrar apenas imóveis ativos (excluir vendidos)
  const active = properties.filter((p) => {
    const isSold = p.badge === "VENDIDA" || p.condition?.includes("VENDIDA");
    return !isSold;
  });

  if (active.length === 0) return [];

  const scoredList: ScoredProperty[] = active.map((item) => {
    let score = 0;
    const reasons: string[] = [];
    const textCorpus = `${item.name} ${item.description || ""} ${item.specs || ""} ${item.storage || ""} ${item.screen || ""}`.toLowerCase();

    // 1. Tipo de Imóvel (P3) — Peso: 35 pontos
    if (answers.propertyType && answers.propertyType !== "qualquer") {
      let matchCat = false;
      const catLower = (item.cat || "").toLowerCase();
      const isCondo = catLower.includes("condomínio") || textCorpus.includes("condomínio fechado");

      if (answers.propertyType === "condominio") {
        matchCat = isCondo || catLower === "casas em condomínio";
      } else if (answers.propertyType === "casa_avulsa") {
        matchCat = (catLower === "casas" || catLower.includes("sítio")) && !isCondo;
      } else if (answers.propertyType === "apartamento") {
        matchCat = catLower === "apartamentos" || catLower === "coberturas" || textCorpus.includes("apartamento");
      } else if (answers.propertyType === "terreno") {
        matchCat = catLower === "terrenos" || textCorpus.includes("terreno") || textCorpus.includes("lote");
      } else if (answers.propertyType === "comercial") {
        matchCat = catLower === "comerciais" || textCorpus.includes("comercial") || textCorpus.includes("ponto");
      }

      if (matchCat) {
        score += 35;
        reasons.push("Tipo de imóvel exato");
      }
    } else {
      score += 20; // Pontuação neutra se não especificado
    }

    // 2. Faixa de Investimento (P5) — Peso: 25 pontos
    if (answers.priceRange) {
      const price = item.price || 0;
      let matchPrice = false;
      let closePrice = false;

      if (answers.priceRange === "ate_300k") {
        matchPrice = price > 0 && price <= 300000;
        closePrice = price > 300000 && price <= 380000;
      } else if (answers.priceRange === "300k_600k") {
        matchPrice = price > 300000 && price <= 600000;
        closePrice = price >= 260000 && price <= 680000;
      } else if (answers.priceRange === "600k_1m") {
        matchPrice = price > 600000 && price <= 1000000;
        closePrice = price >= 550000 && price <= 1150000;
      } else if (answers.priceRange === "1m_2m") {
        matchPrice = price > 1000000 && price <= 2000000;
        closePrice = price >= 900000 && price <= 2200000;
      } else if (answers.priceRange === "acima_2m") {
        matchPrice = price > 2000000;
        closePrice = price >= 1800000;
      }

      if (matchPrice) {
        score += 25;
        reasons.push("Dentro do orçamento planejado");
      } else if (closePrice) {
        score += 15;
        reasons.push("Próximo da faixa de investimento");
      }
    } else {
      score += 15;
    }

    // 3. Região e Localização (P4) — Peso: 20 pontos
    if (answers.region && answers.region !== "qualquer") {
      const targetBairros = REGION_BAIRROS[answers.region] || [];
      const itemBairro = item.bairro || "";
      const matchBairro = targetBairros.some(
        (b) => b.toLowerCase() === itemBairro.toLowerCase() || textCorpus.includes(b.toLowerCase())
      );

      if (matchBairro) {
        score += 20;
        reasons.push(`Excelente localização em ${itemBairro || "Teresópolis"}`);
      }
    } else {
      score += 12;
    }

    // 4. Estilo de Vida & Essenciais (P6 — até 2 seleções) — Peso: até 20 pontos (10 por escolha)
    if (answers.essentials && answers.essentials.length > 0) {
      answers.essentials.slice(0, 2).forEach((essKey) => {
        const keywords = ESSENTIAL_KEYWORDS[essKey] || [];
        const found = keywords.some((kw) => textCorpus.includes(kw));
        if (found) {
          score += 10;
          if (essKey === "seguranca") reasons.push("Segurança e portaria estruturada");
          else if (essKey === "natureza") reasons.push("Contato com a natureza e área verde");
          else if (essKey === "lazer") reasons.push("Área de lazer e convivência");
          else if (essKey === "sossego") reasons.push("Ambiente calmo e reservado");
          else if (essKey === "alto_padrao") reasons.push("Acabamento premium");
          else if (essKey === "acesso") reasons.push("Praticidade de acesso");
        }
      });
    } else {
      score += 10;
    }

    // 5. Forma de Pagamento (P7) — Peso: 10 pontos
    if (answers.paymentMethod) {
      const chipLower = (item.chip || "").toLowerCase();
      let matchPay = false;

      if (answers.paymentMethod === "financiamento") {
        matchPay = chipLower.includes("financiamento");
      } else if (answers.paymentMethod === "a_vista") {
        matchPay = chipLower.includes("proposta à vista") || chipLower.includes("à vista");
      } else if (answers.paymentMethod === "parcelado") {
        matchPay = chipLower.includes("facilitada") || chipLower.includes("120x") || chipLower.includes("parcela");
      } else if (answers.paymentMethod === "permuta") {
        matchPay = chipLower.includes("permuta");
      } else if (answers.paymentMethod === "consultoria") {
        matchPay = true;
      }

      if (matchPay) {
        score += 10;
        reasons.push("Condições de pagamento compatíveis");
      }
    } else {
      score += 5;
    }

    // 6. Ajuste secundário por ocupantes (P2)
    if (answers.occupants) {
      const batLower = (item.battery || "").toLowerCase();
      if (answers.occupants === "casal") {
        if (batLower.includes("1 quarto") || batLower.includes("2 quarto")) score += 5;
      } else if (answers.occupants === "familia_pequena") {
        if (batLower.includes("2 quarto") || batLower.includes("3 quarto")) score += 5;
      } else if (answers.occupants === "familia_grande") {
        if (batLower.includes("3 quarto") || batLower.includes("4 quarto") || batLower.includes("5")) score += 5;
      }
    }

    // Normalizar match percentual de 70% a 99% para uma apresentação comercial atrativa
    const boundedScore = Math.min(100, Math.max(20, score));
    const matchPercentage = Math.round(72 + (boundedScore / 100) * 26); // Entre 72% e 98%

    return {
      property: item,
      score: boundedScore,
      matchPercentage,
      highlightBadge: "",
      matchReasons: reasons.slice(0, 3),
    };
  });

  // Ordenar decrescente pelo score
  scoredList.sort((a, b) => b.score - a.score || (b.property.price || 0) - (a.property.price || 0));

  // Pegar invariavelmente os 3 melhores (Fallback garantido)
  const top3 = scoredList.slice(0, 3);

  // Atribuir selos personalizados aos top 3
  if (top3[0]) {
    top3[0].matchPercentage = Math.max(96, top3[0].matchPercentage);
    top3[0].highlightBadge = "🥇 Match 98% • Melhor Escolha para seu Perfil";
  }
  if (top3[1]) {
    top3[1].matchPercentage = Math.max(92, Math.min(95, top3[1].matchPercentage));
    top3[1].highlightBadge = "🥈 Match 94% • Mais Espaço e Conforto";
  }
  if (top3[2]) {
    top3[2].matchPercentage = Math.max(88, Math.min(91, top3[2].matchPercentage));
    top3[2].highlightBadge = "🥉 Match 89% • Excelente Custo-Benefício";
  }

  return top3;
}
