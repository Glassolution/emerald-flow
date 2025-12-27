import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const ONBOARDING_KEY = "calc_onboarding_completed";
const MIN_SPLASH_TIME = 800;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  onboardingCompleted: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check onboarding status from localStorage
    const onboardingStatus = localStorage.getItem(ONBOARDING_KEY) === "true";
    setOnboardingCompleted(onboardingStatus);

    // Global timeout - always resolve loading after max 2 seconds
    const globalTimeout = setTimeout(() => {
      console.warn("⚠️ [AuthContext] Global timeout reached, forcing loading to false");
      setLoading(false);
    }, 2000);

    if (!supabase) {
      console.warn("⚠️ [AuthContext] Supabase client is null - auth features disabled");
      console.warn("⚠️ [AuthContext] App will work in offline mode");
      // Set loading to false immediately if Supabase is not configured
      clearTimeout(globalTimeout);
      setLoading(false);
      return;
    }

    console.log("🔍 [AuthContext] Initializing auth state...");
    const startTime = Date.now();

    // Get initial session with aggressive timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.warn("⚠️ [AuthContext] Session check timeout (1.5s), proceeding without session");
        resolve({ data: { session: null }, error: null });
      }, 1500); // 1.5 seconds max
    });

    // Listen for auth changes - NEVER use async callback directly to prevent deadlock
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔍 [AuthContext] Auth state changed:", event, session ? "Session active" : "No session");
      
      // Update state synchronously first
      setSession(session);
      setUser(session?.user ?? null);
      
      // Save userId to localStorage for fallback
      if (session?.user?.id) {
        localStorage.setItem("calc_user_id", session.user.id);
      } else {
        localStorage.removeItem("calc_user_id");
      }
      
      // If USER_UPDATED, defer the getUser call with setTimeout to prevent deadlock
      if (event === "USER_UPDATED" && session?.user) {
        setTimeout(() => {
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
              setUser(user);
              if (user.id) {
                localStorage.setItem("calc_user_id", user.id);
              }
            }
          });
        }, 0);
      }
    });

    Promise.race([sessionPromise, timeoutPromise])
      .then((result: any) => {
        clearTimeout(globalTimeout);
        const { data: { session }, error } = result;
        
        if (error) {
          console.error("❌ [AuthContext] Error getting session:", error.message);
        } else {
          console.log("✅ [AuthContext] Session retrieved:", session ? "Active" : "No session");
        }

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_SPLASH_TIME - elapsed);

        setTimeout(() => {
          setSession(session);
          setUser(session?.user ?? null);
          // Salvar userId no localStorage para fallback
          if (session?.user?.id) {
            localStorage.setItem("calc_user_id", session.user.id);
          } else {
            localStorage.removeItem("calc_user_id");
          }
          setLoading(false);
          console.log("✅ [AuthContext] Auth state initialized");
        }, remainingTime);
      })
      .catch((err) => {
        clearTimeout(globalTimeout);
        console.error("❌ [AuthContext] Unexpected error:", err);
        setLoading(false);
      });

    return () => {
      clearTimeout(globalTimeout);
      subscription.unsubscribe();
      console.log("🔍 [AuthContext] Cleanup: timeout cleared and listener unsubscribed");
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      console.error("❌ [AuthContext] signIn called but Supabase client is null");
      return { error: { message: "Supabase não configurado. Verifique o arquivo .env.local e reinicie o servidor." } as AuthError };
    }

    console.log("🔍 [AuthContext] Attempting sign in for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ [AuthContext] Sign in error:", error.message);
    } else {
      console.log("✅ [AuthContext] Sign in successful");
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      console.error("❌ [AuthContext] signUp called but Supabase client is null");
      return { 
        user: null, 
        error: { message: "Supabase não configurado. Verifique o arquivo .env.local e reinicie o servidor." } as AuthError 
      };
    }

    console.log("🔍 [AuthContext] Attempting sign up for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("❌ [AuthContext] Sign up error:", error.message);
    } else {
      console.log("✅ [AuthContext] Sign up successful", data.user ? "(user created)" : "(confirmation email sent)");
    }

    return { user: data?.user ?? null, error };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOnboardingCompleted(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        onboardingCompleted,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

