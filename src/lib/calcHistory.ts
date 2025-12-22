import { CalculationInput, CalculationResult } from "./calcUtils";

export interface SavedCalculation {
  id: string;
  timestamp: string;
  input: CalculationInput;
  result: CalculationResult;
  isFavorite?: boolean;
  name?: string;
}

const STORAGE_KEY = "calc_history";

/**
 * Obtém todos os cálculos salvos
 */
export function getSavedCalculations(): SavedCalculation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    return JSON.parse(saved) as SavedCalculation[];
  } catch (err) {
    console.error("Erro ao ler cálculos salvos:", err);
    return [];
  }
}

/**
 * Salva um novo cálculo
 */
export function saveCalculation(calculation: Omit<SavedCalculation, "id" | "timestamp">): SavedCalculation {
  const saved = getSavedCalculations();
  
  const newCalculation: SavedCalculation = {
    ...calculation,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    isFavorite: calculation.isFavorite || false,
  };

  saved.unshift(newCalculation);
  const limited = saved.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));

  return newCalculation;
}

/**
 * Remove um cálculo pelo ID
 */
export function deleteCalculation(id: string): boolean {
  try {
    const saved = getSavedCalculations();
    const filtered = saved.filter(calc => calc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    toggleFavorite(id, false);
    return true;
  } catch (err) {
    console.error("Erro ao deletar cálculo:", err);
    return false;
  }
}

/**
 * Alterna o status de favorito de um cálculo
 */
export function toggleFavorite(id: string, isFavorite?: boolean): boolean {
  try {
    const saved = getSavedCalculations();
    const calculation = saved.find(calc => calc.id === id);
    
    if (!calculation) {
      return false;
    }

    const newFavoriteStatus = isFavorite !== undefined ? isFavorite : !calculation.isFavorite;
    calculation.isFavorite = newFavoriteStatus;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    return true;
  } catch (err) {
    console.error("Erro ao favoritar cálculo:", err);
    return false;
  }
}

/**
 * Obtém apenas os cálculos favoritados
 */
export function getFavoriteCalculations(): SavedCalculation[] {
  const saved = getSavedCalculations();
  return saved.filter(calc => calc.isFavorite === true);
}

/**
 * Atualiza o nome de um cálculo
 */
export function updateCalculationName(id: string, name: string): boolean {
  try {
    const saved = getSavedCalculations();
    const calculation = saved.find(calc => calc.id === id);
    
    if (!calculation) {
      return false;
    }

    calculation.name = name.trim() || undefined;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    return true;
  } catch (err) {
    console.error("Erro ao atualizar nome do cálculo:", err);
    return false;
  }
}

/**
 * Formata a data para exibição
 */
export function formatCalculationDate(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "Agora";
    } else if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays < 7) {
      return `${diffDays}d atrás`;
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch (err) {
    return timestamp;
  }
}
