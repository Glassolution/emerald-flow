import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

type Plan = 'pro' | 'free'

interface SubscriptionContextType {
  plan: Plan
  isPro: boolean
  isFree: boolean
  isCancelled: boolean
  isTrialActive: boolean
  canCalculate: () => boolean
  registerCalculation: () => void
  calculationsUsedToday: number
  FREE_DAILY_LIMIT: number
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

const FREE_DAILY_LIMIT = 1

function getTodayKey(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  return `calc_count_${userId}_${today}`
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth()
  const [plan, setPlan] = useState<Plan>('free')
  const [isCancelled, setIsCancelled] = useState(false)
  const [isTrialActive, setIsTrialActive] = useState(false)
  const [calculationsUsedToday, setCalculationsUsedToday] = useState(0)

  const resolveSubscription = useCallback(() => {
    if (!user) return

    const meta = user.user_metadata ?? {}
    const status = meta.subscription_status
    const premium = meta.premium === true
    const trial = meta.trial_active === true

    setIsTrialActive(trial)

    if (status === 'cancelled') {
      // FREEMIUM: cancelado vira free, NÃO bloqueia
      setPlan('free')
      setIsCancelled(true)
    } else if (premium || status === 'subscription_active') {
      setPlan('pro')
      setIsCancelled(false)
    } else {
      setPlan('free')
      setIsCancelled(false)
    }

    // Carrega contagem de cálculos do dia
    const key = getTodayKey(user.id)
    const stored = parseInt(localStorage.getItem(key) ?? '0', 10)
    setCalculationsUsedToday(stored)
  }, [user])

  useEffect(() => {
    resolveSubscription()
  }, [resolveSubscription])

  const refreshSubscription = useCallback(async () => {
    await refreshUser()
    resolveSubscription()
  }, [refreshUser, resolveSubscription])

  const canCalculate = useCallback(() => {
    if (plan === 'pro') return true
    return calculationsUsedToday < FREE_DAILY_LIMIT
  }, [plan, calculationsUsedToday])

  const registerCalculation = useCallback(() => {
    if (plan === 'pro') return
    if (!user) return

    const key = getTodayKey(user.id)
    const newCount = calculationsUsedToday + 1
    localStorage.setItem(key, String(newCount))
    setCalculationsUsedToday(newCount)
  }, [plan, user, calculationsUsedToday])

  return (
    <SubscriptionContext.Provider value={{
      plan,
      isPro: plan === 'pro',
      isFree: plan === 'free',
      isCancelled,
      isTrialActive,
      canCalculate,
      registerCalculation,
      calculationsUsedToday,
      FREE_DAILY_LIMIT,
      refreshSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider')
  return ctx
}
