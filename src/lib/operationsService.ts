/**
 * Serviço de Operações - Gerenciar operações agrícolas
 * Suporta Supabase (preferencial) e localStorage (fallback)
 */

import { supabase } from "./supabaseClient";
import { classifySupabaseError, isTableNotFoundError } from "./supabaseErrorHandler";
import type { Operation, OperationFormData } from "@/types/operation";

/**
 * Calcular valores da operação automaticamente
 */
function calculateOperationValues(
  areaHa: number,
  volumeLHa: number,
  doseValue: number
): { totalVolumeL: number; totalProductQuantity: number } {
  const totalVolumeL = areaHa * volumeLHa;
  const totalProductQuantity = areaHa * doseValue;
  
  return {
    totalVolumeL: Math.round(totalVolumeL * 100) / 100, // Arredondar para 2 casas decimais
    totalProductQuantity: Math.round(totalProductQuantity * 100) / 100,
  };
}

/**
 * Salvar operação no Supabase
 */
async function saveToSupabase(
  userId: string,
  operation: OperationFormData
): Promise<{ id: string | null; error: Error | null }> {
  if (!supabase) {
    return { id: null, error: new Error("Supabase não configurado") };
  }

  try {
    // Calcular valores automaticamente
    const { totalVolumeL, totalProductQuantity } = calculateOperationValues(
      operation.area_ha,
      operation.volume_l_ha,
      operation.dose_value
    );

    const { data, error } = await supabase
      .from("operations")
      .insert({
        user_id: userId,
        // Identificação
        operation_name: operation.operation_name,
        client_name: operation.client_name,
        farm_name: operation.farm_name,
        field_name: operation.field_name,
        location: operation.location || null,
        // Agrícolas
        crop: operation.crop,
        target_pest: operation.target_pest,
        target: operation.target_pest, // Mantido para compatibilidade
        product_name: operation.product_name,
        product_id: operation.product_id || null,
        // Operacionais
        area_ha: operation.area_ha,
        dose_value: operation.dose_value,
        dose_unit: operation.dose_unit,
        volume_l_ha: operation.volume_l_ha,
        water_volume: operation.volume_l_ha, // Alias
        drone_model: operation.drone_model || null,
        date: operation.date,
        operation_date: operation.date, // Alias
        status: operation.status,
        // Financeiros
        price_charged: operation.price_charged || 0,
        // Calculados
        total_volume_l: totalVolumeL,
        total_product_quantity: totalProductQuantity,
      })
      .select()
      .single();

    if (error) {
      if (isTableNotFoundError(error)) {
        console.warn("⚠️ [OperationsService] Tabela operations não encontrada, usando localStorage");
        return { id: null, error: new Error("Tabela não configurada") };
      }
      const errorInfo = classifySupabaseError(error);
      console.error("❌ [OperationsService] Erro ao salvar no Supabase:", errorInfo);
      return { id: null, error: new Error(errorInfo.userMessage) };
    }

    console.log("✅ [OperationsService] Operação salva no Supabase");
    return { id: data.id, error: null };
  } catch (err) {
    console.error("❌ [OperationsService] Erro inesperado:", err);
    return { id: null, error: err as Error };
  }
}

/**
 * Salvar operação no localStorage
 */
