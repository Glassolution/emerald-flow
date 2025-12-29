/**
 * Serviço de Receitas - Gerenciar receitas de calda pré-definidas
 * Suporta Supabase (preferencial) e localStorage (fallback)
 */

import { supabase } from "./supabaseClient";
import { classifySupabaseError, isTableNotFoundError } from "./supabaseErrorHandler";
import type { Recipe, RecipeFormData } from "@/types/recipe";

/**
 * Salvar receita no Supabase
 */
async function saveToSupabase(
  userId: string,
  recipe: RecipeFormData
): Promise<{ id: string | null; error: Error | null }> {
  if (!supabase) {
    return { id: null, error: new Error("Supabase não configurado") };
  }

  try {
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        name: recipe.name,
        description: recipe.description || null,
        products: recipe.products,
        area_ha: recipe.area_ha,
        volume_tanque_l: recipe.volume_tanque_l,
        taxa_l_ha: recipe.taxa_l_ha,
        tags: recipe.tags || [],
        is_public: recipe.is_public || false,
      })
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        console.warn("⚠️ [RecipesService] Tabela recipes não encontrada, usando localStorage");
        return { id: null, error: new Error("Tabela não configurada") };
      }
      const errorInfo = classifySupabaseError(error);
      console.error("❌ [RecipesService] Erro ao salvar no Supabase:", errorInfo);
      return { id: null, error: new Error(errorInfo.userMessage) };
    }

    console.log("✅ [RecipesService] Receita salva no Supabase");
    return { id: data.id, error: null };
  } catch (err) {
    console.error("❌ [RecipesService] Erro inesperado:", err);
    return { id: null, error: err as Error };
  }
}

/**
 * Salvar receita no localStorage
 */
async function saveToLocalStorage(
  userId: string,
  recipe: RecipeFormData
): Promise<{ id: string; error: null }> {
  try {
    const storageKey = `calc_recipes_${userId}`;
    const existing = localStorage.getItem(storageKey);
    const recipes: Recipe[] = existing ? JSON.parse(existing) : [];

    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      user_id: userId,
      created_at: new Date().toISOString(),
      tags: recipe.tags || [],
      is_public: recipe.is_public || false,
    };

    recipes.unshift(newRecipe);
    const limited = recipes.slice(0, 100);
    localStorage.setItem(storageKey, JSON.stringify(limited));

    console.log("✅ [RecipesService] Receita salva no localStorage");
    return { id: newRecipe.id, error: null };
  } catch (err) {
    console.error("❌ [RecipesService] Erro ao salvar no localStorage:", err);
    return { id: "", error: null };
  }
}

/**
 * Salvar receita (tenta Supabase primeiro, fallback localStorage)
 */
export async function saveRecipe(
  userId: string,
  recipe: RecipeFormData
): Promise<{ id: string | null; error: Error | null }> {
  // Tentar Supabase primeiro
  if (supabase) {
    const supabaseResult = await saveToSupabase(userId, recipe);
    if (supabaseResult.id) {
      return supabaseResult;
    }
    if (!supabaseResult.error?.message.includes("Tabela")) {
      return supabaseResult;
    }
  }

  // Fallback para localStorage
  console.log("📦 [RecipesService] Usando localStorage como fallback");
  return await saveToLocalStorage(userId, recipe);
}

/**
 * Buscar receitas do Supabase
 */
async function getFromSupabase(userId: string): Promise<{ recipes: Recipe[]; error: Error | null }> {
  if (!supabase) {
    return { recipes: [], error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { recipes: [], error: null };
    }

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .order("created_at", { ascending: false });

    if (error) {
      if (isTableNotFoundError(error)) {
        console.warn("⚠️ [RecipesService] Tabela recipes não encontrada");
        return { recipes: [], error: null };
      }
      const errorInfo = classifySupabaseError(error);
      console.error("❌ [RecipesService] Erro ao buscar do Supabase:", errorInfo);
      return { recipes: [], error: new Error(errorInfo.userMessage) };
    }

    const recipes: Recipe[] = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      description: row.description || undefined,
      products: row.products || [],
      area_ha: row.area_ha,
      volume_tanque_l: row.volume_tanque_l,
      taxa_l_ha: row.taxa_l_ha,
      tags: row.tags || [],
      is_public: row.is_public || false,
      created_at: row.created_at,
      updated_at: row.updated_at || undefined,
    }));

    return { recipes, error: null };
  } catch (err) {
    console.error("❌ [RecipesService] Erro ao buscar do Supabase:", err);
    return { recipes: [], error: err as Error };
  }
}

