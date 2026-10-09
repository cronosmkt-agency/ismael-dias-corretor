import type { ProductItem } from "@/components/ProductDetailModal";
import iphone17ProMaxBlue from "@/assets/devices/iphone-17-pro-max-blue.webp";
import iphone17ProMaxSilver from "@/assets/devices/iphone-17-pro-max-silver.webp";
import iphone17ProMaxOrange from "@/assets/devices/iphone-17-pro-max-orange.webp";
import iphone17ProSilver from "@/assets/devices/iphone-17-pro-silver.webp";
import iphone17ProBlue from "@/assets/devices/iphone-17-pro-blue.webp";
import iphone17White from "@/assets/devices/iphone-17-white.webp";
import iphone17Black from "@/assets/devices/iphone-17-black.webp";
import iphone17Blue from "@/assets/devices/iphone-17-blue.webp";
import iphone17Green from "@/assets/devices/iphone-17-green.webp";
import iphone17Purple from "@/assets/devices/iphone-17-purple.webp";
import iphone17eWhite from "@/assets/devices/iphone-17e-white.webp";
import iphone16Black from "@/assets/devices/iphone-16-black.webp";
import iphone16ProMaxDesert from "@/assets/devices/iphone-16-pro-max-desert.webp";
import iphone16ProMaxNatural from "@/assets/devices/iphone-16-pro-max-natural.webp";
import iphone16ProDesert from "@/assets/devices/iphone-16-pro-desert.webp";
import iphone16ProWhite from "@/assets/devices/iphone-16-pro-white.webp";
import iphone16White from "@/assets/devices/iphone-16-white.webp";
import iphone16eWhite from "@/assets/devices/iphone-16e-white.webp";
import iphone15ProBlue from "@/assets/devices/iphone-15-pro-blue.webp";
import iphone15Black from "@/assets/devices/iphone-15-black.webp";
import iphone14PlusBlack from "@/assets/devices/iphone-14-plus-black.webp";
import iphone14Black from "@/assets/devices/iphone-14-black.webp";
import iphone13ProMaxWhite from "@/assets/devices/iphone-13-pro-max-white.webp";
import iphone13ProMaxGraphite from "@/assets/devices/iphone-13-pro-max-graphite.webp";
import iphone13Black from "@/assets/devices/iphone-13-black.webp";
import iphone12ProMaxBlue from "@/assets/devices/iphone-12-pro-max-blue.webp";

export const DEVICE_IMAGES = {
  iphone17ProMaxBlue,
  iphone17ProMaxSilver,
  iphone17ProMaxOrange,
  iphone17ProSilver,
  iphone17ProBlue,
  iphone17White,
  iphone17Black,
  iphone17Blue,
  iphone17Green,
  iphone17Purple,
  iphone17eWhite,
  iphone16Black,
  iphone16ProMaxDesert,
  iphone16ProMaxNatural,
  iphone16ProDesert,
  iphone16ProWhite,
  iphone16White,
  iphone16eWhite,
  iphone15ProBlue,
  iphone15Black,
  iphone14PlusBlack,
  iphone14Black,
  iphone13ProMaxWhite,
  iphone13ProMaxGraphite,
  iphone13Black,
  iphone12ProMaxBlue,
};

export const STORAGE_SHEET_URL_KEY = "terephones_google_sheet_url";

export const SEMINOVOS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCLvu9VQPeShxG59dRFC6IrscERfP921wW6sKPr5_tx1SoVkuEaZadHN1OZtuoIH2A1wD6bYdX5hXN/pub?gid=0&single=true&output=csv";

export const LACRADOS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCLvu9VQPeShxG59dRFC6IrscERfP921wW6sKPr5_tx1SoVkuEaZadHN1OZtuoIH2A1wD6bYdX5hXN/pub?gid=2124590035&single=true&output=csv";

export const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCLvu9VQPeShxG59dRFC6IrscERfP921wW6sKPr5_tx1SoVkuEaZadHN1OZtuoIH2A1wD6bYdX5hXN/pubhtml";

/**
 * Intelligent image selector based on authentic iPhone model name and color/finish
 */