async function saveToLocalStorage(
  userId: string,
  operation: OperationFormData
): Promise<{ id: string; error: null }> {
  try {
    const storageKey = `calc_operations_${userId}`;
    const existing = localStorage.getItem(storageKey);
    const operations: Operation[] = existing ? JSON.parse(existing) : [];

    // Calcular valores automaticamente
    const { totalVolumeL, totalProductQuantity } = calculateOperationValues(
      operation.area_ha,
      operation.volume_l_ha,
      operation.dose_value
    );

    const newOperation: Operation = {
      ...operation,
      id: Date.now().toString(),
      user_id: userId,
      // Garantir todos os campos necessários
      operation_name: operation.operation_name || operation.farm_name || "Operação sem nome",
      client_name: operation.client_name || operation.farm_name || "Cliente não informado",
      farm_name: operation.farm_name || "Fazenda não informada",
      field_name: operation.field_name || "Talhão não informado",
      location: operation.location,
      crop: operation.crop,
      target_pest: operation.target_pest,
      target: operation.target_pest, // Mantido para compatibilidade
      product_name: operation.product_name,
      product_id: operation.product_id,
      product: operation.product_name, // Mantido para compatibilidade
      area_ha: operation.area_ha,
      area: operation.area_ha, // Mantido para compatibilidade
      dose_value: operation.dose_value,
      dose: operation.dose_value, // Mantido para compatibilidade
      dose_unit: operation.dose_unit,
      volume_l_ha: operation.volume_l_ha,
      water_volume: operation.volume_l_ha, // Mantido para compatibilidade
      drone_model: operation.drone_model,
      drone: operation.drone_model, // Mantido para compatibilidade
      date: operation.date,
      operation_date: operation.date, // Mantido para compatibilidade
      status: operation.status,
      price_charged: operation.price_charged || 0,
      total_volume_l: totalVolumeL,
      total_product_quantity: totalProductQuantity,
      created_at: new Date().toISOString(),
    };

    operations.unshift(newOperation);
    const limited = operations.slice(0, 100);
    localStorage.setItem(storageKey, JSON.stringify(limited));

    console.log("✅ [OperationsService] Operação salva no localStorage:", newOperation);
    return { id: newOperation.id, error: null };
  } catch (err) {
    console.error("❌ [OperationsService] Erro ao salvar no localStorage:", err);
    return { id: "", error: null };
  }
}

/**
 * Salvar operação (tenta Supabase primeiro, fallback localStorage)
 */
export async function saveOperation(
  userId: string,
  operation: OperationFormData
): Promise<{ id: string | null; error: Error | null }> {
  // Tentar Supabase primeiro
  if (supabase) {
    const supabaseResult = await saveToSupabase(userId, operation);
    if (supabaseResult.id) {
      console.log("✅ [OperationsService] Operação salva no Supabase com sucesso");
      return supabaseResult;
    }
    // Se o erro for de tabela não encontrada, usar localStorage
    if (supabaseResult.error && (
      supabaseResult.error.message.includes("Tabela") ||
      supabaseResult.error.message.includes("table") ||
      isTableNotFoundError(supabaseResult.error)
    )) {
      console.log("📦 [OperationsService] Tabela não encontrada no Supabase, usando localStorage");
      const localResult = await saveToLocalStorage(userId, operation);
      console.log("✅ [OperationsService] Operação salva no localStorage:", localResult.id);
      return localResult;
    }
    // Se for outro erro, retornar o erro do Supabase
    return supabaseResult;
  }

  // Fallback para localStorage
  console.log("📦 [OperationsService] Supabase não configurado, usando localStorage");
  return await saveToLocalStorage(userId, operation);
}

/**
 * Buscar operações do Supabase
 */
async function getFromSupabase(userId: string): Promise<{ operations: Operation[]; error: Error | null }> {
  if (!supabase) {
    return { operations: [], error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { operations: [], error: null };
    }

    const { data, error } = await supabase
      .from("operations")
      .select("*")
      .eq("user_id", userId)
      .order("operation_date", { ascending: false })
      .order("date", { ascending: false }); // Fallback para compatibilidade

    if (error) {
      if (isTableNotFoundError(error)) {
        console.warn("⚠️ [OperationsService] Tabela operations não encontrada no Supabase");
        // Retornar erro para que getOperations use localStorage como fallback
        return { operations: [], error: new Error("Tabela não encontrada") };
      }
      const errorInfo = classifySupabaseError(error);
      console.error("❌ [OperationsService] Erro ao buscar do Supabase:", errorInfo);
      return { operations: [], error: new Error(errorInfo.userMessage) };
    }

    const operations: Operation[] = (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      // Identificação
      operation_name: row.operation_name || row.farm_name || "Operação sem nome",
      client_name: row.client_name || row.farm_name || "Cliente não informado",
      farm_name: row.farm_name || "Fazenda não informada",
      field_name: row.field_name || "Talhão não informado",
      location: row.location || undefined,
      // Agrícolas
      crop: row.crop || row.cultura || "Cultura não informada",
      target_pest: row.target_pest || row.target || "",
      target: row.target_pest || row.target || "", // Mantido para compatibilidade
      product_name: row.product_name || "",
      product_id: row.product_id || undefined,
      product: row.product_name || "", // Mantido para compatibilidade
      // Operacionais
      area_ha: parseFloat(row.area_ha || row.area) || 0,
      area: parseFloat(row.area_ha || row.area) || 0, // Mantido para compatibilidade
      dose_value: parseFloat(row.dose_value || row.dose) || 0,
      dose: parseFloat(row.dose_value || row.dose) || 0, // Mantido para compatibilidade
      dose_unit: row.dose_unit || "mL/ha",
      volume_l_ha: parseFloat(row.volume_l_ha || row.water_volume) || 0,
      water_volume: parseFloat(row.volume_l_ha || row.water_volume) || 0, // Mantido para compatibilidade
      drone_model: row.drone_model || row.drone || undefined,
      drone: row.drone_model || row.drone || undefined, // Mantido para compatibilidade
      date: row.date || row.operation_date || row.data,
      operation_date: row.operation_date || row.date || row.data, // Mantido para compatibilidade
      status: (row.status || "planned") as OperationStatus,
      // Financeiros
      price_charged: row.price_charged ? parseFloat(row.price_charged) : 0,
      // Calculados
      total_volume_l: row.total_volume_l ? parseFloat(row.total_volume_l) : undefined,
      total_product_quantity: row.total_product_quantity ? parseFloat(row.total_product_quantity) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at || undefined,
    }));

    console.log("✅ [OperationsService] Operações convertidas do Supabase:", operations.length);
    return { operations, error: null };
  } catch (err) {
    console.error("❌ [OperationsService] Erro ao buscar do Supabase:", err);
    return { operations: [], error: err as Error };
  }
}

