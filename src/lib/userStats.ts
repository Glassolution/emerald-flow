import { supabase } from "./supabaseClient";

export interface UserStats {
  totalCalculations: number;
  savedCalculations: number;
  totalHectares: number;
}

/**
 * Obtém as estatísticas do usuário do user_metadata
 */
export async function getUserStats(): Promise<{ stats: UserStats | null; error: Error | null }> {
  if (!supabase) {
    return { stats: null, error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { stats: null, error: new Error("Usuário não autenticado") };
    }

    const metadata = user.user_metadata || {};
    
    const stats: UserStats = {
      totalCalculations: metadata.total_calculations || 0,
      savedCalculations: metadata.saved_calculations || 0,
      totalHectares: metadata.total_hectares || 0,
    };

    return { stats, error: null };
  } catch (err) {
    console.error("❌ [UserStats] Erro ao ler estatísticas:", err);
    return { stats: null, error: err as Error };
  }
}

/**
 * Incrementa o contador de cálculos realizados
 */
export async function incrementCalculations(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    const metadata = user.user_metadata || {};
    const currentCount = metadata.total_calculations || 0;

    const { error } = await supabase.auth.updateUser({
      data: {
        ...metadata,
        total_calculations: currentCount + 1,
      },
    });

    if (error) {
      console.error("❌ [UserStats] Erro ao incrementar cálculos:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("❌ [UserStats] Erro inesperado:", err);
    return { error: err as Error };
  }
}

/**
 * Incrementa o contador de cálculos salvos
 */
export async function incrementSavedCalculations(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    const metadata = user.user_metadata || {};
    const currentCount = metadata.saved_calculations || 0;

    const { error } = await supabase.auth.updateUser({
      data: {
        ...metadata,
        saved_calculations: currentCount + 1,
      },
    });

    if (error) {
      console.error("❌ [UserStats] Erro ao incrementar salvos:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("❌ [UserStats] Erro inesperado:", err);
    return { error: err as Error };
  }
}

/**
 * Adiciona hectares ao total do usuário
 */
export async function addHectares(hectares: number): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  if (hectares <= 0) {
    return { error: null }; // Não adiciona se for 0 ou negativo
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    const metadata = user.user_metadata || {};
    const currentTotal = metadata.total_hectares || 0;

    const { error } = await supabase.auth.updateUser({
      data: {
        ...metadata,
        total_hectares: currentTotal + hectares,
      },
    });

    if (error) {
      console.error("❌ [UserStats] Erro ao adicionar hectares:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("❌ [UserStats] Erro inesperado:", err);
    return { error: err as Error };
  }
}


