import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface ProfileData {
  fullName: string;
  companyName: string;
  drones?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string, profileData?: ProfileData) => Promise<{ user: User | null; error: { message: string } | null }>;
  signInWithGoogle: () => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading - reduzido para 2 segundos
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.warn("⚠️ [AuthContext] Loading timeout - forcing loading to false");
    }, 2000); // 2 seconds max

    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        console.warn("⚠️ [AuthContext] Supabase client not initialized");
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ [AuthContext] Error getting session:", error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("❌ [AuthContext] Error in getInitialSession:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (supabase) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });
      
      subscription = authSubscription;
    }

    return () => {
      clearTimeout(safetyTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: "Supabase não configurado. Verifique as chaves de API no painel da Vercel." } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || "Erro ao fazer login" } };
    }
  };

  const signUp = async (email: string, password: string, profileData?: ProfileData) => {
    if (!supabase) {
      return { user: null, error: { message: "Supabase não configurado" } };
    }

    try {
      console.log("🔄 [AuthContext] Criando conta...");
      
      // Se temos dados do perfil, incluir no user_metadata
      const signUpOptions: any = {
        emailRedirectTo: undefined,
      };
      
      if (profileData) {
        console.log("📍 [AuthContext] Incluindo dados do perfil no registro");
        signUpOptions.data = {
          full_name: profileData.fullName,
          company_name: profileData.companyName,
          drones: profileData.drones || "",
          profile_completed: true, // Marca como completo pois veio do registro manual
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: signUpOptions,
      });

      if (error) {
        console.error("❌ [AuthContext] Erro no signUp:", error);
        return { user: null, error };
      }

      console.log("✅ [AuthContext] Conta criada com sucesso");
      if (profileData) {
        console.log("✅ [AuthContext] Perfil salvo junto com a conta");
      }
      
      // Se a confirmação de email estiver desligada, o usuário já estará logado
      // O onAuthStateChange vai capturar a sessão e atualizar o estado
      
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error("❌ [AuthContext] Erro inesperado no signUp:", error);
      return { user: null, error: { message: error.message || "Erro ao criar conta" } };
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error("❌ [GoogleAuth] Supabase não configurado");
      return { error: { message: "Supabase não configurado" } };
    }

    try {
      console.log("🔄 [GoogleAuth] Iniciando OAuth com Google...");
      console.log("📍 [GoogleAuth] Redirect URL:", `${window.location.origin}/loading`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/loading`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("❌ [GoogleAuth] Erro no OAuth:", error);
        return { error };
      }

      console.log("✅ [GoogleAuth] OAuth iniciado, redirecionando para Google...");
      return { error: null };
    } catch (error: any) {
      console.error("❌ [GoogleAuth] Erro inesperado:", error);
      return { error: { message: error.message || "Erro ao fazer login com Google" } };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("❌ [AuthContext] Error signing out:", error);
    }
  };

  // Força atualização do usuário do Supabase (útil após atualizar user_metadata)
  const refreshUser = async () => {
    if (!supabase) {
      return;
    }

    try {
      console.log("🔄 [AuthContext] Atualizando dados do usuário...");
      const { data: { user: refreshedUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("❌ [AuthContext] Erro ao atualizar usuário:", error);
        return;
      }
      
      if (refreshedUser) {
        console.log("✅ [AuthContext] Usuário atualizado com sucesso");
        console.log("📍 [AuthContext] profile_completed:", refreshedUser.user_metadata?.profile_completed);
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error("❌ [AuthContext] Erro ao atualizar usuário:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
