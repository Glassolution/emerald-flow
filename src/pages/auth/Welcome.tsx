import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plane, Droplets, Calculator, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/ui/SplashScreen";

export default function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [forceShow, setForceShow] = useState(false);

  // Force show content after max 1.5 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("⚠️ [Welcome] Force showing content after timeout");
      setForceShow(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading only if still loading AND not forced to show
  if (loading && !forceShow) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Logo size="lg" className="animate-pulse mb-4" />
          <div className="relative">
            <div className="w-8 h-8 border-2 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-green-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to app if already logged in
  useEffect(() => {
    if (user && !loading) {
      const checkProfile = async () => {
        const { isProfileComplete } = await import("@/lib/userProfile");
        const profileComplete = await isProfileComplete();
        if (profileComplete) {
          navigate("/app/home", { replace: true });
        } else {
          navigate("/auth/profile-setup", { replace: true });
        }
      };
      checkProfile();
    }
  }, [user, loading, navigate]);

  if (user) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&auto=format&fit=crop&q=80"
          alt="Drone Agrícola"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />
        {/* Green accent */}
        <div className="absolute inset-0 bg-green-500/10" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="relative mb-8">
          <Logo size="xl" showText={true} />
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center animate-pulse">
            <Sparkles size={16} className="text-black" />
          </div>
        </div>

        {/* App Name & Tagline */}
        <h1 className="text-5xl font-bold text-white tracking-tight mb-3 text-center">
          Calc
        </h1>
        <p className="text-green-400 text-lg font-medium text-center mb-12">
          Pulverização Agrícola com Drones
        </p>

        {/* Features Cards */}
        <div className="w-full max-w-md space-y-4 mb-12">
          <div className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <Plane size={28} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Drones Agrícolas</h3>
              <p className="text-sm text-gray-400">Pulverização precisa e eficiente</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <Calculator size={28} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Calculadora de Calda</h3>
              <p className="text-sm text-gray-400">Mistura perfeita para cada tanque</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
              <Droplets size={28} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Múltiplos Produtos</h3>
              <p className="text-sm text-gray-400">Gestão completa de defensivos</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-md space-y-3">
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 w-full h-16 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all shadow-2xl shadow-green-500/30 text-lg"
          >
            Entrar
            <ArrowRight size={22} />
          </Link>

          <Link
            to="/auth/register"
            className="flex items-center justify-center w-full h-16 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/20 active:scale-[0.98] transition-all border border-white/20 text-lg"
          >
            Criar conta
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">© 2024 Calc. Pulverização Agrícola.</p>
        </div>
      </div>
    </div>
  );
}
