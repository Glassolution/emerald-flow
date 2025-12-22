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
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      {/* Mobile Phone Container */}
      <div className="w-full max-w-[390px] min-h-[844px] bg-white rounded-[40px] shadow-2xl overflow-hidden relative">
        {/* Status Bar */}
        <div className="h-12 bg-white flex items-center justify-center">
          <div className="w-[120px] h-[34px] bg-black rounded-full" />
        </div>

        {/* Main Content */}
        <div className="flex-1 px-5 pb-28 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-[#1a1a1a]">Calc</span>
            </div>
            <Link 
              to="/auth/login"
              className="px-5 py-2.5 bg-[#1a1a1a] text-white text-[14px] font-medium rounded-full"
            >
              Entrar
            </Link>
          </div>

          {/* Hero */}
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-[#1a1a1a] leading-tight mb-3">
              Gerencie seu negócio de forma simples
            </h1>
            <p className="text-[14px] text-[#8a8a8a] leading-relaxed">
              Automatize processos e cresça mais rápido.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-[#f5f5f5] rounded-2xl p-4 flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-2">
                  <feature.icon size={18} className="text-white" />
                </div>
                <span className="text-[13px] font-semibold text-[#1a1a1a]">{feature.title}</span>
              </div>
            ))}
          </div>

          {/* Hero Card Preview */}
          <div className="relative rounded-[24px] overflow-hidden shadow-xl mb-5">
            <div className="relative h-[200px]">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
                alt="Dashboard"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                <Heart size={16} className="text-[#1a1a1a]" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium rounded-full mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Dashboard
                </span>
                <h3 className="text-[20px] font-bold text-white mb-1">
                  Visão Geral
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-semibold text-white">5.0</span>
                  </div>
                  <span className="text-[10px] text-white/80">5.000+ empresas</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between">
              <span className="text-white text-[13px] font-medium">Começar grátis</span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <ArrowRight size={14} className="text-[#1a1a1a]" />
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["Sem cartão", "14 dias grátis", "Cancele quando quiser"].map((text) => (
              <div key={text} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check size={10} className="text-primary" />
                </div>
                <span className="text-[12px] text-[#8a8a8a]">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link 
              to="/auth/cadastro"
              className="flex items-center justify-center w-full h-12 bg-[#1a1a1a] text-white text-[14px] font-semibold rounded-full"
            >
              Criar conta grátis
              <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link 
              to="/auth/login"
              className="flex items-center justify-center w-full h-12 bg-[#f5f5f5] text-[#1a1a1a] text-[14px] font-semibold rounded-full"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-white px-6 pb-8 pt-3">
          <div className="bg-[#1a1a1a] rounded-full px-3 py-1.5 flex items-center justify-around">
            <button className="p-2.5">
              <Home size={20} className="text-white" />
            </button>
            <button className="p-2.5">
              <Bookmark size={20} className="text-white/50" />
            </button>
            <button className="p-2.5">
              <Heart size={20} className="text-white/50" />
            </button>
            <button className="p-2.5">
              <User size={20} className="text-white/50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
