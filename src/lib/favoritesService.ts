/**
 * Serviço de Favoritos - Salvar e gerenciar cálculos favoritos
 * Suporta Supabase (preferencial) e localStorage (fallback)
 */

import { supabase } from "./supabaseClient";
import { CalculationInput, CalculationResult } from "./calcUtils";

export interface SavedCalculationData {
  id: string;
  title: string; // Nome do cálculo (ex: "Calda para Soja – 10 ha")
  timestamp: string; // ISO string
  input: CalculationInput;
  result: CalculationResult;
  userId?: string;
}

/**
 * Gera nome automático para o cálculo
 */
function generateCalculationTitle(input: CalculationInput, result: CalculationResult): string {
  const area = input.areaHa.toFixed(1);
  const produtos = result.produtos.map((p) => p.nome).join(", ");
  
  if (produtos) {
    return `Calda ${area} ha - ${produtos}`;
  }
  return `Calda ${area} ha`;
}

/**
 * Salvar cálculo no Supabase
 */
async function saveToSupabase(
  calculation: Omit<SavedCalculationData, "id" | "timestamp">
): Promise<{ id: string | null; error: Error | null }> {
  if (!supabase) {
    return { id: null, error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { id: null, error: new Error("Usuário não autenticado") };
    }

    const { data, error } = await supabase
      .from("saved_calculations")
      .insert({
        user_id: user.id,
        title: calculation.title,
        calculation_data: {
          input: calculation.input,
          result: calculation.result,
        },
      })
      .select()
      .single();

    if (error) {
      // Se a tabela não existir, usar localStorage como fallback
      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        console.warn("⚠️ [FavoritesService] Tabela saved_calculations não encontrada, usando localStorage");
        return { id: null, error: new Error("Tabela não configurada") };
      }
      console.error("❌ [FavoritesService] Erro ao salvar no Supabase:", error);
      return { id: null, error: new Error(error.message) };
    }

    console.log("✅ [FavoritesService] Cálculo salvo no Supabase");
    return { id: data.id, error: null };
  } catch (err) {
    console.error("❌ [FavoritesService] Erro inesperado:", err);
    return { id: null, error: err as Error };
  }
}

/**
 * Salvar cálculo no localStorage
 */
async function saveToLocalStorage(
  calculation: Omit<SavedCalculationData, "id" | "timestamp">
): Promise<{ id: string; error: null }> {
  try {
    let userId: string | null = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } else {
      userId = localStorage.getItem("calc_user_id");
    }

    if (!userId) {
      // Se não tiver userId, usar chave genérica
      userId = "anonymous";
    }

    const storageKey = `calc_favorites_${userId}`;
    const existing = localStorage.getItem(storageKey);
    const favorites: SavedCalculationData[] = existing ? JSON.parse(existing) : [];

    const newCalculation: SavedCalculationData = {
      ...calculation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId,
    };

    favorites.unshift(newCalculation);
    // Limitar a 100 favoritos
    const limited = favorites.slice(0, 100);
    localStorage.setItem(storageKey, JSON.stringify(limited));

    console.log("✅ [FavoritesService] Cálculo salvo no localStorage");
    return { id: newCalculation.id, error: null };
  } catch (err) {
    console.error("❌ [FavoritesService] Erro ao salvar no localStorage:", err);
    return { id: "", error: null };
  }
}

/**
 * Salvar cálculo (tenta Supabase primeiro, fallback localStorage)
 */
export async function saveCalculation(
  input: CalculationInput,
  result: CalculationResult,
  title?: string
): Promise<{ id: string | null; error: Error | null }> {
  const calculationTitle = title || generateCalculationTitle(input, result);

  const calculation: Omit<SavedCalculationData, "id" | "timestamp"> = {
    title: calculationTitle,
    input,
    result,
  };

  // Tentar Supabase primeiro
  if (supabase) {
    const supabaseResult = await saveToSupabase(calculation);
    if (supabaseResult.id) {
      return supabaseResult;
    }
    // Se falhar mas não for erro crítico, retornar erro
    if (!supabaseResult.error?.message.includes("Tabela")) {
      return supabaseResult;
    }
  }

  // Fallback para localStorage
  console.log("📦 [FavoritesService] Usando localStorage como fallback");
  return await saveToLocalStorage(calculation);
}

