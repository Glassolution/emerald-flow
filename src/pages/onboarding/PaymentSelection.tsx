import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, CreditCard, Check, MoreVertical } from "lucide-react";
import paypalImg from "@/assets/Paypal.png";
import appleImg from "@/assets/apple.png";

export default function PaymentSelection() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [savedMethods, setSavedMethods] = useState<Array<{
    id: string;
    type: 'card' | 'pix';
    brand?: string;
    lastFour?: string;
    pixKey?: string;
  }>>([]);
  const STORAGE_KEY = "calc_payment_methods";
  const handleBackClick = () => {
    const fallback = '/onboarding/start-experience';
    const hasHistory = typeof window !== 'undefined' && window.history.length > 1;
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) as typeof savedMethods : [];
      setSavedMethods(list);
      setSelectedMethod(list[0]?.id ?? "");
    } catch {
      setSavedMethods([]);
      setSelectedMethod("");
    }
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#1a1b1e] text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <button onClick={handleBackClick} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium">Pagamento</h1>
        <button className="p-2 -mr-2 text-white/80 hover:text-white transition-colors">
          <MoreVertical size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {/* Lista de métodos salvos (apenas quando existir) */}
        {savedMethods.length > 0 && (
          <div className="space-y-3 mb-8">
            {savedMethods.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border ${
                  selectedMethod === m.id
                    ? "bg-[#25262b] border-emerald-500"
                    : "bg-[#25262b]/50 border-transparent hover:bg-[#25262b]"
                }`}
              >
                <div className="flex items-center gap-4">
                  {m.type === "card" ? (
                    <div className="w-10 h-10 rounded-full bg-[#1e2025] flex items-center justify-center">
                      <CreditCard size={18} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1e2025] flex items-center justify-center">
                      <div className="w-5 h-5 rounded-sm bg-[#22c55e]" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-white">
                      {m.type === "card" ? (m.brand || "Cartão") : "Pix"}
                    </span>
                    <span className="text-[12px] text-gray-400">
                      {m.type === "card" ? `•••• •••• •••• ${m.lastFour || "0000"}` : m.pixKey}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    selectedMethod === m.id ? "bg-emerald-500" : "border-2 border-gray-600"
                  }`}
                >
                  {selectedMethod === m.id && <Check size={12} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Payment Method Button */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 rounded-xl bg-[#1e2025] border border-emerald-500/30 text-emerald-400 font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-[#1e2025]/80 transition-all mb-8"
        >
          <Plus size={18} />
          Adicionar método de pagamento
        </button>

        {/* Coupon Code */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 bg-[#25262b] rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-5 h-5 bg-white/10 rounded flex items-center justify-center">
              <span className="text-[10px] font-bold">%</span>
            </div>
            <span className="text-[14px] text-gray-300">Ahmad787</span>
          </div>
          <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-emerald-600 transition-colors">
            Aplicar
          </button>
        </div>

        {/* Ticket Summary */}
        <div className="bg-[#25262b] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[14px] text-gray-400">Resumo</span>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={10} className="text-black" />
              </div>
              <span className="text-[12px] text-emerald-500 font-medium">Válido</span>
            </div>
          </div>

          <h3 className="text-[16px] font-medium text-white mb-6">Plano Premium Mensal</h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-400">Preço</span>
              <span className="text-white">R$ 49,90</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-400">Cupom</span>
              <span className="text-white">R$ 0,00</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-400">Taxa do evento</span>
              <span className="text-white">R$ 0,00</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-400">Imposto</span>
              <span className="text-white">R$ 0,00</span>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
            <span className="text-[14px] text-gray-400">Total</span>
            <span className="text-[20px] font-bold text-white">R$ 49,90</span>
          </div>
        </div>
      </div>

      {/* Pay Now Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#1a1b1e] border-t border-[#25262b]">
        <button 
          onClick={() => navigate('/onboarding/checkout')}
          disabled={!selectedMethod}
          className={`w-full text-white font-medium py-4 rounded-[20px] transition-all active:scale-[0.98] ${
            selectedMethod ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          Pagar agora
        </button>
      </div>

      {/* Add Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-[#25262b] w-full rounded-t-[32px] p-6 pb-12 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-white">Adicionar Pagamento</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400">
                <ChevronLeft className="rotate-[-90deg]" size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button className="w-full p-4 bg-[#1a1b1e] hover:bg-[#1a1b1e]/80 rounded-xl flex items-center gap-4 transition-colors group">
                <img src={paypalImg} alt="PayPal" className="w-10 h-10 rounded-full object-contain bg-[#1e2025] p-2" />
                <span className="text-white font-medium">PayPal</span>
              </button>

              <button 
                onClick={() => navigate('/onboarding/checkout')}
                className="w-full p-4 bg-[#1a1b1e] hover:bg-[#1a1b1e]/80 rounded-xl flex items-center gap-4 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1e2025] flex items-center justify-center group-hover:bg-emerald-500/10">
                  <CreditCard size={20} className="text-white group-hover:text-emerald-400" />
                </div>
                <span className="text-white font-medium">Cartão de Crédito</span>
              </button>

              <button className="w-full p-4 bg-[#1a1b1e] hover:bg-[#1a1b1e]/80 rounded-xl flex items-center gap-4 transition-colors group">
                <img src={appleImg} alt="Apple Pay" className="w-10 h-10 rounded-full object-contain bg-[#1e2025] p-2" />
                <span className="text-white font-medium">Apple Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
