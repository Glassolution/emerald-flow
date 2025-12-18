import { Outlet, Link } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
            <span className="font-bold text-2xl text-foreground">ELO</span>
          </Link>
          
          <Outlet />
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-foreground items-center justify-center p-12">
        <div className="max-w-lg text-background">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-8">
            <span className="text-primary-foreground font-bold text-3xl">E</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Transforme seu negócio com o ELO
          </h2>
          <p className="text-background/70 text-lg">
            A plataforma completa que conecta todas as áreas da sua empresa em um só lugar. 
            Simplifique processos, aumente a produtividade e tome decisões melhores.
          </p>
          
          {/* Decorative Elements */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="h-24 rounded-xl bg-background/5" />
            <div className="h-24 rounded-xl bg-primary/20" />
            <div className="h-24 rounded-xl bg-background/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
