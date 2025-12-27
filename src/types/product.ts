/**
 * Tipos para o Catálogo de Produtos
 */

export type ProductCategory = "Herbicida" | "Inseticida" | "Fungicida" | "Fertilizante" | "Adjuvante";
export type ProductUnit = "mL" | "L" | "g" | "kg" | "mL/L";
export type ProductClass = "Sistêmico" | "Contato" | "N/A";
export type ProductType = "Pré" | "Pós" | "N/A";
export type TargetType = "Daninha" | "Praga" | "Doença" | "Nutrição" | "N/A";

export interface ProductBadge {
  category: ProductCategory;
  class?: ProductClass;
  type?: ProductType;
  periculosidade?: string;
  intervaloSeguranca?: string; // Ex: "30 dias"
}

export interface ProductDetails {
  description: string;
  doseMin?: number;
  doseMax?: number;
  recommendations: string;
  notes?: string;
  compatibility?: string;
}

/**
 * Produto padrão do app (hardcoded)
 */
export interface DefaultProduct {
  id: string;
  name: string;
  category: ProductCategory;
  doseValue: number;
  doseUnit: ProductUnit;
  indication: string; // 1 linha resumo
  imageUrl?: string; // URL ou path local
  badges?: ProductBadge;
  details?: ProductDetails;
}

/**
 * Produto personalizado do usuário (Supabase)
 */
export interface CustomProduct {
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  description: string;
  dose_value: number;
  dose_unit: ProductUnit;
  dose_min?: number | null;
  dose_max?: number | null;
  recommendations?: string | null;
  notes?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
}

/**
 * Produto unificado (para exibição)
 */
export interface CatalogProduct {
  id: string;
  name: string;
  category: ProductCategory;
  doseValue: number;
  doseUnit: ProductUnit;
  indication: string;
  imageUrl?: string;
  badges?: ProductBadge;
  details?: ProductDetails;
  isCustom: boolean;
  customId?: string; // ID do produto custom se for custom
}

/**
 * Filtros para busca
 */
export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  targetType?: TargetType;
  unit?: ProductUnit;
  showOnlyCustom?: boolean;
}


