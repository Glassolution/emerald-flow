/**
 * Tipos para Receitas de Calda
 * Receitas são misturas pré-definidas de produtos com doses específicas
 */

import type { ProductUnit } from "./product";

export interface RecipeProduct {
  id: string;
  name: string;
  dose: number;
  unit: ProductUnit;
  category: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  products: RecipeProduct[];
  area_ha: number; // Área padrão para a receita
  volume_tanque_l: number; // Volume do tanque padrão
  taxa_l_ha: number; // Taxa de aplicação padrão
  tags?: string[]; // Ex: ["soja", "milho", "herbicida"]
  is_public: boolean; // Se a receita é pública ou privada
  created_at: string;
  updated_at?: string;
}

export interface RecipeFormData {
  name: string;
  description?: string;
  products: RecipeProduct[];
  area_ha: number;
  volume_tanque_l: number;
  taxa_l_ha: number;
  tags?: string[];
  is_public: boolean;
}


