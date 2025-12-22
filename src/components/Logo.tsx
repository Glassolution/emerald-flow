import { Plane } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

const textSizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export function Logo({ size = "md", className = "", showText = false }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeMap[size]} relative`}>
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl" />
        
        {/* Logo Container - Verde gradiente */}
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center shadow-2xl shadow-green-500/30">
          {/* Drone Icon - Preto */}
          <Plane 
            size={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 32 : 24} 
            className="text-black" 
            strokeWidth={2} 
          />
        </div>
      </div>
      
      {/* Texto "Calc" abaixo do logo */}
      {showText && (
        <h1 className={`${textSizeMap[size]} font-bold text-black mt-2 tracking-tight`}>
          Calc
        </h1>
      )}
    </div>
  );
}
