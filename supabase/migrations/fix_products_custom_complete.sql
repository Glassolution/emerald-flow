-- Migração COMPLETA para garantir que products_custom tenha todas as colunas necessárias
-- Esta migração é idempotente e pode ser executada múltiplas vezes

-- 1. Criar tabela se não existir (com todas as colunas)
CREATE TABLE IF NOT EXISTS public.products_custom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Herbicida', 'Inseticida', 'Fungicida', 'Fertilizante', 'Adjuvante')),
  description TEXT NOT NULL,
  dose_value NUMERIC(10, 2) NOT NULL,
  dose_unit TEXT NOT NULL CHECK (dose_unit IN ('mL', 'L', 'g', 'kg', 'mL/L')),
  dose_min NUMERIC(10, 2),
  dose_max NUMERIC(10, 2),
  recommendations TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas que podem estar faltando (se a tabela já existir)
DO $$ 
BEGIN
    -- Adicionar dose_unit se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_unit'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN dose_unit TEXT NOT NULL DEFAULT 'mL' CHECK (dose_unit IN ('mL', 'L', 'g', 'kg', 'mL/L'));
        RAISE NOTICE 'Coluna dose_unit adicionada';
    END IF;

    -- Adicionar dose_value se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_value'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN dose_value NUMERIC(10, 2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Coluna dose_value adicionada';
    END IF;

    -- Adicionar dose_min se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_min'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN dose_min NUMERIC(10, 2);
        RAISE NOTICE 'Coluna dose_min adicionada';
    END IF;

    -- Adicionar dose_max se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_max'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN dose_max NUMERIC(10, 2);
        RAISE NOTICE 'Coluna dose_max adicionada';
    END IF;

    -- Adicionar recommendations se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'recommendations'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN recommendations TEXT;
        RAISE NOTICE 'Coluna recommendations adicionada';
    END IF;

    -- Adicionar notes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN notes TEXT;
        RAISE NOTICE 'Coluna notes adicionada';
    END IF;

    -- Adicionar image_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Coluna image_url adicionada';
    END IF;

    -- Adicionar updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada';
    END IF;
END $$;

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_products_custom_user_id ON public.products_custom(user_id);
CREATE INDEX IF NOT EXISTS idx_products_custom_category ON public.products_custom(category);

-- 4. Habilitar RLS
ALTER TABLE public.products_custom ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS (remover existentes primeiro para evitar conflito)
DROP POLICY IF EXISTS "Users can view own products" ON public.products_custom;
DROP POLICY IF EXISTS "Users can insert own products" ON public.products_custom;
DROP POLICY IF EXISTS "Users can update own products" ON public.products_custom;
DROP POLICY IF EXISTS "Users can delete own products" ON public.products_custom;

-- Política: Usuários só podem ver seus próprios produtos
CREATE POLICY "Users can view own products"
  ON public.products_custom
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir seus próprios produtos
CREATE POLICY "Users can insert own products"
  ON public.products_custom
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar seus próprios produtos
CREATE POLICY "Users can update own products"
  ON public.products_custom
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar seus próprios produtos
CREATE POLICY "Users can delete own products"
  ON public.products_custom
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_custom_updated_at ON public.products_custom;
CREATE TRIGGER update_products_custom_updated_at
  BEFORE UPDATE ON public.products_custom
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'products_custom';
  
  RAISE NOTICE 'Tabela products_custom criada/atualizada com % colunas', col_count;
  RAISE NOTICE 'Colunas obrigatórias verificadas: dose_unit, dose_value, name, category, description';
END $$;


