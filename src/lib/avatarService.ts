/**
 * Serviço de Avatar/Foto de Perfil
 * Suporta Supabase Storage (preferencial) e localStorage (fallback)
 */

import { supabase } from "./supabaseClient";

const BUCKET_NAME = "avatars";
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Valida arquivo de imagem
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Formato não suportado. Use JPG, PNG ou WEBP.",
    };
  }

  // Validar tamanho
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "A imagem deve ter no máximo 3MB.",
    };
  }

  return { valid: true };
}

/**
 * Upload de avatar para Supabase Storage
 */
export async function uploadAvatarToSupabase(
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    return { url: null, error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { url: null, error: new Error("Usuário não autenticado") };
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: null, error: new Error(validation.error || "Arquivo inválido") };
    }

    // Criar path único: avatars/{userId}/{timestamp}.{ext}
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "png";
    const filePath = `${user.id}/${timestamp}.${extension}`;

    // Upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      if (uploadError.message.includes("Bucket not found")) {
        console.warn("⚠️ [AvatarService] Bucket 'avatars' não encontrado.");
        return {
          url: null,
          error: new Error("Bucket de avatares não configurado. Use localStorage como fallback."),
        };
      }
      console.error("❌ [AvatarService] Erro ao fazer upload:", uploadError);
      return { url: null, error: new Error(uploadError.message) };
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // Salvar URL na tabela profiles (ou user_metadata como fallback)
    await saveAvatarUrlToProfile(publicUrl);

    console.log("✅ [AvatarService] Avatar salvo no Supabase Storage");
    return { url: publicUrl, error: null };
  } catch (err) {
    console.error("❌ [AvatarService] Erro inesperado:", err);
    return { url: null, error: err as Error };
  }
}

/**
 * Salva URL do avatar na tabela profiles ou user_metadata
 */
async function saveAvatarUrlToProfile(avatarUrl: string): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Tentar salvar na tabela profiles primeiro
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileError) {
      // Se a tabela não existir, usar user_metadata como fallback
      console.warn("⚠️ [AvatarService] Tabela profiles não encontrada, usando user_metadata");
      await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });
    }
  } catch (err) {
    console.error("❌ [AvatarService] Erro ao salvar URL do avatar:", err);
    // Fallback para user_metadata
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            avatar_url: avatarUrl,
          },
        });
      }
    } catch (fallbackErr) {
      console.error("❌ [AvatarService] Erro no fallback user_metadata:", fallbackErr);
    }
  }
}

/**
 * Upload de avatar para localStorage (fallback)
 */
export async function uploadAvatarToLocalStorage(
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Tentar obter user do Supabase se disponível, senão usar localStorage
    let userId: string | null = null;
    
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } else {
      // Se não tiver Supabase, tentar pegar do localStorage
      const storedUserId = localStorage.getItem("calc_user_id");
      userId = storedUserId;
    }

    if (!userId) {
      return { url: null, error: new Error("Usuário não identificado") };
    }

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { url: null, error: new Error(validation.error || "Arquivo inválido") };
    }

    // Converter para base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const base64 = await base64Promise;
    const storageKey = `calc_avatar_${userId}`;

    // Salvar no localStorage
    localStorage.setItem(storageKey, base64);

    // Salvar flag no perfil local
    const profileKey = `calc_profile_${userId}`;
    const existingProfile = localStorage.getItem(profileKey);
    const profile = existingProfile ? JSON.parse(existingProfile) : {};
    profile.avatar_url = `local:${storageKey}`;
    localStorage.setItem(profileKey, JSON.stringify(profile));

    console.log("✅ [AvatarService] Avatar salvo no localStorage");
    return { url: base64, error: null };
  } catch (err) {
    console.error("❌ [AvatarService] Erro ao salvar no localStorage:", err);
    return { url: null, error: err as Error };
  }
}

/**
 * Upload de avatar (tenta Supabase primeiro, fallback para localStorage)
 */