export function getProductImageByModel(name: string): string {
  const n = name.toLowerCase();

  // iPhone 17 Pro Max
  if (n.includes("17 pro max")) {
    if (n.includes("azul") || n.includes("blue")) {
      return iphone17ProMaxBlue;
    }
    if (n.includes("prata") || n.includes("silver") || n.includes("branco") || n.includes("white")) {
      return iphone17ProMaxSilver;
    }
    if (n.includes("laranja") || n.includes("orange") || n.includes("cosmico") || n.includes("cósmico")) {
      return iphone17ProMaxOrange;
    }
    return iphone17ProMaxSilver;
  }

  // iPhone 17 Pro
  if (n.includes("17 pro")) {
    if (n.includes("azul") || n.includes("blue")) {
      return iphone17ProBlue;
    }
    if (n.includes("prata") || n.includes("silver") || n.includes("branco") || n.includes("white")) {
      return iphone17ProSilver;
    }
    return iphone17ProSilver;
  }

  // iPhone 17e
  if (n.includes("17e")) {
    return iphone17eWhite;
  }

  // iPhone 17 base / plus
  if (n.includes("17")) {
    if (n.includes("preto") || n.includes("black")) {
      return iphone17Black;
    }
    if (n.includes("azul") || n.includes("blue")) {
      return iphone17Blue;
    }
    if (n.includes("verde") || n.includes("green")) {
      return iphone17Green;
    }
    if (n.includes("lilas") || n.includes("lilás") || n.includes("purple")) {
      return iphone17Purple;
    }
    return iphone17White;
  }

  // iPhone 16 Pro Max
  if (n.includes("16 pro max")) {
    if (n.includes("natural") || n.includes("cinza") || n.includes("gray")) {
      return iphone16ProMaxNatural;
    }
    if (n.includes("branco") || n.includes("white") || n.includes("prata") || n.includes("silver")) {
      return iphone16ProWhite;
    }
    return iphone16ProMaxDesert;
  }

  // iPhone 16 Pro
  if (n.includes("16 pro")) {
    if (n.includes("branco") || n.includes("white") || n.includes("prata") || n.includes("silver")) {
      return iphone16ProWhite;
    }
    if (n.includes("natural") || n.includes("cinza")) {
      return iphone16ProMaxNatural;
    }
    return iphone16ProDesert;
  }

  // iPhone 16e
  if (n.includes("16e")) {
    return iphone16eWhite;
  }

  // iPhone 16 base / plus
  if (n.includes("16")) {
    if (n.includes("preto") || n.includes("black")) {
      return iphone16Black;
    }
    return iphone16White;
  }

  // iPhone 15 Pro / Pro Max
  if (n.includes("15 pro")) {
    return iphone15ProBlue;
  }

  // iPhone 15 base / plus
  if (n.includes("15")) {
    return iphone15Black;
  }

  // iPhone 14 Plus
  if (n.includes("14 plus")) {
    return iphone14PlusBlack;
  }

  // iPhone 14 / 14 Pro
  if (n.includes("14")) {
    return iphone14Black;
  }

  // iPhone 13 Pro Max
  if (n.includes("13 pro max")) {
    if (n.includes("grafite") || n.includes("graphite") || n.includes("preto") || n.includes("black") || n.includes("cinza")) {
      return iphone13ProMaxGraphite;
    }
    return iphone13ProMaxWhite;
  }

  // iPhone 13 Pro
  if (n.includes("13 pro")) {
    if (n.includes("grafite") || n.includes("graphite") || n.includes("preto") || n.includes("black")) {
      return iphone13ProMaxGraphite;
    }
    return iphone13ProMaxWhite;
  }

  // iPhone 13 base / mini
  if (n.includes("13")) {
    return iphone13Black;
  }

  // iPhone 12 Pro Max
  if (n.includes("12 pro max")) {
    return iphone12ProMaxBlue;
  }

  // iPhone 12 / 11 / outros
  if (n.includes("12") || n.includes("11")) {
    return iphone12ProMaxBlue;
  }

  return iphone16ProMaxDesert;
}

/**
 * Intelligent specs auto-completer based on iPhone model
 */
