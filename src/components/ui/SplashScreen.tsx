import { Logo } from "@/components/Logo";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Glow Effect */}
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Logo with Text */}
        <div className="relative mb-8">
          <Logo size="xl" showText={true} className="animate-pulse" />
        </div>
        
        {/* Subtitle */}
        <p className="text-sm text-gray-400 mb-12">Pulverização Agrícola</p>
        
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-8 h-8 border-2 border-green-500/20 rounded-full" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-green-500 rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

