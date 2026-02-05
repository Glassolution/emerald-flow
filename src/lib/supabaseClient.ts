import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get environment variables using import.meta.env (Vite standard)
// Vite only exposes variables prefixed with VITE_ to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log all VITE_ env vars (for troubleshooting)
if (import.meta.env.DEV) {
  console.log("🔍 [Supabase] All VITE_ environment variables:", Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

// Clean and trim variables
const trimmedUrl = supabaseUrl ? String(supabaseUrl).trim() : "";
const trimmedKey = supabaseAnonKey ? String(supabaseAnonKey).trim() : "";

// Debug: Log environment variables (without exposing full keys)
console.log("🔍 [Supabase] Checking environment variables...");
console.log("🔍 [Supabase] VITE_SUPABASE_URL exists:", !!supabaseUrl);
console.log("🔍 [Supabase] VITE_SUPABASE_URL type:", typeof supabaseUrl);
console.log("🔍 [Supabase] VITE_SUPABASE_URL value:", supabaseUrl ? `${trimmedUrl.substring(0, 30)}...` : "undefined");
console.log("🔍 [Supabase] VITE_SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
console.log("🔍 [Supabase] VITE_SUPABASE_ANON_KEY type:", typeof supabaseAnonKey);
console.log("🔍 [Supabase] VITE_SUPABASE_ANON_KEY length:", trimmedKey.length);

// Validate environment variables
const isSupabaseConfigured = (() => {
  // Check if variables exist
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ [Supabase] Missing environment variables");
    return false;
  }

  // Check if they are placeholder values or empty
  
  if (
    trimmedUrl === "" ||
    trimmedKey === "" ||
    trimmedUrl === "your_supabase_project_url" ||
    trimmedUrl.includes("your-project-id") ||
    trimmedUrl.includes("your-project") ||
    trimmedKey === "your_supabase_anon_key" ||
    trimmedKey === "your-anon-key-here" ||
    trimmedKey.includes("your-anon-key")
  ) {
    console.error("❌ [Supabase] Environment variables contain placeholder values");
    console.error("❌ [Supabase] Please replace with your actual Supabase credentials");
    return false;
  }

  // Check URL format and remove trailing slash if present
  if (!trimmedUrl.startsWith("https://")) {
    console.error("❌ [Supabase] VITE_SUPABASE_URL must start with https://");
    return false;
  }
  
  // Remove trailing slash from URL (Supabase doesn't need it)
  if (trimmedUrl.endsWith("/")) {
    console.warn("⚠️ [Supabase] URL has trailing slash, it will be removed automatically");
  }

  // Check key format
  // Supabase supports both traditional JWT anon keys (long) and publishable keys (shorter, starts with sb_publishable_)
  const isPublishableKey = trimmedKey.startsWith("sb_publishable_");
  const isJWTKey = trimmedKey.startsWith("eyJ"); // JWT tokens start with "eyJ"
  
  if (!isPublishableKey && !isJWTKey) {
    // If it's neither format, check minimum length
    if (trimmedKey.length < 20) {
      console.error("❌ [Supabase] VITE_SUPABASE_ANON_KEY appears to be invalid (too short)");
      return false;
    }
  }
  
  // Publishable keys should be at least 20 chars, JWT keys should be at least 50 chars
  if (isPublishableKey && trimmedKey.length < 20) {
    console.error("❌ [Supabase] VITE_SUPABASE_ANON_KEY (publishable) appears to be invalid (too short)");
    return false;
  }
  
  if (isJWTKey && trimmedKey.length < 50) {
    console.error("❌ [Supabase] VITE_SUPABASE_ANON_KEY (JWT) appears to be invalid (too short)");
    return false;
  }

  return true;
})();

// Create Supabase client only if configured
let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    // Remove trailing slash from URL if present
    const cleanUrl = trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : trimmedUrl;
    
    supabase = createClient(cleanUrl, trimmedKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log("✅ [Supabase] Client initialized successfully");
    console.log("✅ [Supabase] URL:", cleanUrl);
    console.log("✅ [Supabase] Key type:", trimmedKey.startsWith("sb_publishable_") ? "Publishable Key" : "JWT Anon Key");
  } catch (error) {
    console.error("❌ [Supabase] Failed to create client:", error);
    supabase = null;
  }
} else {
  console.error("═══════════════════════════════════════════════════════");
  console.error("❌ [Supabase] Client NOT initialized");
  console.error("═══════════════════════════════════════════════════════");
  console.error("");
  console.error("📋 To fix this error:");
  console.error("");
  console.error("1. Open the file: .env.local (in the project root)");
  console.error("2. Replace the placeholder values with your actual Supabase credentials:");
  console.error("   VITE_SUPABASE_URL=https://your-actual-project.supabase.co");
  console.error("   VITE_SUPABASE_ANON_KEY=your-actual-anon-key");
  console.error("");
  console.error("3. Get your credentials from:");
  console.error("   https://supabase.com/dashboard/project/_/settings/api");
  console.error("");
  console.error("4. IMPORTANT: Restart the dev server after updating .env.local");
  console.error("   Stop the server (Ctrl+C) and run: npm run dev");
  console.error("");
  console.error("═══════════════════════════════════════════════════════");
  
  // Additional check: verify if .env.local exists
  if (typeof window === 'undefined') {
    // Node.js environment check
    console.error("💡 Tip: Make sure the file is named exactly '.env.local' (with the dot)");
  }
}

export { supabase };

// Helper function to test connection
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) {
    console.warn("⚠️ Supabase client not initialized - skipping connection test");
    return false;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Supabase connection error:", error.message);
      return false;
    }
    
    console.log("✅ Supabase connected successfully!");
    console.log("📊 Session status:", data.session ? "Active session" : "No active session");
    return true;
  } catch (err) {
    console.error("❌ Supabase connection failed:", err);
    return false;
  }
}