export function getSpecsByModel(name: string, storage?: string, battery?: string) {
  const n = name.toLowerCase();
  const cap = storage || (n.includes("512") ? "512 GB" : n.includes("256") ? "256 GB" : "128 GB");
  const bat = battery || "Saúde 85%+ Testada";

  // iPhone 17 Pro Max
  if (n.includes("17 pro max")) {
    return {
      storage: cap,
      screen: '6.9" Super Retina XDR OLED ProMotion 120Hz',
      camera: "Tripla 48MP Fusion Pro + Ultra-Wide 48MP + Teleobjetiva 5x",
      chip: "Apple A19 Pro com Ray Tracing",
      warranty: "1 Ano de Garantia Mundial Apple",
      condition: "Novo Lacrado de Fábrica Apple",
    };
  }
  // iPhone 17 Pro
  if (n.includes("17 pro")) {
    return {
      storage: cap,
      screen: '6.3" Super Retina XDR OLED ProMotion 120Hz',
      camera: "Tripla 48MP Fusion Pro + Ultra-Wide 48MP + Teleobjetiva 5x",
      chip: "Apple A19 Pro",
      warranty: "1 Ano de Garantia Mundial Apple",
      condition: "Novo Lacrado de Fábrica Apple",
    };
  }
  // iPhone 17e
  if (n.includes("17e")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED',
      camera: "Câmera 48MP Fusion com Zoom Óptico 2x",
      chip: "Apple A19 Bionic",
      warranty: "1 Ano de Garantia Mundial Apple",
      condition: "Novo Lacrado de Fábrica Apple",
    };
  }
  // iPhone 17 base / plus
  if (n.includes("17")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED com Dynamic Island',
      camera: "Dupla 48MP Fusion + Ultra-Wide c/ Controle de Câmera",
      chip: "Apple A19 Bionic",
      warranty: "1 Ano de Garantia Mundial Apple",
      condition: "Novo Lacrado de Fábrica Apple",
    };
  }

  if (n.includes("16 pro max")) {
    return {
      storage: cap,
      screen: '6.9" Super Retina XDR ProMotion 120Hz',
      camera: "Tripla 48MP Fusion + Ultra-Wide 48MP + Teleobjetiva 5x",
      chip: "Apple A18 Pro com Ray Tracing",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("16 pro")) {
    return {
      storage: cap,
      screen: '6.3" Super Retina XDR ProMotion 120Hz',
      camera: "Tripla 48MP Fusion + Ultra-Wide 48MP + Teleobjetiva 5x",
      chip: "Apple A18 Pro",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("16e")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED',
      camera: "Câmera 48MP Fusion com Zoom 2x",
      chip: "Apple A18",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("16")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR com Dynamic Island',
      camera: "Dupla 48MP Fusion + Ultra-Wide c/ Controle de Câmera",
      chip: "Apple A18 Bionic",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("15 pro")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED 120Hz ProMotion',
      camera: "Tripla 48MP + Teleobjetiva 3x + Macro",
      chip: "A17 Pro (Arquitetura 3nm)",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("15")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR com Dynamic Island',
      camera: "Dupla 48MP c/ zoom óptico 2x de alta resolução",
      chip: "A16 Bionic Ultra Rápido",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("14 plus")) {
    return {
      storage: cap,
      screen: '6.7" Super Retina XDR OLED tela grande',
      camera: "Dupla 12MP Avançada c/ Modo Ação e Cinema",
      chip: "A15 Bionic com GPU de 5 núcleos",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("14 pro")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR Always-On 120Hz',
      camera: "Sistema Pro 48MP com sensor quad-pixel",
      chip: "A16 Bionic com Neural Engine",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("14")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED True Tone',
      camera: "Dupla 12MP Avançada c/ Gravação 4K HDR",
      chip: "A15 Bionic com GPU de 5 núcleos",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("13 pro max")) {
    return {
      storage: cap,
      screen: '6.7" Super Retina XDR 120Hz ProMotion',
      camera: "Sistema Pro Triplo 12MP com Teleobjetiva 3x",
      chip: "A15 Bionic Alta Performance",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("13 pro")) {
    return {
      storage: cap,
      screen: '6.1" ProMotion 120Hz Super Fluida',
      camera: "Sistema Pro Triplo 12MP com modo macro e tele 3x",
      chip: "A15 Bionic Alta Performance",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("13")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED brilhante',
      camera: "Dupla 12MP c/ Estabilização Sensor-Shift",
      chip: "A15 Bionic Super Eficiente",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+",
    };
  }
  if (n.includes("12 pro max")) {
    return {
      storage: cap,
      screen: '6.7" Super Retina XDR OLED tela grande',
      camera: "Sistema Pro Triplo 12MP com Sensor LiDAR",
      chip: "A14 Bionic com conexão 5G",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+ Impecável",
    };
  }
  if (n.includes("12")) {
    return {
      storage: cap,
      screen: '6.1" Super Retina XDR OLED HDR10',
      camera: "Dupla 12MP c/ Modo Noturno em todas as lentes",
      chip: "A14 Bionic com conexão 5G",
      warranty: "90 Dias de Garantia Terephones",
      condition: "Seminovo Grade A+",
    };
  }
  return {
    storage: cap,
    screen: '6.1" Retina Display',
    camera: "Câmera Apple Avançada",
    chip: "Apple Bionic Chip",
    warranty: "90 Dias de Garantia Terephones",
    condition: "Seminovo Grade A+",
  };
}

/**
 * Normalizes any Google Sheets link to a public CSV download URL
 */
export function normalizeGoogleSheetUrl(inputUrl: string): string {
  const trimmed = inputUrl.trim();
  if (!trimmed) return "";

  // If already a published CSV export URL
  if (trimmed.includes("output=csv") || trimmed.includes("format=csv")) {
    return trimmed;
  }

  // If public web published doc: https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml...
  const pubMatch = trimmed.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv`;
  }

  // Standard sheet URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch && idMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
  }

  // If user just pasted the raw ID
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return `https://docs.google.com/spreadsheets/d/${trimmed}/export?format=csv`;
  }

  return trimmed;
}

/**
 * Parses CSV text taking into account quoted fields with commas and linebreaks
 */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === "," || char === "\t" || char === ";") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Cleans and standardizes raw iPhone model name from spreadsheet
 */
/**
 * Cleans and standardizes raw iPhone model name from spreadsheet
 */
export function cleanModelName(rawModel: string): string {
  let name = rawModel
    .replace(/\s+/g, " ")
    .replace(/\(\s*seminovo\s*\)/gi, "")
    .replace(/\(\s*lacrado\s*\)/gi, "")
    .replace(/\(\s*novo\s*\)/gi, "")
    .trim();

  // Normalize 128B / 256B to 128GB / 256GB
  name = name.replace(/\b(\d+)\s*b\b/gi, "$1GB");

  name = name
    .split(" ")
    .map((w) => {
      const lower = w.toLowerCase();
      if (/^\d+gb$/i.test(lower) || /^\d+tb$/i.test(lower)) return lower.toUpperCase();
      if (lower === "gb" || lower === "tb") return lower.toUpperCase();
      if (lower === "iphone") return "iPhone";
      if (lower === "16e") return "16e";
      if (lower === "17e") return "17e";
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");

  if (!name.toLowerCase().startsWith("iphone")) {
    name = "iPhone " + name;
  }

  return name;
}

/**
 * Extracts normalized storage string (e.g. "256 GB") from raw model string
 */
export function parseStorage(rawModel: string): string {
  const match = rawModel.match(/(\d+\s*gb|\d+\s*tb|\d+\s*b)/i);
  if (!match) return "128 GB";
  const s = match[1].toUpperCase().replace(/\s+/g, "");
  if (s.endsWith("GB") || s.endsWith("TB")) return s.replace(/(GB|TB)/, " $1");
  if (s.endsWith("B")) return s.slice(0, -1) + " GB";
  return s + " GB";
}

/**
 * Parses Seminovos tab rows into individual ProductItem units with battery health
 */
export function transformSeminovosCsv(rows: string[][]): ProductItem[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) =>
    h
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  );

  const modelIdx = headers.findIndex((h) => h.includes("modelo") || h.includes("aparelho"));
  const batteryIdx = headers.findIndex((h) => h === "%" || h.includes("bateria") || h.includes("saude"));
  const priceIdx = headers.findIndex((h) => h.includes("preco") || h.includes("valor") || h.includes("venda"));
  const statusIdx = headers.findIndex((h) => h.includes("status") || h.includes("dispon") || h.includes("cliente"));
  const imeiIdx = headers.findIndex((h) => h.includes("imei"));
  const imgIdx = headers.findIndex((h) => h.includes("imagem") || h.includes("foto") || h.includes("url"));

  if (modelIdx === -1) return [];

  const products: ProductItem[] = [];
  const seenCount: Record<string, number> = {};

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rawModel = row[modelIdx]?.trim();
    if (!rawModel || rawModel.toLowerCase().includes("total")) continue;

    if (statusIdx !== -1) {
      const statusValue = row[statusIdx]?.trim().toLowerCase() || "";
      if (statusValue.includes("vendido") || statusValue.includes("entregue")) {
        continue;
      }
    }

    const rawBattery = batteryIdx !== -1 ? row[batteryIdx]?.trim() || "" : "";
    const rawPrice = priceIdx !== -1 ? row[priceIdx]?.trim() || "" : "";
    const customImg = imgIdx !== -1 ? row[imgIdx]?.trim() || "" : "";
    const imei = imeiIdx !== -1 ? row[imeiIdx]?.trim() || "" : "";

    let priceNumber = 0;
    if (rawPrice) {
      const cleaned = rawPrice
        .replace(/[^\d.,]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");
      priceNumber = parseFloat(cleaned) || 0;
    }

    let batteryText = rawBattery;
    let badgeText = "Seminovo Grade A+";
    if (rawBattery) {
      if (/^\d+%?$/.test(rawBattery)) {
        const num = rawBattery.replace("%", "");
        batteryText = `${num}% de Saúde Original`;
        badgeText = `Bateria ${num}%`;
      } else if (rawBattery.toLowerCase().includes("trocada")) {
        batteryText = "Bateria Nova Trocada (100% Saúde)";
        badgeText = "Bateria 100% Nova";
      } else {
        batteryText = rawBattery;
        badgeText = rawBattery;
      }
    }

    const baseName = cleanModelName(rawModel);
    const storage = parseStorage(rawModel);

    // Deduplicate title if identical model and battery exist
    const key = `${baseName}_${badgeText}`;
    seenCount[key] = (seenCount[key] || 0) + 1;
    const displayName = seenCount[key] > 1 ? `${baseName} (Unid. ${seenCount[key]})` : baseName;

    const specs = getSpecsByModel(baseName, storage, batteryText);
    const image = customImg || getProductImageByModel(baseName);

    products.push({
      name: displayName,
      price: priceNumber,
      cat: "Seminovos",
      badge: badgeText,
      img: image,
      specs: `${storage} • ${badgeText} • Pronta Entrega`,
      storage: specs.storage,
      condition: specs.condition || "Seminovo Grade A+ Impecável",
      warranty: specs.warranty || "90 Dias de Garantia Terephones",
      battery: batteryText,
      screen: specs.screen,
      camera: specs.camera,
      chip: specs.chip,
      quantity: 1,
      imeis: imei ? [imei] : [],
    });
  }

  return products;
}

/**
 * Parses Lacrados tab rows, grouping duplicate sealed units into 1 catalog card with quantity
 */
export function transformLacradosCsv(rows: string[][]): ProductItem[] {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) =>
    h
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  );

  const modelIdx = headers.findIndex((h) => h.includes("modelo") || h.includes("aparelho"));
  const priceIdx = headers.findIndex((h) => h.includes("preco") || h.includes("valor") || h.includes("venda"));
  const statusIdx = headers.findIndex((h) => h.includes("status") || h.includes("dispon") || h.includes("cliente"));
  const imeiIdx = headers.findIndex((h) => h.includes("imei"));
  const imgIdx = headers.findIndex((h) => h.includes("imagem") || h.includes("foto") || h.includes("url"));

  if (modelIdx === -1) return [];

  interface GroupedLacrado {
    name: string;
    rawModel: string;
    price: number;
    customImg?: string;
    imeis: string[];
  }

  const groupMap = new Map<string, GroupedLacrado>();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rawModel = row[modelIdx]?.trim();
    if (!rawModel || rawModel.toLowerCase().includes("total")) continue;

    if (statusIdx !== -1) {
      const statusValue = row[statusIdx]?.trim().toLowerCase() || "";
      if (statusValue.includes("vendido") || statusValue.includes("entregue")) {
        continue;
      }
    }

    const rawPrice = priceIdx !== -1 ? row[priceIdx]?.trim() || "" : "";
    const customImg = imgIdx !== -1 ? row[imgIdx]?.trim() || "" : "";
    const imei = imeiIdx !== -1 ? row[imeiIdx]?.trim() || "" : "";

    let priceNumber = 0;
    if (rawPrice) {
      const cleaned = rawPrice
        .replace(/[^\d.,]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");
      priceNumber = parseFloat(cleaned) || 0;
    }

    const baseName = cleanModelName(rawModel);
    const key = `${baseName.toLowerCase()}_${priceNumber}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        name: baseName,
        rawModel,
        price: priceNumber,
        customImg,
        imeis: [],
      });
    }

    const item = groupMap.get(key)!;
    if (imei) item.imeis.push(imei);
  }

  const products: ProductItem[] = [];

  for (const group of groupMap.values()) {
    const count = group.imeis.length > 0 ? group.imeis.length : 1;
    const storage = parseStorage(group.rawModel);

    const badgeText = count > 1 ? `📦 ${count} un. Lacradas` : "Novo Lacrado Apple";
    const specs = getSpecsByModel(group.name, storage, "100% de Fábrica");
    const image = group.customImg || getProductImageByModel(group.name);

    products.push({
      name: group.name,
      price: group.price,
      cat: "Novos",
      badge: badgeText,
      img: image,
      specs: `${storage} • Novo Lacrado • ${count > 1 ? `${count} un. disponíveis • ` : ""}Pronta Entrega`,
      storage: specs.storage,
      condition: "Novo Lacrado de Fábrica Apple (1 Ano Garantia Mundial)",
      warranty: "1 Ano de Garantia Mundial Apple",
      battery: "100% Bateria de Fábrica",
      screen: specs.screen,
      camera: specs.camera,
      chip: specs.chip,
      quantity: count,
      imeis: group.imeis,
    });
  }

  return products;
}

/**
 * Converts parsed CSV rows into ProductItem array
 */
export function transformCsvToProducts(rows: string[][]): ProductItem[] {
  if (rows.length < 2) return [];

  // Check if rows look predominantly like Lacrados
  const isLacradoSheet = rows.some((r) =>
    r.some((c) => c.toLowerCase().includes("lacrado"))
  );

  if (isLacradoSheet) {
    return transformLacradosCsv(rows);
  }

  return transformSeminovosCsv(rows);
}

/**
 * Fetches and syncs inventory from Google Sheets (both Seminovos and Lacrados tabs)
 */
export async function fetchGoogleSheetInventory(sheetUrl: string = DEFAULT_SHEET_URL): Promise<ProductItem[]> {
  const isDefaultDoc =
    !sheetUrl ||
    sheetUrl === DEFAULT_SHEET_URL ||
    sheetUrl.includes("2PACX-1vQCLvu9VQPeShxG59dRFC6IrscERfP921wW6sKPr5_tx1SoVkuEaZadHN1OZtuoIH2A1wD6bYdX5hXN");

  // Fetch both Seminovos and Lacrados tabs concurrently
  if (isDefaultDoc) {
    try {
      const [semRes, lacRes] = await Promise.allSettled([
        fetch(SEMINOVOS_SHEET_URL, {
          cache: "no-store",
          headers: { Accept: "text/csv,text/plain" },
        }),
        fetch(LACRADOS_SHEET_URL, {
          cache: "no-store",
          headers: { Accept: "text/csv,text/plain" },
        }),
      ]);

      const items: ProductItem[] = [];

      // Parse Lacrados first (iPhone 17 and factory sealed models)
      if (lacRes.status === "fulfilled" && lacRes.value.ok) {
        const text = await lacRes.value.text();
        const rows = parseCSV(text);
        const lacProducts = transformLacradosCsv(rows);
        items.push(...lacProducts);
      }

      // Parse Seminovos
      if (semRes.status === "fulfilled" && semRes.value.ok) {
        const text = await semRes.value.text();
        const rows = parseCSV(text);
        const semProducts = transformSeminovosCsv(rows);
        items.push(...semProducts);
      }

      if (items.length > 0) {
        return items;
      }
    } catch {
      // Fallback to single URL parser below
    }
  }

  // Single CSV fallback
  const csvUrl = normalizeGoogleSheetUrl(sheetUrl);
  if (!csvUrl) {
    throw new Error("URL da planilha inválida ou vazia.");
  }

  const response = await fetch(csvUrl, {
    cache: "no-store",
    headers: {
      Accept: "text/csv,text/plain",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar planilha (status ${response.status}). Verifique se foi publicada como CSV.`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);
  const products = transformCsvToProducts(rows);

  if (products.length === 0) {
    throw new Error("Nenhum produto válido encontrado na planilha.");
  }

  return products;
}
