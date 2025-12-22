import { supabase } from "./supabaseClient";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  companyName: string;
  fullName: string;
  drones?: string; // Opcional, pode ser uma string com múltiplos drones separados por vírgula
}

/**
 * Salva o perfil do usuário no user_metadata do Supabase
 */
export async function saveUserProfile(profile: UserProfile): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    // Atualizar user_metadata com o perfil
    const { data, error } = await supabase.auth.updateUser({
      data: {
        company_name: profile.companyName,
        full_name: profile.fullName,
        drones: profile.drones || "",
        profile_completed: true, // Flag para indicar que o perfil foi preenchido
      },
    });

    if (error) {
      console.error("❌ [UserProfile] Erro ao salvar perfil:", error);
      return { error: new Error(error.message) };
    }

    // Aguardar um pouco para garantir que a atualização foi processada
    await new Promise(resolve => setTimeout(resolve, 300));

    // Recarregar o usuário para atualizar o user_metadata
    const { data: { user: updatedUser }, error: getUserError } = await supabase.auth.getUser();
    
    if (getUserError || !updatedUser) {
      console.error("❌ [UserProfile] Erro ao recarregar usuário:", getUserError);
      return { error: new Error("Erro ao atualizar usuário") };
    }

    // Verificar se o metadata foi atualizado
    const metadata = updatedUser.user_metadata || {};
    console.log("🔍 [UserProfile] Metadata após salvar:", {
      profile_completed: metadata.profile_completed,
      company_name: metadata.company_name,
      full_name: metadata.full_name,
    });

    console.log("✅ [UserProfile] Perfil salvo com sucesso");
    return { error: null };
  } catch (err) {
    console.error("❌ [UserProfile] Erro inesperado:", err);
    return { error: err as Error };
  }
}

/**
 * Lê o perfil do usuário do user_metadata
 */
export async function getUserProfile(): Promise<{ profile: UserProfile | null; error: Error | null }> {
  if (!supabase) {
    return { profile: null, error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { profile: null, error: new Error("Usuário não autenticado") };
    }

    const metadata = user.user_metadata || {};
    
    // Verificar se o perfil foi completado
    if (!metadata.profile_completed) {
      return { profile: null, error: null }; // Perfil não completado ainda
    }

    const profile: UserProfile = {
      companyName: metadata.company_name || "",
      fullName: metadata.full_name || "",
      drones: metadata.drones || undefined,
    };

    return { profile, error: null };
  } catch (err) {
    console.error("❌ [UserProfile] Erro ao ler perfil:", err);
    return { profile: null, error: err as Error };
  }
}

/**
 * Verifica se o perfil do usuário está completo
 */
export async function isProfileComplete(): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    const metadata = user.user_metadata || {};
    return metadata.profile_completed === true;
  } catch (err) {
    console.error("❌ [UserProfile] Erro ao verificar perfil:", err);
    return false;
  }
}

