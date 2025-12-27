/**
 * Helper para classificar e tratar erros do Supabase corretamente
 */

export interface SupabaseErrorInfo {
  type: "table_not_found" | "auth_error" | "rls_error" | "schema_error" | "network_error" | "unknown";
  message: string;
  userMessage: string;
  code?: string;
  details?: string;
}

/**
 * Classifica erros do Supabase e retorna informações estruturadas
 */
export function classifySupabaseError(error: any): SupabaseErrorInfo {
  const errorMessage = error?.message || String(error || "");
  const errorCode = error?.code || "";
  const errorDetails = error?.details || "";

  // Log completo do erro para debug
  console.group("🔍 [SupabaseError] Classificando erro");
  console.log("Error object:", error);
  console.log("Error code:", errorCode);
  console.log("Error message:", errorMessage);
  console.log("Error details:", errorDetails);
  console.groupEnd();

  // 1. Tabela não existe (42P01 = PostgreSQL undefined_table, PGRST116/PGRST205 = PostgREST not found)
  if (
    errorCode === "42P01" ||
    errorCode === "PGRST116" ||
    errorCode === "PGRST205" ||
    errorMessage.includes("relation") && errorMessage.includes("does not exist") ||
    errorMessage.includes("Could not find the table") ||
    (errorMessage.includes("schema cache") && errorMessage.includes("not found")) ||
    (errorMessage.includes("Could not find") && errorMessage.includes("table"))
  ) {
    return {
      type: "table_not_found",
      message: errorMessage,
      userMessage: "Tabela não encontrada no banco de dados",
      code: errorCode,
      details: "A tabela pode não existir ou não estar acessível. Verifique se a migração SQL foi executada.",
    };
  }

  // 2. Erro de autenticação (401 = Unauthorized)
  if (
    errorCode === "401" ||
    errorCode === "PGRST301" ||
    errorMessage.includes("JWT") ||
    errorMessage.includes("Invalid API key") ||
    errorMessage.includes("Not authorized")
  ) {
    return {
      type: "auth_error",
      message: errorMessage,
      userMessage: "Erro de autenticação. Faça login novamente.",
      code: errorCode,
      details: "Sua sessão pode ter expirado ou as credenciais estão inválidas.",
    };
  }

  // 3. Erro de RLS (403 = Forbidden, PGRST301 = Row Level Security)
  if (
    errorCode === "403" ||
    errorCode === "PGRST301" ||
    errorMessage.includes("Row Level Security") ||
    errorMessage.includes("new row violates row-level security") ||
    errorMessage.includes("permission denied")
  ) {
    return {
      type: "rls_error",
      message: errorMessage,
      userMessage: "Sem permissão para acessar este recurso",
      code: errorCode,
      details: "Verifique se você está logado e tem permissão para acessar este dado.",
    };
  }

  // 4. Erro de schema (PGRST*** = PostgREST errors)
  // PGRST204 = Column not found in schema cache
  if (
    errorCode.startsWith("PGRST") ||
    errorMessage.includes("schema") ||
    (errorMessage.includes("column") && errorMessage.includes("does not exist")) ||
    errorMessage.includes("Could not find the") && errorMessage.includes("column")
  ) {
    // Detectar especificamente erro de coluna não encontrada
    const columnMatch = errorMessage.match(/Could not find the ['"]([^'"]+)['"] column/);
    const columnName = columnMatch ? columnMatch[1] : null;
    
    return {
      type: "schema_error",
      message: errorMessage,
      userMessage: columnName 
        ? `Coluna '${columnName}' não encontrada na tabela. Execute a migração SQL para adicionar a coluna.`
        : "Erro na estrutura do banco de dados",
      code: errorCode,
      details: columnName
        ? `A coluna '${columnName}' não existe na tabela 'products_custom'. Execute a migração SQL: supabase/migrations/add_dose_min_max_columns.sql`
        : "Pode haver um problema com o schema ou colunas da tabela. Verifique se todas as migrações foram executadas.",
    };
  }

  // 5. Erro de rede
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("timeout")
  ) {
    return {
      type: "network_error",
      message: errorMessage,
      userMessage: "Erro de conexão. Verifique sua internet.",
      code: errorCode,
      details: "Não foi possível conectar ao servidor.",
    };
  }

  // 6. Erro desconhecido
  return {
    type: "unknown",
    message: errorMessage,
    userMessage: "Erro ao processar solicitação",
    code: errorCode,
    details: errorDetails || "Erro inesperado. Verifique o console para mais detalhes.",
  };
}

/**
 * Verifica se o erro indica que a tabela não existe
 */
export function isTableNotFoundError(error: any): boolean {
  const classified = classifySupabaseError(error);
  return classified.type === "table_not_found";
}

/**
 * Verifica se o erro é de autenticação/RLS
 */
export function isAuthError(error: any): boolean {
  const classified = classifySupabaseError(error);
  return classified.type === "auth_error" || classified.type === "rls_error";
}

