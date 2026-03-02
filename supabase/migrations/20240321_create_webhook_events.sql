-- Tabela para garantir idempotência de webhooks com Hardening
-- Armazena todos os eventos recebidos para evitar processamento duplicado e permitir auditoria

-- Extensão necessária para UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL, -- 'mercadopago', 'stripe', etc.
    event_type TEXT NOT NULL, -- 'payment', 'subscription', etc.
    resource_id TEXT NOT NULL, -- ID do recurso no provedor (ex: payment.id)
    request_id TEXT, -- ID da requisição (x-request-id)
    payload JSONB, -- Dados completos do evento
    signature_ts TEXT, -- Timestamp da assinatura (x-signature ts)
    signature_v1 TEXT, -- Hash da assinatura (x-signature v1)
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Idempotência por provider, tipo e recurso (permite re-processar tipos diferentes do mesmo recurso)
    CONSTRAINT unique_event_provider_type_resource UNIQUE (provider, event_type, resource_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_resource_id ON public.webhook_events(resource_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);

-- RLS (Row Level Security) - Hardening
-- ATENÇÃO: Apenas service_role pode inserir/ler (segurança total).
-- Nunca use a chave 'anon' ou 'public' para acessar esta tabela.
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on webhook_events"
    ON public.webhook_events
    AS PERMISSIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comentários
COMMENT ON TABLE public.webhook_events IS 'Log de eventos de webhook para idempotência e auditoria (Apenas Service Role)';
