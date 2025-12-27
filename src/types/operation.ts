/**
 * Tipos para Operações Agrícolas
 */

export type OperationStatus = "planned" | "completed";

export interface Operation {
  id: string;
  user_id: string;
  // Identificação da Operação
  operation_name: string; // Nome da operação (ex: "Pulverização Soja – Talhão 03")
  client_name: string; // Nome do cliente / fazenda
  farm_name: string; // Nome da fazenda (mantido para compatibilidade)
  field_name: string; // Talhão / área específica
  location?: string; // Localidade (Cidade / Estado) - opcional
  // Informações Agrícolas
  crop: string; // Cultura
  target_pest: string; // Praga / Doença alvo (target mantido para compatibilidade)
  target?: string; // Mantido para compatibilidade
  product_name: string; // Nome do produto aplicado
  product_id?: string; // ID do produto do catálogo (opcional)
  product?: string; // Mantido para compatibilidade
  // Dados Operacionais
  area_ha: number; // Área aplicada (ha)
  area?: number; // Mantido para compatibilidade
  dose_value: number; // Dose do produto
  dose?: number; // Mantido para compatibilidade
  dose_unit: string; // Unidade da dose (mL/ha, L/ha, etc)
  volume_l_ha: number; // Volume de aplicação (L/ha)
  water_volume?: number; // Mantido para compatibilidade
  drone_model?: string; // Modelo do drone (opcional)
  drone?: string; // Mantido para compatibilidade
  date: string; // Data da operação (ISO date string)
  operation_date?: string; // Mantido para compatibilidade
  status: OperationStatus; // Status: planned ou completed
  // Dados Financeiros
  price_charged: number; // Valor cobrado pela operação (R$)
  // Campos calculados automaticamente
  total_volume_l?: number; // Volume total de calda calculado
  total_product_quantity?: number; // Quantidade total de produto calculado
  created_at: string;
  updated_at?: string;
}

export interface OperationFormData {
  // Identificação da Operação
  operation_name: string;
  client_name: string;
  farm_name: string;
  field_name: string;
  location?: string;
  // Informações Agrícolas
  crop: string;
  target_pest: string;
  product_name: string;
  product_id?: string;
  // Dados Operacionais
  area_ha: number;
  dose_value: number;
  dose_unit: string;
  volume_l_ha: number;
  drone_model?: string;
  date: string;
  status: OperationStatus;
  // Dados Financeiros
  price_charged: number;
}