export async function uploadAvatar(
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  // Tentar Supabase primeiro
  if (supabase) {
    const result = await uploadAvatarToSupabase(file);
    if (result.url) {
      return result;
    }
    // Se falhar mas não for erro crítico, tentar localStorage
    if (!result.error?.message.includes("Bucket")) {
      return result;
    }
  }

  // Fallback para localStorage
  console.log("📦 [AvatarService] Usando localStorage como fallback");
  return await uploadAvatarToLocalStorage(file);
}

/**
 * Remove avatar do Supabase Storage
 */
export async function removeAvatarFromSupabase(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    // Listar arquivos do usuário no bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(user.id);

    if (listError) {
      console.warn("⚠️ [AvatarService] Erro ao listar arquivos:", listError);
      // Continuar para limpar URL mesmo se não conseguir listar
    } else if (files && files.length > 0) {
      // Remover todos os arquivos do usuário
      const filePaths = files.map((file) => `${user.id}/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (removeError) {
        console.warn("⚠️ [AvatarService] Erro ao remover arquivos:", removeError);
      }
    }

    // Limpar URL do perfil
    await saveAvatarUrlToProfile("");

    console.log("✅ [AvatarService] Avatar removido do Supabase");
    return { error: null };
  } catch (err) {
    console.error("❌ [AvatarService] Erro ao remover avatar:", err);
    return { error: err as Error };
  }
}

/**
 * Remove avatar do localStorage
 */
export async function removeAvatarFromLocalStorage(): Promise<{ error: Error | null }> {
  try {
    let userId: string | null = null;
    
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } else {
      const storedUserId = localStorage.getItem("calc_user_id");
      userId = storedUserId;
    }

    if (!userId) {
      return { error: new Error("Usuário não identificado") };
    }

    const storageKey = `calc_avatar_${userId}`;
    localStorage.removeItem(storageKey);

    // Limpar flag do perfil
    const profileKey = `calc_profile_${userId}`;
    const existingProfile = localStorage.getItem(profileKey);
    if (existingProfile) {
      const profile = JSON.parse(existingProfile);
      delete profile.avatar_url;
      localStorage.setItem(profileKey, JSON.stringify(profile));
    }

    console.log("✅ [AvatarService] Avatar removido do localStorage");
    return { error: null };
  } catch (err) {
    console.error("❌ [AvatarService] Erro ao remover do localStorage:", err);
    return { error: err as Error };
  }
}

/**
 * Remove avatar (tenta Supabase primeiro, fallback para localStorage)
 */
export async function removeAvatar(): Promise<{ error: Error | null }> {
  if (supabase) {
    const result = await removeAvatarFromSupabase();
    if (!result.error) {
      return result;
    }
  }

  return await removeAvatarFromLocalStorage();
}

/**
 * Obtém URL do avatar do usuário
 */
export async function getAvatarUrl(): Promise<string | null> {
  let userId: string | null = null;

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch (err) {
      console.warn("⚠️ [AvatarService] Erro ao obter user do Supabase:", err);
    }
  } else {
    // Se não tiver Supabase, tentar pegar do localStorage
    userId = localStorage.getItem("calc_user_id");
  }

  if (!userId) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Tentar buscar da tabela profiles primeiro
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (!profileError && profile?.avatar_url) {
      return profile.avatar_url;
    }

    // Fallback para user_metadata
    const metadata = user.user_metadata || {};
    if (metadata.avatar_url) {
      return metadata.avatar_url;
    }

    // Fallback para localStorage
    const storageKey = `calc_avatar_${user.id}`;
    const base64 = localStorage.getItem(storageKey);
    return base64;
  } catch (err) {
    console.error("❌ [AvatarService] Erro ao obter avatar:", err);
    // Fallback para localStorage
    if (userId) {
      const storageKey = `calc_avatar_${userId}`;
      const base64 = localStorage.getItem(storageKey);
      return base64;
    }
    return null;
  }
}