/**
 * Buscar receitas do localStorage
 */
async function getFromLocalStorage(userId: string): Promise<Recipe[]> {
  try {
    const storageKey = `calc_recipes_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return [];
    }

    return JSON.parse(existing) as Recipe[];
  } catch (err) {
    console.error("❌ [RecipesService] Erro ao buscar do localStorage:", err);
    return [];
  }
}

/**
 * Buscar todas as receitas (tenta Supabase primeiro, fallback localStorage)
 */
export async function getRecipes(userId: string): Promise<Recipe[]> {
  if (supabase) {
    const { recipes, error } = await getFromSupabase(userId);
    if (!error && recipes.length >= 0) {
      return recipes;
    }
    if (error && !error.message.includes("Tabela")) {
      return [];
    }
  }

  // Fallback para localStorage
  return await getFromLocalStorage(userId);
}

/**
 * Atualizar receita no Supabase
 */
async function updateInSupabase(
  userId: string,
  recipeId: string,
  recipe: Partial<RecipeFormData>
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { error } = await supabase
      .from("recipes")
      .update({
        name: recipe.name,
        description: recipe.description,
        products: recipe.products,
        area_ha: recipe.area_ha,
        volume_tanque_l: recipe.volume_tanque_l,
        taxa_l_ha: recipe.taxa_l_ha,
        tags: recipe.tags,
        is_public: recipe.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipeId)
      .eq("user_id", userId);

    if (error) {
      if (isTableNotFoundError(error)) {
        return { error: new Error("Tabela não configurada") };
      }
      const errorInfo = classifySupabaseError(error);
      return { error: new Error(errorInfo.userMessage) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Atualizar receita no localStorage
 */
async function updateInLocalStorage(
  userId: string,
  recipeId: string,
  recipe: Partial<RecipeFormData>
): Promise<{ error: Error | null }> {
  try {
    const storageKey = `calc_recipes_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return { error: new Error("Receita não encontrada") };
    }

    const recipes: Recipe[] = JSON.parse(existing);
    const index = recipes.findIndex(r => r.id === recipeId);
    
    if (index === -1) {
      return { error: new Error("Receita não encontrada") };
    }

    recipes[index] = {
      ...recipes[index],
      ...recipe,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(recipes));
    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Atualizar receita (tenta Supabase primeiro, fallback localStorage)
 */
export async function updateRecipe(
  userId: string,
  recipeId: string,
  recipe: Partial<RecipeFormData>
): Promise<{ error: Error | null }> {
  if (supabase) {
    const result = await updateInSupabase(userId, recipeId, recipe);
    if (!result.error) {
      return result;
    }
    if (!result.error.message.includes("Tabela")) {
      return result;
    }
  }

  return await updateInLocalStorage(userId, recipeId, recipe);
}

/**
 * Deletar receita do Supabase
 */
async function deleteFromSupabase(userId: string, recipeId: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("user_id", userId);

    if (error) {
      if (isTableNotFoundError(error)) {
        return { error: null };
      }
      const errorInfo = classifySupabaseError(error);
      return { error: new Error(errorInfo.userMessage) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Deletar receita do localStorage
 */
async function deleteFromLocalStorage(userId: string, recipeId: string): Promise<{ error: Error | null }> {
  try {
    const storageKey = `calc_recipes_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return { error: null };
    }

    const recipes: Recipe[] = JSON.parse(existing);
    const filtered = recipes.filter(r => r.id !== recipeId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Deletar receita (tenta Supabase primeiro, fallback localStorage)
 */
export async function deleteRecipe(userId: string, recipeId: string): Promise<{ error: Error | null }> {
  if (supabase) {
    const result = await deleteFromSupabase(userId, recipeId);
    if (!result.error) {
      return result;
    }
    if (!result.error.message.includes("Tabela")) {
      return result;
    }
  }

  return await deleteFromLocalStorage(userId, recipeId);
}

/**
 * Formata data para exibição
 */
export function formatRecipeDate(timestamp: string): string {
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




