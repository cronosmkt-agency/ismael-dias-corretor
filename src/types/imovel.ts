/**
 * Tipagens unificadas para os imóveis da Habittat House
 */

export interface ProductItem {
  name: string;
  price: number;
  cat: string;
  badge: string;
  img: string;
  images?: string[];
  specs?: string;
  storage?: string;
  condition?: string;
  warranty?: string;
  battery?: string;
  screen?: string;
  camera?: string;
  chip?: string;
  boxItems?: string[];
  features?: string[];
  quantity?: number;
  imeis?: string[];
  sku?: string;
  description?: string;
  bairro?: string;
  url?: string;
  instagram?: string;
  instagramUrl?: string;
}
