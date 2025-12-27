/**
 * Serviço para gerenciar catálogo de produtos
 * Combina produtos padrão (default) com produtos personalizados do usuário
 */

import { supabase } from "./supabaseClient";
import { classifySupabaseError, isTableNotFoundError, isAuthError } from "./supabaseErrorHandler";
import type { DefaultProduct, CustomProduct, CatalogProduct, ProductFilters } from "@/types/product";
import { produtosAgricolas, type Product as LegacyProduct } from "./products";

/**
 * Converter produto legado para DefaultProduct
 */
function convertLegacyProduct(legacy: LegacyProduct): DefaultProduct {
  const categoryMap: Record<string, DefaultProduct["category"]> = {
    Herbicida: "Herbicida",
    Inseticida: "Inseticida",
    Fungicida: "Fungicida",
    Fertilizante: "Fertilizante",
  };

  return {
    id: legacy.id,
    name: legacy.nome,
    category: categoryMap[legacy.tipo] || "Herbicida",
    doseValue: legacy.dosePadrao,
    doseUnit: legacy.unidade === "mL" ? "mL" : "L",
    indication: `Indicado para ${legacy.tipo.toLowerCase()}`,
    // TODO: Adicionar imagens locais quando disponíveis
    // imageUrl: `/src/assets/products/${legacy.id}.jpg`,
  };
}

/**
 * Obter produtos padrão do app
 */
export function getDefaultProducts(): DefaultProduct[] {
  return produtosAgricolas.map(convertLegacyProduct);
}

/**
 * Obter produtos personalizados do usuário
 */
export async function getCustomProducts(userId: string): Promise<CustomProduct[]> {
  if (!supabase) {
    console.warn("⚠️ [ProductCatalog] Supabase não configurado");
    return [];
  }

  if (!userId) {
    console.warn("⚠️ [ProductCatalog] userId não fornecido");
    return [];
  }

  try {
    console.log("🔍 [ProductCatalog] Buscando produtos custom para userId:", userId);
    
    const { data, error } = await supabase
      .from("products_custom")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      const errorInfo = classifySupabaseError(error);
      
      // Log detalhado do erro
      console.group("❌ [ProductCatalog] Erro ao buscar produtos custom");
      console.log("Error type:", errorInfo.type);
      console.log("Error code:", errorInfo.code);
      console.log("Error message:", errorInfo.message);
      console.log("User message:", errorInfo.userMessage);
      console.groupEnd();

      // Se for erro de tabela não encontrada, retornar array vazio silenciosamente
      // (não mostrar erro para o usuário, pois produtos padrão ainda funcionam)
      if (isTableNotFoundError(error)) {
        console.warn("⚠️ [ProductCatalog] Tabela products_custom não encontrada. Retornando array vazio.");
        return [];
      }

      // Se for erro de auth/RLS, logar mas não quebrar o app
      if (isAuthError(error)) {
        console.warn("⚠️ [ProductCatalog] Erro de autenticação/RLS. Retornando array vazio.");
        return [];
      }

      // Outros erros: logar e retornar vazio
      console.error("❌ [ProductCatalog] Erro desconhecido ao buscar produtos custom");
      return [];
    }

    console.log("✅ [ProductCatalog] Produtos custom carregados:", data?.length || 0);
    return data || [];
  } catch (err) {
    console.error("❌ [ProductCatalog] Erro inesperado:", err);
    return [];
  }
}

/**
 * Converter CustomProduct para CatalogProduct
 */
function customToCatalog(custom: CustomProduct): CatalogProduct {
  return {
    id: `custom_${custom.id}`,
    customId: custom.id,
    name: custom.name,
    category: custom.category,
    doseValue: custom.dose_value,
    doseUnit: custom.dose_unit,
    indication: custom.recommendations || custom.description || "Produto personalizado",
    imageUrl: custom.image_url || undefined,
    details: {
      description: custom.description,
      doseMin: custom.dose_min || undefined,
      doseMax: custom.dose_max || undefined,
      recommendations: custom.recommendations || "",
      notes: custom.notes || undefined,
    },
    isCustom: true,
  };
}

