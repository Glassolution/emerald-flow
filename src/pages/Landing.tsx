import { Link } from "react-router-dom";
import { ArrowRight, Zap, BarChart3, Users, MessageSquare, Check, Star, Heart, Home, Bookmark, User } from "lucide-react";

const features = [
  { icon: Zap, title: "Automação" },
  { icon: BarChart3, title: "Métricas" },
  { icon: Users, title: "Equipe" },
  { icon: MessageSquare, title: "Chat IA" },
];

export default function Landing() {
  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-white flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="w-full flex-1 flex flex-col relative overflow-x-hidden md:max-w-[430px] md:mx-auto md:shadow-2xl md:my-8 md:rounded-[40px] md:border md:border-border">
        {/* Status Bar Spacer (Desktop Only) */}
        <div className="hidden md:flex h-12 bg-white items-center justify-center">
          <div className="w-[120px] h-[34px] bg-black rounded-full" />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-32 pt-8 overflow-y-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-2xl text-[#1a1a1a] tracking-tight">Calc</span>
            </div>
            <Link 
              to="/auth/login"
              className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[14px] font-bold rounded-full active:scale-95 transition-all shadow-md"
            >
              Entrar
            </Link>
          </div>

          {/* Hero */}
          <div className="mb-8 px-1">
            <h1 className="text-[32px] font-black text-[#1a1a1a] leading-[1.1] mb-4">
              Gerencie seu negócio de forma simples
            </h1>
            <p className="text-[16px] text-[#8a8a8a] leading-relaxed font-medium">
              Automatize processos e cresça mais rápido com a melhor ferramenta para o seu campo.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-[#f8f9fb] rounded-[24px] p-5 flex flex-col items-start shadow-sm border border-gray-50"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-3 shadow-md">
                  <feature.icon size={20} className="text-white" />
                </div>
                <span className="text-[14px] font-bold text-[#1a1a1a]">{feature.title}</span>
              </div>
            ))}
          </div>

          {/* Hero Card Preview */}
          <div className="relative rounded-[32px] overflow-hidden shadow-xl mb-8 group">
            <div className="relative h-[220px]">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
                alt="Dashboard"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <button className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md active:scale-90 transition-all">
                <Heart size={18} className="text-[#1a1a1a]" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[12px] font-bold rounded-full mb-3 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Dashboard
                </span>
                <h3 className="text-[24px] font-bold text-white mb-1.5">
                  Visão Geral
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/10">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[12px] font-bold text-white">5.0</span>
                  </div>
                  <span className="text-[12px] text-white/80 font-medium">5.000+ empresas</span>
                </div>
              </div>
            </div>

            <Link to="/auth/register" className="bg-[#1a1a1a] px-6 py-4 flex items-center justify-between hover:bg-black transition-colors">
              <span className="text-white text-[15px] font-bold">Começar grátis</span>
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                <ArrowRight size={16} className="text-[#1a1a1a]" />
              </div>
            </Link>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-4 mb-8 px-1">
            {["Sem cartão", "14 dias grátis", "Cancele quando quiser"].map((text) => (
              <div key={text} className="flex items-center gap-2 bg-[#f0fff4] px-3 py-1.5 rounded-full border border-emerald-50">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check size={10} className="text-primary" />
                </div>
                <span className="text-[12px] text-emerald-700 font-bold">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 px-1">
            <Link 
              to="/auth/register"
              className="flex items-center justify-center w-full h-14 bg-[#1a1a1a] text-white text-[16px] font-bold rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-black/10"
            >
              Criar conta grátis
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link 
              to="/auth/login"
              className="flex items-center justify-center w-full h-14 bg-[#f8f9fb] text-[#1a1a1a] text-[16px] font-bold rounded-2xl active:scale-[0.98] transition-all border border-gray-100"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Bottom Navigation (Safe Area Compatible) */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl px-6 pt-4 border-t border-gray-50 z-50"
          style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
        >
          <div className="bg-[#1a1a1a] rounded-full px-4 py-2 flex items-center justify-around shadow-2xl">
            <button className="p-3 active:scale-90 transition-all">
              <Home size={22} className="text-white" />
            </button>
            <button className="p-3 active:scale-90 transition-all opacity-40">
              <Bookmark size={22} className="text-white" />
            </button>
            <button className="p-3 active:scale-90 transition-all opacity-40">
              <Heart size={22} className="text-white" />
            </button>
            <button className="p-3 active:scale-90 transition-all opacity-40">
              <User size={22} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