/**
 * Buscar operações do localStorage
 */
async function getFromLocalStorage(userId: string): Promise<Operation[]> {
  try {
    const storageKey = `calc_operations_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      console.log("📦 [OperationsService] Nenhum dado no localStorage para userId:", userId);
      return [];
    }

    const operations = JSON.parse(existing) as Operation[];
    console.log("📦 [OperationsService] Operações encontradas no localStorage:", operations.length, operations);
    return operations;
  } catch (err) {
    console.error("❌ [OperationsService] Erro ao buscar do localStorage:", err);
    return [];
  }
}

/**
 * Buscar todas as operações (tenta Supabase primeiro, fallback localStorage)
 */
export async function getOperations(userId: string): Promise<Operation[]> {
  if (supabase) {
    const { operations, error } = await getFromSupabase(userId);
    if (!error) {
      console.log("✅ [OperationsService] Operações carregadas do Supabase:", operations.length);
      return operations;
    }
    // Se houver erro de tabela não encontrada, tentar localStorage
    if (error && isTableNotFoundError(error)) {
      console.warn("⚠️ [OperationsService] Tabela não encontrada, usando localStorage");
      const localData = await getFromLocalStorage(userId);
      console.log("✅ [OperationsService] Operações carregadas do localStorage:", localData.length);
      return localData;
    }
    // Se houver outro erro, tentar localStorage como fallback
    console.warn("⚠️ [OperationsService] Erro ao buscar do Supabase, tentando localStorage:", error);
    const localData = await getFromLocalStorage(userId);
    console.log("✅ [OperationsService] Operações carregadas do localStorage (fallback):", localData.length);
    return localData;
  }

  // Fallback para localStorage
  const localData = await getFromLocalStorage(userId);
  console.log("✅ [OperationsService] Operações carregadas do localStorage:", localData.length);
  return localData;
}

/**
 * Deletar operação do Supabase
 */
async function deleteFromSupabase(userId: string, operationId: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { error } = await supabase
      .from("operations")
      .delete()
      .eq("id", operationId)
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
 * Deletar operação do localStorage
 */
async function deleteFromLocalStorage(userId: string, operationId: string): Promise<{ error: Error | null }> {
  try {
    const storageKey = `calc_operations_${userId}`;
    const existing = localStorage.getItem(storageKey);
    
    if (!existing) {
      return { error: null };
    }

    const operations: Operation[] = JSON.parse(existing);
    const filtered = operations.filter(o => o.id !== operationId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Deletar operação (tenta Supabase primeiro, fallback localStorage)
 */
export async function deleteOperation(userId: string, operationId: string): Promise<{ error: Error | null }> {
  if (supabase) {
    const result = await deleteFromSupabase(userId, operationId);
    if (!result.error) {
      return result;
    }
    if (!result.error.message.includes("Tabela")) {
      return result;
    }
  }

  return await deleteFromLocalStorage(userId, operationId);
}

/**
 * Formata data para exibição
 */
export function formatOperationDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (err) {
    return dateString;
  }
}

