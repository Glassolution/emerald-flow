import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 [Main] Iniciando aplicação...");

// Error boundary global
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ [Main] Elemento root não encontrado!");
  document.body.innerHTML = '<div style="min-height:100vh;background:#22c55e;display:flex;align-items:center;justify-content:center;color:white;font-size:18px;">Erro: elemento root não encontrado</div>';
} else {
  console.log("✅ [Main] Elemento root encontrado");
  
  // Mostrar fallback imediatamente - design clean (fundo branco + spinner verde)
  rootElement.innerHTML = '<div style="min-height:100vh;background:white;display:flex;align-items:center;justify-content:center;"><svg width="64" height="64" viewBox="0 0 64 64" style="animation:spin 1s linear infinite;"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#22c55e" stop-opacity="0"/><stop offset="50%" stop-color="#22c55e" stop-opacity="0.5"/><stop offset="100%" stop-color="#22c55e" stop-opacity="1"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="none" stroke="#F3F4F6" stroke-width="3"/><circle cx="32" cy="32" r="28" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-dasharray="132 44" transform="rotate(-90 32 32)"/></svg></div><style>@keyframes spin{to{transform:rotate(360deg);}}</style>';
  
  try {
    console.log("🔄 [Main] Criando root do React...");
    const root = createRoot(rootElement);
    
    console.log("🔄 [Main] Renderizando App...");
    root.render(<App />);
    
    console.log("✅ [Main] App renderizado com sucesso");
  } catch (error: any) {
    console.error("❌ [Main] Erro ao renderizar app:", error);
    const errorMessage = error?.message || String(error || "Erro desconhecido");
    rootElement.innerHTML = `
      <div style="min-height:100vh;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
        <h2 style="font-size:20px;margin-bottom:12px;color:#1D1D1F;">Erro ao carregar aplicação</h2>
        <p style="font-size:14px;color:#86868B;text-align:center;max-width:500px;">${errorMessage}</p>
        <button onclick="window.location.reload()" style="margin-top:20px;padding:12px 24px;background:#22c55e;color:white;border:none;border-radius:9999px;font-weight:600;cursor:pointer;">Recarregar</button>
      </div>
    `;
  }
}
