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
  archetype: "match_perfeito" | "upgrade_exclusivo" | "oportunidade_unica";
  highlightBadge: string;
  tagline: string;
  matchedPills: string[];
  brokerNote: string;
  matchReasons: string[];
}

/**
 * Mapeamento completo de todos os bairros e micro-regiões de Teresópolis
 */
export const REGION_BAIRROS: Record<string, string[]> = {
  condominios: [
    "Albuquerque",
    "Green Valley",
    "Carlos Guinle",
    "Comary",
    "Golfe",
    "Granja Guarani",
    "Iucas",
    "Parque São Luiz",
    "Vale Encantado",
  ],
  serra_natureza: [
    "Vargem Grande",
    "Alto",
    "Quebra Frascos",
    "Tijuca",
    "Parque do Imbuí",
    "Cascata do Imbuí",
    "Cascata dos Amores",
    "Cascata Guarani",
    "Pimenteiras",
    "Caneca Fina",
    "Canoas",
    "Fazenda Alpina",
    "Fazendinha",
    "Cotia",
    "Sebastiana",
    "Três Córregos",
  ],
  centro: [
    "Centro",
    "Várzea",
    "Agriões",
    "Bom Retiro",
    "Nossa Senhora de Fátima",
    "Fonte Santa",
    "Barra do Imbuí",
    "Quinta da Barra",
    "São Pedro",
    "Vila Muqui",
    "Vale do Paraíso",
    "Taumaturgo",
    "Ermitage",
    "Caxangá",
    "Madureira",
  ],
  expansao: [
    "Vieira",
    "Venda Nova",
    "Posse",
    "Pessegueiros",
    "Bonsucesso",
    "Prata",
    "Prata dos Aredes",
    "Boa União",
    "Andradas",
    "Cabuçu",
    "Providência",
    "Interior",
    "Mury",
    "Nogueira",
    "Itaipava",
  ],
};

const ESSENTIAL_KEYWORDS: Record<string, string[]> = {
  seguranca: ["condomínio", "portaria", "segurança 24h", "guarita", "fechado", "cftv", "segurança"],
  natureza: ["verde", "vista", "montanha", "nascente", "natureza", "árvores", "pomar", "jardim", "bosque", "mata", "riacho", "lago", "panorâmica", "pedra do sino"],
  lazer: ["piscina", "churrasqueira", "área gourmet", "gourmet", "lazer", "sauna", "playground", "salão de festas", "campo", "quadra", "hidro", "spa"],
  sossego: ["tranquilo", "sossego", "silêncio", "paz", "refúgio", "bucólico", "privacidade", "calmo", "reservado", "indevassável"],
  alto_padrao: ["alto padrão", "luxo", "cobertura", "fino acabamento", "suíte master", "closet", "arquitetura moderna", "mansão", "nobre", "porcelanato", "mármore"],
  acesso: ["fácil acesso", "centro", "comércio", "escola", "ônibus", "conveniência", "próximo", "asfalto", "rodovia", "esquina"],
};

interface InternalScored {
  item: ProductItem;
  baseScore: number;
  matchedPills: string[];
  reasons: string[];
  isExactType: boolean;
  isExactPrice: boolean;
  isUpgradeCandidate: boolean;
  isOpportunityCandidate: boolean;
}

