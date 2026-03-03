import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useAuth } from '@/contexts/AuthContext'

export function SubscriptionGuard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isTrialActive, isPro } = useSubscription()

  useEffect(() => {
    if (!user) return

    const meta = user.user_metadata ?? {}
    const status = meta.subscription_status

    // Apenas bloqueia quem nunca pagou e trial expirou.
    // Cancelados (isFree + isCancelled) passam livremente como plano Free.
    if (!isPro && !isTrialActive && status !== 'cancelled') {
      navigate('/subscription')
    }
  }, [user, isPro, isTrialActive, navigate])

  return <Outlet />
}