/**
 * Converter DefaultProduct para CatalogProduct
 */
function defaultToCatalog(defaultProd: DefaultProduct): CatalogProduct {
  return {
    ...defaultProd,
    id: `default_${defaultProd.id}`,
    isCustom: false,
  };
}

/**
 * Obter todos os produtos (default + custom) do usuário
 * Separa produtos custom (apenas do usuário) dos produtos padrão (públicos)
 */
export async function getAllProducts(userId: string): Promise<CatalogProduct[]> {
  const defaultProducts = getDefaultProducts().map(defaultToCatalog);
  const customProducts = (await getCustomProducts(userId)).map(customToCatalog);

  // Custom products primeiro (apenas do usuário logado)
  // Depois produtos padrão (públicos)
  return [...customProducts, ...defaultProducts];
}

/**
 * Adicionar produto personalizado
 */
export async function addCustomProduct(
  userId: string,
  product: Omit<CustomProduct, "id" | "user_id" | "created_at" | "updated_at">
): Promise<{ product: CustomProduct | null; error: Error | null }> {
  if (!supabase) {
    return { product: null, error: new Error("Supabase não configurado") };
  }

  try {
    // Validar campos obrigatórios antes de tentar inserir
    if (!product.name || !product.category || !product.description) {
      return {
        product: null,
        error: new Error("Campos obrigatórios faltando: nome, categoria ou descrição são necessários"),
      };
    }

    if (product.dose_value === undefined || product.dose_value === null) {
      return {
        product: null,
        error: new Error("Campo obrigatório faltando: dose_value é necessário"),
      };
    }

    if (!product.dose_unit) {
      return {
        product: null,
        error: new Error("Campo obrigatório faltando: dose_unit é necessário"),
      };
    }

    // Preparar dados básicos obrigatórios
    const baseData: Record<string, any> = {
      user_id: userId,
      name: String(product.name).trim(),
      category: String(product.category).trim(),
      description: String(product.description).trim(),
      dose_value: Number(product.dose_value),
      dose_unit: String(product.dose_unit).trim(),
    };

    // Campos opcionais que podem não existir na tabela
    const optionalFields: Record<string, any> = {};
    
    // Adicionar campos opcionais apenas se tiverem valor ESTRITO (não string vazia)
    if (product.dose_min !== undefined && product.dose_min !== null && product.dose_min !== "") {
      optionalFields.dose_min = product.dose_min;
    }
    if (product.dose_max !== undefined && product.dose_max !== null && product.dose_max !== "") {
      optionalFields.dose_max = product.dose_max;
    }
    if (product.recommendations !== undefined && product.recommendations !== null && product.recommendations.trim() !== "") {
      optionalFields.recommendations = product.recommendations.trim();
    }
    if (product.notes !== undefined && product.notes !== null && product.notes.trim() !== "") {
      optionalFields.notes = product.notes.trim();
    }
    if (product.image_url !== undefined && product.image_url !== null && product.image_url.trim() !== "") {
      optionalFields.image_url = product.image_url.trim();
    }

    // Tentar inserir com todos os campos primeiro
    let insertData = { ...baseData, ...optionalFields };
    console.log("🔍 [ProductCatalog] Tentando inserir com dados completos:", insertData);

    let { data, error } = await supabase
      .from("products_custom")
      .insert(insertData)
      .select()
      .single();

    // Se der erro de schema (coluna não encontrada), tentar com estrutura mínima
    if (error && (error.code === "PGRST204" || (error.message.includes("Could not find the") && error.message.includes("column")))) {
      console.warn("⚠️ [ProductCatalog] Erro de coluna não encontrada. Tentando inserir com estrutura mínima...");
      
      // Tentar apenas com campos absolutamente essenciais
      const minimalData: Record<string, any> = {
        user_id: userId,
        name: product.name,
        category: product.category,
        description: product.description,
      };

      // Tentar adicionar dose_value e dose_unit se possível
      // Se der erro, tentar sem eles também
      try {
        minimalData.dose_value = product.dose_value;
        minimalData.dose_unit = product.dose_unit;
      } catch (e) {
        console.warn("⚠️ [ProductCatalog] Campos dose_value/dose_unit podem não existir");
      }

      console.log("🔍 [ProductCatalog] Tentando inserir com estrutura mínima:", minimalData);

      const retryResult = await supabase
        .from("products_custom")
        .insert(minimalData)
        .select()
        .single();

      if (retryResult.error) {
        // Se ainda der erro, mostrar mensagem clara
        console.error("❌ [ProductCatalog] Erro mesmo com estrutura mínima. A tabela pode estar incompleta.");
        error = retryResult.error;
      } else {
        // Sucesso! Retornar dados
        data = retryResult.data;
        error = null;
        console.log("✅ [ProductCatalog] Produto inserido com estrutura mínima. Execute a migração SQL completa para habilitar todas as funcionalidades.");
      }
    }

    if (error) {
      const errorInfo = classifySupabaseError(error);
      
      // Log detalhado
      console.group("❌ [ProductCatalog] Erro ao adicionar produto");
      console.log("Error type:", errorInfo.type);
      console.log("Error code:", errorInfo.code);
      console.log("Error message:", errorInfo.message);
      console.log("Error details:", errorInfo.details);
      console.groupEnd();

      // Retornar erro com mensagem apropriada
      return { 
        product: null, 
        error: new Error(errorInfo.userMessage + (errorInfo.details ? `\n\n${errorInfo.details}` : "")) 
      };
    }

    return { product: data, error: null };
  } catch (err: any) {
    console.error("❌ [ProductCatalog] Erro inesperado:", err);
    
    // Se for erro de constraint (not-null, etc), classificar
    if (err?.message?.includes("violates not-null constraint") || err?.message?.includes("null value")) {
      const errorInfo = classifySupabaseError(err);
      return { 
        product: null, 
        error: new Error(`Campo obrigatório faltando: ${errorInfo.userMessage}`) 
      };
    }
    
    return { product: null, error: new Error(err?.message || "Erro inesperado. Verifique o console para mais detalhes.") };
  }
}

