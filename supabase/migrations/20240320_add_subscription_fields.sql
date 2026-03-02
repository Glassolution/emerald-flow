-- SQL para atualizar a tabela profiles com campos de assinatura
-- Rode este comando no SQL Editor do seu Supabase

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_id TEXT;

-- Índice para performance em buscas por status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.is_premium IS 'Indica se o usuário tem acesso premium ativo';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status da assinatura: active, inactive, past_due, etc.';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'Data de expiração do acesso premium';
COMMENT ON COLUMN public.profiles.last_payment_id IS 'ID do último pagamento processado para idempotência';