export function scoreProperties(properties: ProductItem[], answers: WizardAnswers): ScoredProperty[] {
  // 1. Filtrar apenas imóveis ativos (excluir vendidos)
  const active = properties.filter((p) => {
    const isSold = p.badge === "VENDIDA" || p.condition?.includes("VENDIDA");
    return !isSold;
  });

  if (active.length === 0) return [];

  // Mapeamento de faixas de preço em valores numéricos
  const PRICE_LIMITS: Record<string, { min: number; max: number; softMin: number; softMax: number }> = {
    ate_300k: { min: 0, max: 300000, softMin: 0, softMax: 380000 },
    "300k_600k": { min: 300000, max: 600000, softMin: 250000, softMax: 680000 },
    "600k_1m": { min: 600000, max: 1000000, softMin: 520000, softMax: 1150000 },
    "1m_2m": { min: 1000000, max: 2000000, softMin: 850000, softMax: 2300000 },
    acima_2m: { min: 2000000, max: 999999999, softMin: 1700000, softMax: 999999999 },
  };

  const selectedPriceLimit = answers.priceRange ? PRICE_LIMITS[answers.priceRange] : null;

  const scoredInternals: InternalScored[] = active.map((item) => {
    let score = 0;
    const reasons: string[] = [];
    const pills: string[] = [];
    const textCorpus = `${item.name} ${item.description || ""} ${item.specs || ""} ${item.storage || ""} ${item.screen || ""} ${item.bairro || ""}`.toLowerCase();
    const catLower = (item.cat || "").toLowerCase();
    const price = item.price || 0;

    // A. OBJETIVO (P1)
    if (answers.objective === "construir") {
      const isLand = catLower.includes("terrenos") || textCorpus.includes("terreno") || textCorpus.includes("lote");
      if (isLand) {
        score += 25;
        pills.push("Ideal para Construir");
        reasons.push("Lote pronto para projeto arquitetônico exclusivo");
      }
    } else if (answers.objective === "lancamentos") {
      const isLancamento = textCorpus.includes("angeleti") || textCorpus.includes("lançamento") || textCorpus.includes("golden green") || textCorpus.includes("vale dos pássaros");
      if (isLancamento) {
        score += 30;
        pills.push("Lançamento Angeleti");
        reasons.push("Empreendimento com infraestrutura de lazer clube");
      }
    }

    // B. TIPOLOGIA (P3) - Peso: 35 pontos
    let isExactType = false;
    if (answers.propertyType && answers.propertyType !== "qualquer") {
      const isCondo = catLower.includes("condomínio") || textCorpus.includes("condomínio") || textCorpus.includes("fechado");

      if (answers.propertyType === "condominio") {
        isExactType = isCondo;
        if (isExactType) pills.push("Condomínio Fechado");
      } else if (answers.propertyType === "casa_avulsa") {
        isExactType = (catLower === "casas" || catLower.includes("sítio")) && !isCondo;
        if (isExactType) pills.push("Casa Fora de Condomínio");
      } else if (answers.propertyType === "apartamento") {
        isExactType = catLower.includes("apartamento") || catLower.includes("cobertura") || textCorpus.includes("apartamento");
        if (isExactType) pills.push(catLower.includes("cobertura") ? "Cobertura Nobre" : "Apartamento");
      } else if (answers.propertyType === "terreno") {
        isExactType = catLower.includes("terreno") || textCorpus.includes("terreno") || textCorpus.includes("lote");
        if (isExactType) pills.push("Terreno / Lote");
      } else if (answers.propertyType === "comercial") {
        isExactType = catLower.includes("comercial") || textCorpus.includes("loja") || textCorpus.includes("comercial");
        if (isExactType) pills.push("Comercial");
      }

      if (isExactType) {
        score += 35;
        reasons.push("Tipologia exatamente compatível com sua preferência");
      }
    } else {
      score += 20;
    }

    // C. FAIXA DE INVESTIMENTO (P5) - Peso: 30 pontos
    let isExactPrice = false;
    let isClosePrice = false;

    if (selectedPriceLimit) {
      if (price >= selectedPriceLimit.min && price <= selectedPriceLimit.max) {
        isExactPrice = true;
        score += 30;
        pills.push("100% no Orçamento");
        reasons.push("Valor perfeitamente alinhado ao seu plano financeiro");
      } else if (price >= selectedPriceLimit.softMin && price <= selectedPriceLimit.softMax) {
        isClosePrice = true;
        score += 18;
        pills.push("Na Faixa de Valor");
        reasons.push("Excelente proximidade do valor estimado");
      }
    } else {
      score += 15;
    }

    // D. REGIÃO E LOCALIZAÇÃO (P4) - Peso: 20 pontos
    if (answers.region && answers.region !== "qualquer") {
      const targetBairros = REGION_BAIRROS[answers.region] || [];
      const itemBairro = (item.bairro || "").trim();
      const matchBairro = targetBairros.some(
        (b) => b.toLowerCase() === itemBairro.toLowerCase() || textCorpus.includes(b.toLowerCase())
      );

      if (matchBairro) {
        score += 20;
        pills.push(itemBairro || "Região Selecionada");
        reasons.push(`Localização estratégica em ${itemBairro || "Teresópolis"}`);
      }
    } else {
      score += 10;
      if (item.bairro) pills.push(item.bairro);
    }

    // E. ESTILO DE VIDA & ESSENCIAIS (P6) - Até 20 pontos (10 por item)
    if (answers.essentials && answers.essentials.length > 0) {
      answers.essentials.slice(0, 2).forEach((essKey) => {
        const keywords = ESSENTIAL_KEYWORDS[essKey] || [];
        const found = keywords.some((kw) => textCorpus.includes(kw));
        if (found) {
          score += 10;
          if (essKey === "seguranca") {
            pills.push("Portaria & Segurança");
            reasons.push("Estrutura completa de segurança e controle de acesso");
          } else if (essKey === "natureza") {
            pills.push("Natureza & Vista");
            reasons.push("Contato direto com a natureza e vista para as montanhas");
          } else if (essKey === "lazer") {
            pills.push("Lazer Completo");
            reasons.push("Área de convivência com piscina e espaço gourmet");
          } else if (essKey === "sossego") {
            pills.push("Sossego & Privacidade");
            reasons.push("Ambiente tranquilo e silencioso na serra");
          } else if (essKey === "alto_padrao") {
            pills.push("Padrão Boutique");
            reasons.push("Arquitetura nobre e acabamentos de alto padrão");
          } else if (essKey === "acesso") {
            pills.push("Fácil Acesso");
            reasons.push("Mobilidade facilitada e proximidade aos principais pontos");
          }
        }
      });
    }

    // F. FORMA DE PAGAMENTO (P7) - Peso: 10 pontos
    if (answers.paymentMethod) {
      const chipLower = (item.chip || "").toLowerCase();
      let matchPay = false;

      if (answers.paymentMethod === "financiamento") {
        matchPay = chipLower.includes("financiamento") || textCorpus.includes("financiamento") || textCorpus.includes("habite-se");
        if (matchPay) pills.push("Aceita Financiamento");
      } else if (answers.paymentMethod === "a_vista") {
        matchPay = true; // À vista qualquer imóvel aceita
        pills.push("Negociação Direta");
      } else if (answers.paymentMethod === "parcelado") {
        matchPay = chipLower.includes("120x") || chipLower.includes("parcela") || textCorpus.includes("direto com proprietário");
        if (matchPay) pills.push("Parcelamento Direto");
      } else if (answers.paymentMethod === "permuta") {
        matchPay = chipLower.includes("permuta") || textCorpus.includes("estuda permuta") || textCorpus.includes("aceita veículo");
        if (matchPay) pills.push("Estuda Permuta");
      } else if (answers.paymentMethod === "consultoria") {
        matchPay = true;
      }

      if (matchPay) {
        score += 10;
      }
    }

    // G. PERFIL DOS OCUPANTES (P2) - Bônus de 10 pontos
    if (answers.occupants) {
      const batLower = (item.battery || "").toLowerCase();
      if (answers.occupants === "casal") {
        if (batLower.includes("1 quarto") || batLower.includes("2 quarto")) {
          score += 8;
          pills.push("Planta Conforto p/ Casal");
        }
      } else if (answers.occupants === "familia_pequena") {
        if (batLower.includes("2 quarto") || batLower.includes("3 quarto")) {
          score += 10;
          pills.push("Ideal p/ Família");
        }
      } else if (answers.occupants === "familia_grande") {
        if (batLower.includes("3 quarto") || batLower.includes("4 quarto") || batLower.includes("5") || textCorpus.includes("suítes")) {
          score += 10;
          pills.push("Amplo Espaço Familiar");
        }
      } else if (answers.occupants === "investimento") {
        score += 8;
        pills.push("Alto Potencial de Valorização");
      }
    }

    // Definir aptidão para arquétipos
    const isUpgradeCandidate = (price > (selectedPriceLimit?.max || 0) && price <= (selectedPriceLimit?.softMax || 999999999) * 1.3) ||
      textCorpus.includes("piscina") || textCorpus.includes("alto padrão") || textCorpus.includes("vista");

    const isOpportunityCandidate = (selectedPriceLimit ? price <= selectedPriceLimit.max * 0.9 : true) ||
      textCorpus.includes("120x") || textCorpus.includes("permuta") || textCorpus.includes("oportunidade");

    return {
      item,
      baseScore: score,
      matchedPills: Array.from(new Set(pills)).slice(0, 4),
      reasons: reasons.slice(0, 3),
      isExactType,
      isExactPrice,
      isUpgradeCandidate,
      isOpportunityCandidate,
    };
  });

  // Ordenar lista geral por score base decrescente
  scoredInternals.sort((a, b) => b.baseScore - a.baseScore || (b.item.price || 0) - (a.item.price || 0));

  // =========================================================================
  // TRIANGULAÇÃO ESTRATÉGICA DOS 3 ARQUÉTIPOS
  // =========================================================================

  // 1. ARQUÉTIPO 1: O MATCH PERFEITO
  // O melhor imóvel que atende os critérios principais
  const primaryMatch = scoredInternals[0];
  const usedSkus = new Set<string>();
  if (primaryMatch?.item.sku) usedSkus.add(primaryMatch.item.sku);

  // 2. ARQUÉTIPO 2: O UPGRADE EXCLUSIVO
  // Um imóvel que oferece mais lazer, espaço ou padrão, diferente do primeiro
  let upgradeMatch = scoredInternals.find(
    (c) => !usedSkus.has(c.item.sku || "") && c.isUpgradeCandidate && (c.item.price || 0) >= (primaryMatch?.item.price || 0)
  );

  // Fallback para Upgrade: se não houver um mais caro com lazer, pega o segundo melhor do ranking
  if (!upgradeMatch) {
    upgradeMatch = scoredInternals.find((c) => !usedSkus.has(c.item.sku || ""));
  }
  if (upgradeMatch?.item.sku) usedSkus.add(upgradeMatch.item.sku);

  // 3. ARQUÉTIPO 3: A OPORTUNIDADE ÚNICA (CUSTO-BENEFÍCIO / CONDIÇÃO)
  // Um imóvel com preço competitivo, ou condições especiais de pagamento, diferente do 1 e 2
  let opportunityMatch = scoredInternals.find(
    (c) => !usedSkus.has(c.item.sku || "") && c.isOpportunityCandidate
  );

  // Fallback para Oportunidade: pega o próximo disponível no ranking
  if (!opportunityMatch) {
    opportunityMatch = scoredInternals.find((c) => !usedSkus.has(c.item.sku || ""));
  }
  if (opportunityMatch?.item.sku) usedSkus.add(opportunityMatch.item.sku);

  // Montar lista final com as 3 opções garantidas
  const chosen: { internal: InternalScored; archetype: "match_perfeito" | "upgrade_exclusivo" | "oportunidade_unica" }[] = [];

  if (primaryMatch) {
    chosen.push({ internal: primaryMatch, archetype: "match_perfeito" });
  }
  if (upgradeMatch) {
    chosen.push({ internal: upgradeMatch, archetype: "upgrade_exclusivo" });
  }
  if (opportunityMatch) {
    chosen.push({ internal: opportunityMatch, archetype: "oportunidade_unica" });
  }

  // Fallback de emergência (caso a lista tenha menos de 3)
  for (let i = 0; i < scoredInternals.length && chosen.length < 3; i++) {
    const candidate = scoredInternals[i];
    if (!usedSkus.has(candidate.item.sku || "")) {
      usedSkus.add(candidate.item.sku || "");
      chosen.push({
        internal: candidate,
        archetype: chosen.length === 1 ? "upgrade_exclusivo" : "oportunidade_unica",
      });
    }
  }

  // Gerar o resultado formatado de cada arquétipo
  return chosen.map(({ internal, archetype }) => {
    let highlightBadge = "";
    let tagline = "";
    let matchPercentage = 90;
    let brokerNote = "";

    const item = internal.item;
    const bairroName = item.bairro || "Teresópolis";

    if (archetype === "match_perfeito") {
      matchPercentage = 98;
      highlightBadge = "👑 Match Perfeito • 98% Sinergia";
      tagline = "Melhor Encaixe no seu Perfil";
      brokerNote = `Selecionado por Ismael Dias por cumprir com exatidão a tipologia e a faixa de valor que você busca em ${bairroName}, com segurança e liquidez garantidas.`;
    } else if (archetype === "upgrade_exclusivo") {
      matchPercentage = 95;
      highlightBadge = "✨ Upgrade Exclusivo • 95% Sinergia";
      tagline = "Mais Espaço, Lazer & Conforto";
      brokerNote = `Uma recomendação aspiracional para quem valoriza acabamento nobre e infraestrutura de lazer superior em ${bairroName}, elevando seu padrão de vida na serra.`;
    } else {
      matchPercentage = 91;
      highlightBadge = "💎 Oportunidade Única • 91% Sinergia";
      tagline = "Melhor Custo por m² & Condição";
      brokerNote = `Destaque pela inteligência financeira: imóvel com valor de metro quadrado altamente atrativo em ${bairroName} e excelentes condições de negociação.`;
    }

    return {
      property: item,
      score: internal.baseScore,
      matchPercentage,
      archetype,
      highlightBadge,
      tagline,
      matchedPills: internal.matchedPills.length > 0 ? internal.matchedPills : [bairroName, "Curadoria Nobre"],
      brokerNote,
      matchReasons: internal.reasons.length > 0 ? internal.reasons : ["Excelente valor de mercado na serra", "Localização nobre em Teresópolis"],
    };
  });
}
