import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: { message: string } | null }>;
  signInWithGoogle: () => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.warn("⚠️ [AuthContext] Loading timeout - forcing loading to false");
    }, 5000); // 5 seconds max

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
      return { error: { message: "Supabase não configurado" } };
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

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return { user: null, error: { message: "Supabase não configurado" } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error };
      }

      setUser(data.user);
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message || "Erro ao criar conta" } };
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: { message: "Supabase não configurado" } };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/loading`,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
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