/**
 * Atualizar produto personalizado
 */
export async function updateCustomProduct(
  productId: string,
  userId: string,
  updates: Partial<Omit<CustomProduct, "id" | "user_id" | "created_at">>
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { error } = await supabase
      .from("products_custom")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("user_id", userId); // RLS garante, mas adicionamos para segurança

    if (error) {
      console.error("❌ [ProductCatalog] Erro ao atualizar produto:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("❌ [ProductCatalog] Erro inesperado:", err);
    return { error: err as Error };
  }
}

/**
 * Deletar produto personalizado
 */
export async function deleteCustomProduct(
  productId: string,
  userId: string
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { error } = await supabase
      .from("products_custom")
      .delete()
      .eq("id", productId)
      .eq("user_id", userId);

    if (error) {
      console.error("❌ [ProductCatalog] Erro ao deletar produto:", error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    console.error("❌ [ProductCatalog] Erro inesperado:", err);
    return { error: err as Error };
  }
}

/**
 * Filtrar produtos
 */
export function filterProducts(
  products: CatalogProduct[],
  filters: ProductFilters
): CatalogProduct[] {
  let filtered = [...products];

  // Filtrar apenas custom
  if (filters.showOnlyCustom) {
    filtered = filtered.filter((p) => p.isCustom);
  }

  // Busca por texto
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.indication.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por categoria
  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  // Filtro por unidade
  if (filters.unit) {
    filtered = filtered.filter((p) => p.doseUnit === filters.unit);
  }

  return filtered;
}

/**
 * Upload de imagem para Supabase Storage
 * Retorna URL pública ou null em caso de erro
 */
export async function uploadProductImage(
  userId: string,
  productId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    return { url: null, error: new Error("Supabase não configurado") };
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload para bucket 'product-images'
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("❌ [ProductCatalog] Erro ao fazer upload:", error);
      return { url: null, error: new Error(error.message) };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error("❌ [ProductCatalog] Erro inesperado no upload:", err);
    return { url: null, error: err as Error };
  }
}

