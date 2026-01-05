/**
 * Tela de carregamento minimalista
 * Fundo branco com spinner verde - estilo consistente com CircularLoader
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      {/* Spinner circular */}
      <div className="relative w-16 h-16">
        {/* Círculo de fundo (cinza claro) */}
        <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
        
        {/* Círculo animado (verde) */}
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#22c55e] animate-spin"
          style={{
            animationDuration: '1s',
            animationTimingFunction: 'linear',
          }}
        />
      </div>
    </div>
  );
}
