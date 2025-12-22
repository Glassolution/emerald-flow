/**
 * Utilitários para cálculos da Calculadora de Calda
 */

export type DoseMode = 'por_ha' | 'por_volume';
export type ProductUnit = 'mL' | 'L' | 'g' | 'kg';

export interface Product {
  id?: string;
  name?: string;
  mode: DoseMode;
  dose: number;
  unit: ProductUnit;
}

export interface CalculationInput {
  areaHa: number;
  taxaLHa: number; // L/ha
  volumeTanqueL: number; // L
  products: Product[];
}

export interface CalculationErrors {
  fieldErrors?: {
    areaHa?: string;
    taxaLHa?: string;
    volumeTanqueL?: string;
    products?: string[];
  };
  messages?: string[];
}

export interface CalculationResult {
  volumeTotalL: number;
  numeroTanques: number;
  volumesPorTanque: number[];
  produtosTotal: {
    productName: string;
    totalQuantity: number;
    unit: ProductUnit;
  }[];
  produtosPorTanque: {
    tankNumber: number;
    volume: number;
    products: {
      productName: string;
      quantity: number;
      unit: ProductUnit;
    }[];
  }[];
}

/**
 * Converte unidades para cálculo interno (sempre trabalhar em L ou kg)
 */
function convertToBaseUnit(value: number, unit: ProductUnit, targetUnit: 'L' | 'kg'): number {
  if (targetUnit === 'L') {
    // Converter para litros
    if (unit === 'mL') return value / 1000;
    if (unit === 'L') return value;
    // g e kg não são volumes, retornar como está para produtos sólidos
    return value;
  } else {
    // Converter para kg
    if (unit === 'g') return value / 1000;
    if (unit === 'kg') return value;
    // mL e L não são massas, retornar como está
    return value;
  }
}

/**
 * Converte de unidade base para unidade de exibição
 */
function convertFromBaseUnit(value: number, fromBase: 'L' | 'kg', toUnit: ProductUnit): number {
  if (fromBase === 'L') {
    if (toUnit === 'mL') return value * 1000;
    if (toUnit === 'L') return value;
  } else {
    if (toUnit === 'g') return value * 1000;
    if (toUnit === 'kg') return value;
  }
  return value;
}

/**
 * Formata um número com casas decimais
 */
export function formatNumber(value: number, decimals: number = 2): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Função principal de cálculo
 * Retorna o resultado ou null em caso de erro
 */
export function calculateCalda(
  input: CalculationInput
): { result: CalculationResult; errors?: CalculationErrors } | { result: null; errors: CalculationErrors } {
  const errors: CalculationErrors = {
    fieldErrors: {},
    messages: [],
  };

  // Validações de campos obrigatórios
  if (!input.areaHa || input.areaHa <= 0) {
    errors.fieldErrors!.areaHa = 'Área a aplicar deve ser maior que zero';
    errors.messages!.push('Área a aplicar inválida');
  }

  if (!input.taxaLHa || input.taxaLHa <= 0) {
    errors.fieldErrors!.taxaLHa = 'Taxa de aplicação deve ser maior que zero';
    errors.messages!.push('Taxa de aplicação inválida');
  }

  if (!input.volumeTanqueL || input.volumeTanqueL <= 0) {
    errors.fieldErrors!.volumeTanqueL = 'Volume do tanque deve ser maior que zero';
    errors.messages!.push('Volume do tanque inválido');
  }

  // Validar produtos
  if (!input.products || input.products.length === 0) {
    errors.fieldErrors!.products = ['Adicione pelo menos um produto'];
    errors.messages!.push('Nenhum produto adicionado');
  } else {
    const productErrors: string[] = [];
    input.products.forEach((product, index) => {
      if (!product.dose || product.dose <= 0) {
        productErrors.push(`Produto ${index + 1}: dose deve ser maior que zero`);
      }
    });
    if (productErrors.length > 0) {
      errors.fieldErrors!.products = productErrors;
    }
  }

  // Se houver erros, retornar
  if (errors.messages!.length > 0 || Object.keys(errors.fieldErrors!).length > 0) {
    return { result: null, errors };
  }

  // Cálculo do volume total de calda
  const volumeTotalL = input.areaHa * input.taxaLHa;

  // Cálculo do número de tanques
  const numeroTanques = Math.ceil(volumeTotalL / input.volumeTanqueL);

  // Calcular volumes por tanque
  const volumesPorTanque: number[] = [];
  for (let i = 0; i < numeroTanques; i++) {
    if (i === numeroTanques - 1) {
      // Último tanque
      const volumeUltimo = volumeTotalL - input.volumeTanqueL * (numeroTanques - 1);
      volumesPorTanque.push(volumeUltimo);
    } else {
      volumesPorTanque.push(input.volumeTanqueL);
    }
  }

  // Calcular produtos por tanque e totais
  const produtosPorTanque: CalculationResult['produtosPorTanque'] = [];
  const produtosTotal: CalculationResult['produtosTotal'] = [];

  volumesPorTanque.forEach((volumeTanque, tankIndex) => {
    const tankProducts: CalculationResult['produtosPorTanque'][0]['products'] = [];

    input.products.forEach((product) => {
      let produtoPorTanque: number;
      let produtoTotal: number;

      if (product.mode === 'por_ha') {
        // Modo por hectare
        const areaPorTanque = volumeTanque / input.taxaLHa;
        produtoPorTanque = product.dose * areaPorTanque;
        produtoTotal = product.dose * input.areaHa;
      } else {
        // Modo por volume (dose por L)
        produtoPorTanque = product.dose * volumeTanque;
        produtoTotal = product.dose * volumeTotalL;
      }

      tankProducts.push({
        productName: product.name || `Produto ${tankIndex + 1}`,
        quantity: produtoPorTanque,
        unit: product.unit,
      });

      // Adicionar ao total (apenas no primeiro tanque para evitar duplicação)
      if (tankIndex === 0) {
        produtosTotal.push({
          productName: product.name || `Produto`,
          totalQuantity: produtoTotal,
          unit: product.unit,
        });
      }
    });

    produtosPorTanque.push({
      tankNumber: tankIndex + 1,
      volume: volumeTanque,
      products: tankProducts,
    });
  });

  return {
    result: {
      volumeTotalL,
      numeroTanques,
      volumesPorTanque,
      produtosTotal,
      produtosPorTanque,
    },
  };
}

