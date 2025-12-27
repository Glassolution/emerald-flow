/**
 * Utilitários para formatação de moeda brasileira (R$)
 */

/**
 * Formata um número como moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como "R$ 1.234,56"
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Remove formatação de moeda e retorna número
 * @param value - String formatada como "R$ 1.234,56" ou "1234.56"
 * @returns Número limpo
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  
  // Remove tudo exceto números, vírgula e ponto
  const cleaned = value.replace(/[^\d,.-]/g, "");
  
  // Substitui vírgula por ponto para parseFloat
  const normalized = cleaned.replace(",", ".");
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}