/**
 * Buscar cálculos salvos do Supabase
 */
async function getFromSupabase(): Promise<{ calculations: SavedCalculationData[]; error: Error | null }> {
  if (!supabase) {
    return { calculations: [], error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { calculations: [], error: null };
    }

    const { data, error } = await supabase
      .from("saved_calculations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        console.warn("⚠️ [FavoritesService] Tabela saved_calculations não encontrada");
        return { calculations: [], error: null };
      }
      console.error("❌ [FavoritesService] Erro ao buscar do Supabase:", error);
      return { calculations: [], error: new Error(error.message) };
    }

    // Converter dados do Supabase para formato SavedCalculationData
    const calculations: SavedCalculationData[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      timestamp: row.created_at,
      input: row.calculation_data.input,
      result: row.calculation_data.result,
      userId: row.user_id,
    }));

    return { calculations, error: null };
  } catch (err) {
    console.error("❌ [FavoritesService] Erro ao buscar do Supabase:", err);
    return { calculations: [], error: err as Error };
  }
}

/**
 * Buscar cálculos salvos do localStorage
 */
async function getFromLocalStorage(): Promise<SavedCalculationData[]> {
  try {
    let userId: string | null = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } else {
      userId = localStorage.getItem("calc_user_id");
    }

    if (!userId) {
      userId = "anonymous";
    }

    const storageKey = `calc_favorites_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return [];
    }

    return JSON.parse(existing) as SavedCalculationData[];
  } catch (err) {
    console.error("❌ [FavoritesService] Erro ao buscar do localStorage:", err);
    return [];
  }
}

/**
 * Buscar todos os cálculos salvos (tenta Supabase primeiro, fallback localStorage)
 */
export async function getSavedCalculations(): Promise<SavedCalculationData[]> {
  if (supabase) {
    const { calculations, error } = await getFromSupabase();
    if (!error && calculations.length >= 0) {
      return calculations;
    }
    // Se houver erro crítico, tentar localStorage
    if (error && !error.message.includes("Tabela")) {
      return [];
    }
  }

  // Fallback para localStorage
  return await getFromLocalStorage();
}

/**
 * Remover cálculo do Supabase
 */
async function deleteFromSupabase(id: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    const { error } = await supabase
      .from("saved_calculations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Garantir que só deleta próprios cálculos

    if (error) {
      if (error.message.includes("relation") || error.message.includes("does not exist")) {
        console.warn("⚠️ [FavoritesService] Tabela saved_calculations não encontrada");
        return { error: null };
      }
      console.error("❌ [FavoritesService] Erro ao deletar do Supabase:", error);
      return { error: new Error(error.message) };
    }

    console.log("✅ [FavoritesService] Cálculo removido do Supabase");
    return { error: null };
  } catch (err) {
    console.error("❌ [FavoritesService] Erro ao deletar do Supabase:", err);
    return { error: err as Error };
  }
}

/**
 * Remover cálculo do localStorage
 */
async function deleteFromLocalStorage(id: string): Promise<{ error: Error | null }> {
  try {
    let userId: string | null = null;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } else {
      userId = localStorage.getItem("calc_user_id");
    }

    if (!userId) {
      userId = "anonymous";
    }

    const storageKey = `calc_favorites_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return { error: null };
    }

    const favorites: SavedCalculationData[] = JSON.parse(existing);
    const filtered = favorites.filter((calc) => calc.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    console.log("✅ [FavoritesService] Cálculo removido do localStorage");
    return { error: null };
  } catch (err) {
    console.error("❌ [FavoritesService] Erro ao deletar do localStorage:", err);
    return { error: err as Error };
  }
}

/**
 * Remover cálculo (tenta Supabase primeiro, fallback localStorage)
 */
export async function deleteCalculation(id: string): Promise<{ error: Error | null }> {
  if (supabase) {
    const result = await deleteFromSupabase(id);
    if (!result.error) {
      return result;
    }
    // Se falhar mas não for erro crítico, retornar erro
    if (!result.error.message.includes("Tabela")) {
      return result;
    }
  }

  // Fallback para localStorage
  return await deleteFromLocalStorage(id);
}

/**
 * Formata data para exibição
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

