/**
 * Componente de loading circular minimalista
 * Spinner verde com fundo branco - estilo Apple/iOS
 */
export function CircularLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      {/* Spinner circular */}
      <div className="relative w-16 h-16">
        {/* Círculo de fundo (cinza claro) */}
        <div 
          className="absolute inset-0 rounded-full border-[3px] border-gray-200"
        />
        
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
