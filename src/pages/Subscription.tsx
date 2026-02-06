import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Subscription() {
  const { isTrialExpired, daysRemaining } = useSubscription();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [timeLeft, setTimeLeft] = useState("00:00:00.00");

  const PLANS = {
    monthly: {
      price: "R$ 49,90",
      originalPrice: "R$ 124,90",
      period: t('subscription.plans.period.month'),
      link: "https://mpago.la/16iceTa",
      label: t('subscription.plans.monthly.label')
    },
    yearly: {
      price: "R$ 499,90",
      originalPrice: "R$ 1249,90",
      period: t('subscription.plans.period.year'),
      link: "https://mpago.la/1T9dTsU",
      label: t('subscription.plans.yearly.label')
    }
  };

  // Timer logic for the offer countdown (fake urgency or real trial time remaining)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simple countdown logic for demo purposes
      // If trial is active, show time remaining in trial. If expired, show 0 or reset.
      // The image shows "00:00:00.00 restante", implying hours:minutes:seconds.ms
      
      const now = new Date();
      // Mock end time: end of today
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      if (diff > 0) {
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          const ms = Math.floor((diff % 1000) / 10);
          
          setTimeLeft(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
          );
      } else {
          setTimeLeft("00:00:00.00");
      }
    }, 10);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    // Only allow closing if trial is NOT expired
    if (!isTrialExpired) {
      navigate(-1);
    }
  };

  const handleCheckout = () => {
    const link = PLANS[selectedPlan].link;
    if (user?.id) {
      const separator = link.includes('?') ? '&' : '?';
      window.location.href = `${link}${separator}external_reference=${user.id}&payer_email=${user.email}`;
    } else {
      window.location.href = link;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center bg-black/60 backdrop-blur-sm">
        {/* Close button - Only if trial active */}
        {!isTrialExpired && (
            <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-50"
            >
                <X className="w-6 h-6 text-white" />
            </button>
        )}

        {/* Background Image / Mockup Area - Simulated based on reference */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-[40vh]">
             {/* This area represents the background content behind the modal sheet */}
             {/* In a real implementation, we might see the actual app behind the backdrop-blur */}
        </div>

        {/* Main Modal Sheet */}
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-500 relative overflow-hidden">
            
            {/* Header */}
            <div className="text-center mb-6 pt-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('subscription.unlimitedAccess')}</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                    {/* Drone Icon Placeholder */}
                    <div className="text-3xl font-black flex items-center gap-2">
                        <span className="text-slate-900 dark:text-white">🚁 CALC</span>
                    </div>
                </div>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Monthly Plan */}
                <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                        selectedPlan === 'monthly' 
                        ? 'border-slate-900 bg-white shadow-lg scale-[1.02] z-10' 
                        : 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100'
                    }`}
                >
                    <div className="text-center">
                        <div className="font-bold text-lg text-slate-900">{t('subscription.monthly')}</div>
                        <div className="text-xs text-slate-400 line-through mt-1">{PLANS.monthly.originalPrice}{PLANS.monthly.period}</div>
                        <div className="font-bold text-slate-900">{PLANS.monthly.price}{PLANS.monthly.period}</div>
                    </div>
                </button>

                {/* Yearly Plan */}
                <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`relative p-4 rounded-2xl border-2 transition-all ${
                        selectedPlan === 'yearly' 
                        ? 'border-slate-900 bg-white shadow-lg scale-[1.02] z-10' 
                        : 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100'
                    }`}
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        {t('subscription.savePercent')}
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg text-slate-900">{t('subscription.yearly')}</div>
                        <div className="text-xs text-slate-400 line-through mt-1">{PLANS.yearly.originalPrice}{PLANS.yearly.period}</div>
                        <div className="font-bold text-slate-900">{PLANS.yearly.price}{PLANS.yearly.period}</div>
                    </div>
                </button>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
                <div className="font-mono text-slate-900 dark:text-white font-medium text-lg tracking-widest">
                    {timeLeft} {t('subscription.remaining')}
                </div>
            </div>

            {/* CTA Button */}
            <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-[#A3FF33] hover:bg-[#92e62e] text-slate-900 font-bold text-lg rounded-2xl shadow-lg shadow-[#A3FF33]/20 transition-all active:scale-95 mb-6"
            >
                {t('subscription.getPlan')} {selectedPlan === 'monthly' ? t('subscription.monthly') : t('subscription.yearly')} {t('subscription.withDiscount')}
            </button>

            {/* Footer */}
            <div className="text-center space-y-3">
                <button className="text-sm font-semibold text-slate-400 hover:text-slate-600">
                    {t('subscription.restorePurchases')}
                </button>
                <div className="flex justify-center gap-4 text-xs text-slate-400">
                    <button className="hover:text-slate-600">{t('subscription.terms')}</button>
                    <button className="hover:text-slate-600">{t('subscription.privacy')}</button>
                </div>
            </div>
        </div>
    </div>
  );
}
