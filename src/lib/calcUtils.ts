/**
 * Calculadora de Calda Simplificada para Pilotos de Drone
 * Lógica simples e direta, pensada para o campo
 */

export type ProductUnit = 'mL' | 'L';

export interface Product {
  id?: string;
  name?: string;
  dose: number; // Dose por hectare
  unit: ProductUnit;
}

export interface CalculationInput {
  areaHa: number;           // Área a aplicar (hectares)
  taxaLHa: number;          // Litros por hectare
  volumeTanqueL: number;    // Capacidade do tanque (litros)
  products: Product[];
}

export interface CalculationResult {
  // PASSO 1: Volume total de calda
  volumeTotalL: number;
  
  // PASSO 2: Número de tanques
  numeroTanques: number;
  
  // PASSO 3 e 4: Produtos
  produtos: {
    nome: string;
    doseHa: number;
    unit: ProductUnit;
    totalProduto: number;      // Produto total no trabalho
    produtoPorTanque: number;  // Produto por tanque
  }[];
}

export interface CalculationErrors {
  messages: string[];
}

/**
 * Formata número com casas decimais
 */
export function formatNumber(value: number, decimals: number = 2): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Cálculo de calda simplificado
 * Seguindo exatamente a lógica do piloto
 */
export function calculateCalda(
  input: CalculationInput
): { result: CalculationResult; errors?: CalculationErrors } | { result: null; errors: CalculationErrors } {
  const errors: string[] = [];

  // Validações simples
  if (!input.areaHa || input.areaHa <= 0) {
    errors.push('Informe a área em hectares');
  }

  if (!input.taxaLHa || input.taxaLHa <= 0) {
    errors.push('Informe quantos litros por hectare');
  }

  if (!input.volumeTanqueL || input.volumeTanqueL <= 0) {
    errors.push('Informe o volume do tanque');
  }

  if (!input.products || input.products.length === 0) {
    errors.push('Adicione pelo menos um produto');
  } else {
    input.products.forEach((product, index) => {
      if (!product.dose || product.dose <= 0) {
        errors.push(`Produto ${index + 1}: informe a dose por hectare`);
      }
    });
  }

  if (errors.length > 0) {
    return { result: null, errors: { messages: errors } };
  }

  // ========================
  // PASSO 1 — VOLUME TOTAL DE CALDA
  // ========================
  // Volume total = Área × Litros por hectare
  const volumeTotalL = input.areaHa * input.taxaLHa;

  // ========================
  // PASSO 2 — NÚMERO DE TANQUES
  // ========================
  // Número de tanques = Volume total ÷ Volume do tanque (arredonda para cima)
  const numeroTanques = Math.ceil(volumeTotalL / input.volumeTanqueL);

  // ========================
  // PASSO 3 e 4 — PRODUTOS
  // ========================
  const produtos = input.products.map((product, index) => {
    // PASSO 3: Produto total = Área × Dose por hectare
    const totalProduto = input.areaHa * product.dose;
    
    // PASSO 4: Produto por tanque = Produto total ÷ Número de tanques
    const produtoPorTanque = totalProduto / numeroTanques;

    return {
      nome: product.name || `Produto ${index + 1}`,
      doseHa: product.dose,
      unit: product.unit,
      totalProduto: formatNumber(totalProduto),
      produtoPorTanque: formatNumber(produtoPorTanque),
    };
  });

  return {
    result: {
      volumeTotalL: formatNumber(volumeTotalL),
      numeroTanques,
      produtos,
    },
  };
}
