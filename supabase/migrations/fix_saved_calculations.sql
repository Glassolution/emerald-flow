-- Migração para criar/corrigir tabela saved_calculations
-- Esta migração é idempotente e pode ser executada múltiplas vezes

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.saved_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  calculation_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
    -- Adicionar title se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'saved_calculations' 
        AND column_name = 'title'
    ) THEN
        ALTER TABLE public.saved_calculations 
        ADD COLUMN title TEXT NOT NULL DEFAULT 'Cálculo sem título';
        RAISE NOTICE 'Coluna title adicionada';
    END IF;

    -- Adicionar calculation_data se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'saved_calculations' 
        AND column_name = 'calculation_data'
    ) THEN
        ALTER TABLE public.saved_calculations 
        ADD COLUMN calculation_data JSONB NOT NULL DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Coluna calculation_data adicionada';
    END IF;

    -- Adicionar updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'saved_calculations' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.saved_calculations 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada';
    END IF;
END $$;

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS saved_calculations_user_id_idx ON public.saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS saved_calculations_created_at_idx ON public.saved_calculations(created_at DESC);

-- 4. Habilitar RLS
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS (remover existentes primeiro para evitar conflito)
DROP POLICY IF EXISTS "Users can view own calculations" ON public.saved_calculations;
DROP POLICY IF EXISTS "Users can insert own calculations" ON public.saved_calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON public.saved_calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON public.saved_calculations;

-- Política: Usuários só podem ver seus próprios cálculos
CREATE POLICY "Users can view own calculations"
  ON public.saved_calculations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir seus próprios cálculos
CREATE POLICY "Users can insert own calculations"
  ON public.saved_calculations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar seus próprios cálculos
CREATE POLICY "Users can update own calculations"
  ON public.saved_calculations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar seus próprios cálculos
CREATE POLICY "Users can delete own calculations"
  ON public.saved_calculations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_saved_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_saved_calculations_updated_at ON public.saved_calculations;
CREATE TRIGGER update_saved_calculations_updated_at
  BEFORE UPDATE ON public.saved_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_calculations_updated_at();

-- 7. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'saved_calculations';
  
  RAISE NOTICE '✅ Tabela saved_calculations criada/atualizada com % colunas', col_count;
  RAISE NOTICE '✅ Colunas obrigatórias verificadas: title, calculation_data, user_id';
END $$;




