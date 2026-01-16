import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Shield, Clock, Calendar, Lock } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
 

// Tipos
interface PaymentMethod {
  id: string;
  type: 'card' | 'pix';
  identifier: string;
  lastFour?: string;
  expiresAt?: string;
  cardType?: 'credit' | 'debit';
  brand?: string;
  pixKey?: string;
  isLinked?: boolean;
  isDefault: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

// Ícones dos métodos
const methodIcons: Record<string, React.ReactNode> = {
  card: <CreditCard size={24} className="text-gray-700" />,
  pix: <div className="w-6 h-6 rounded-full bg-[#22c55e]" />,
};

const methodLabels: Record<string, string> = {
  card: "Cartões",
  pix: "Pix",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  
  // Estados
  const [selectedType, setSelectedType] = useState<'card' | 'pix'>('card');
  const handleBackClick = () => {
    const fallback = '/onboarding/payment-selection';
    const hasHistory = typeof window !== 'undefined' && window.history.length > 1;
    if (hasHistory) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
  
  // Form states para cartão
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardKind, setCardKind] = useState<'credit' | 'debit'>('credit');
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [generatedPixKey] = useState("chave.pix@provedor.com");
  const [isPixLinked, setIsPixLinked] = useState(true);

  

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : "";
  };

  // Formatar validade
  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + "/" + numbers.substring(2, 4);
    }
    return numbers;
  };

  // Adicionar método de pagamento (mock)
  const handleAddMethod = () => {};

  // Remover método
  const handleRemoveMethod = (_id: string) => {};

  // Selecionar método
  const handleSelectMethod = (_id: string) => {};

  // Continuar para pagamento (mock)
  const handleContinueToPayment = () => {
    console.log("🚀 Gateway de pagamento será implementado futuramente");
    console.log("📋 Tipo selecionado:", selectedType);
    if (selectedType === 'card') {
      const numOk = cardNumber.replace(/\s/g, "").length >= 13;
      const expOk = cardExpiry.length === 5;
      const nameOk = cardName.trim().length > 2;
      const cvvOk = cardCvv.length === 3;
      if (!numOk || !expOk || !nameOk || !cvvOk) return;
    } else {
      if (!isPixLinked) return;
    }
    
    // Persistir método salvo no localStorage para aparecer na seleção
    try {
      const STORAGE_KEY = "calc_payment_methods";
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: Array<any> = raw ? JSON.parse(raw) : [];
      if (selectedType === 'card' && saveForFuture) {
        const digits = cardNumber.replace(/\D/g, "");
        const brand = /^4/.test(digits) ? "Visa" : /^5[1-5]/.test(digits) ? "Mastercard" : /^3[47]/.test(digits) ? "Amex" : "Cartão";
        const method = {
          id: Date.now().toString(),
          type: 'card' as const,
          brand,
          lastFour: digits.slice(-4),
        };
        // Evitar duplicados simples pelo lastFour + brand
        const exists = list.some((m: any) => m.type === 'card' && m.lastFour === method.lastFour && m.brand === method.brand);
        if (!exists) list.unshift(method);
      } else if (selectedType === 'pix') {
        const method = {
          id: Date.now().toString(),
          type: 'pix' as const,
          pixKey: generatedPixKey,
        };
        const exists = list.some((m: any) => m.type === 'pix' && m.pixKey === method.pixKey);
        if (!exists) list.unshift(method);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
    
    // Simular conclusão do onboarding
    completeOnboarding();
    navigate('/app/home', { replace: true });
  };

  return (
    <div className="min-h-[100svh] bg-[#f9f9f9] flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={handleBackClick} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-gray-900">Pagamento</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-gray-900">Pagamento</h2>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-2 mb-6">
            {(['card','pix'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-2 rounded-lg text-[14px] font-semibold ${
                  selectedType === type ? 'bg-indigo-900 text-white' : 'text-gray-700'
                }`}
              >
                {methodLabels[type]}
              </button>
            ))}
          </div>

          {selectedType === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Número do cartão</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="2048 0348 3409 0348"
                    maxLength={19}
                    className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-indigo-600 focus:outline-none transition-colors pr-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Nome do titular</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Kelly Aniston Jade"
                  className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-indigo-600 focus:outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Expira em</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="09/30"
                      maxLength={5}
                      className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-indigo-600 focus:outline-none transition-colors pr-12"
                    />
                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-gray-500 mb-2 block">CVV de 3 dígitos</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0,3))}
                      placeholder="942"
                      maxLength={3}
                      className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-indigo-600 focus:outline-none transition-colors pr-12"
                    />
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-[13px] font-semibold text-gray-600">Salvar cartão para o futuro</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCardKind('credit')}
                  className={`py-2 rounded-lg text-[14px] font-semibold ${
                    cardKind === 'credit' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Crédito
                </button>
                <button
                  onClick={() => setCardKind('debit')}
                  className={`py-2 rounded-lg text-[14px] font-semibold ${
                    cardKind === 'debit' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Débito
                </button>
              </div>
            </div>
          )}

          {selectedType === 'pix' && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Chave Pix gerada</label>
                <div className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent">
                  {generatedPixKey}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPixLinked}
                  onChange={(e) => setIsPixLinked(e.target.checked)}
                  className="w-4 h-4 text-[#22c55e] border-gray-300 rounded"
                />
                <span className="text-[13px] font-semibold text-gray-600">Vincular esta chave Pix</span>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <Clock size={20} className="text-[#22c55e] flex-shrink-0" />
            <p className="text-[13px] text-gray-700">Você só será cobrado após o período de teste.</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <Shield size={20} className="text-blue-500 flex-shrink-0" />
            <p className="text-[13px] text-gray-700">Você pode cancelar a qualquer momento.</p>
          </div>
        </div>
      </div>

      {/* Botão Continuar */}
      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleContinueToPayment}
          disabled={
            (selectedType === 'card' && (!cardNumber || !cardExpiry || !cardName || cardCvv.length < 3)) ||
            (selectedType === 'pix' && !isPixLinked)
          }
          className={`w-full py-5 px-8 text-white text-[18px] font-bold rounded-[20px] transition-all duration-300 ${
            (selectedType === 'card' && cardNumber && cardExpiry && cardName && cardCvv.length === 3) ||
            (selectedType === 'pix' && isPixLinked)
              ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Pagar com segurança
        </button>
      </div>

      {/* Página fixa - modal removido */}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
