import { supabase } from "./supabaseClient";

/**
 * Faz upload da foto de perfil do usuário para Supabase Storage
 */
export async function uploadUserAvatar(file: File): Promise<{ url: string | null; error: Error | null }> {
  if (!supabase) {
    return { url: null, error: new Error("Supabase não configurado") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { url: null, error: new Error("Usuário não autenticado") };
    }

    // Criar bucket de avatares se não existir (pode dar erro se já existir, mas não importa)
    // Em produção, o bucket deve ser criado manualmente no dashboard do Supabase
    const bucketName = "avatars";
    const filePath = `${user.id}/${Date.now()}_${file.name}`;

    // Upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      // Se o bucket não existir, tentar criar (pode falhar se não tiver permissão)
      if (uploadError.message.includes("Bucket not found")) {
        console.warn("⚠️ [UserAvatar] Bucket 'avatars' não encontrado. Crie o bucket no dashboard do Supabase.");
        return { url: null, error: new Error("Bucket de avatares não configurado. Contate o suporte.") };
      }
      console.error("❌ [UserAvatar] Erro ao fazer upload:", uploadError);
      return { url: null, error: new Error(uploadError.message) };
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Salvar URL no user_metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: publicUrl,
      },
    });

    if (updateError) {
      console.error("❌ [UserAvatar] Erro ao salvar URL no metadata:", updateError);
      return { url: publicUrl, error: null }; // Retorna URL mesmo se não conseguir salvar no metadata
    }

    // Forçar atualização do AuthContext
    await supabase.auth.getSession();

    console.log("✅ [UserAvatar] Avatar atualizado com sucesso");
    return { url: publicUrl, error: null };
  } catch (err) {
    console.error("❌ [UserAvatar] Erro inesperado:", err);
    return { url: null, error: err as Error };
  }
}

/**
 * Obtém a URL da foto de perfil do usuário
 */
export async function getUserAvatarUrl(): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    const metadata = user.user_metadata || {};
    return metadata.avatar_url || null;
  } catch (err) {
    console.error("❌ [UserAvatar] Erro ao obter avatar:", err);
    return null;
  }
}

/**
 * Atualiza o nome do usuário
 */
export async function updateUserName(newName: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error("Supabase não configurado") };
  }

  if (!newName.trim()) {
    return { error: new Error("Nome não pode estar vazio") };
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: new Error("Usuário não autenticado") };
    }

    const metadata = user.user_metadata || {};

    const { error } = await supabase.auth.updateUser({
      data: {
        ...metadata,
        full_name: newName.trim(),
      },
    });

    if (error) {
      console.error("❌ [UserAvatar] Erro ao atualizar nome:", error);
      return { error: new Error(error.message) };
    }

    console.log("✅ [UserAvatar] Nome atualizado com sucesso");
    return { error: null };
  } catch (err) {
    console.error("❌ [UserAvatar] Erro inesperado:", err);
    return { error: err as Error };
  }
}

