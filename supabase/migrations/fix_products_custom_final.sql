-- CORREÇÃO FINAL: Adicionar todas as colunas faltantes e remover colunas incorretas
-- Esta migração corrige a estrutura atual da tabela

-- 1. Adicionar colunas faltantes
DO $$ 
BEGIN
    -- Adicionar category se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN category TEXT NOT NULL DEFAULT 'Herbicida' CHECK (category IN ('Herbicida', 'Inseticida', 'Fungicida', 'Fertilizante', 'Adjuvante'));
        RAISE NOTICE 'Coluna category adicionada';
    END IF;

    -- Adicionar description se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN description TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Coluna description adicionada';
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

    -- Adicionar created_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada';
    END IF;

    -- Remover coluna 'unit' se existir (deve ser dose_unit)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'unit'
    ) THEN
        -- Verificar se há dados na coluna antes de remover
        -- Se houver, migrar para dose_unit se dose_unit não existir
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'products_custom' 
            AND column_name = 'dose_unit'
        ) THEN
            -- dose_unit já existe, apenas remover unit
            ALTER TABLE public.products_custom DROP COLUMN IF EXISTS unit;
            RAISE NOTICE 'Coluna unit removida (dose_unit já existe)';
        ELSE
            -- Migrar dados de unit para dose_unit antes de remover
            ALTER TABLE public.products_custom RENAME COLUMN unit TO dose_unit;
            RAISE NOTICE 'Coluna unit renomeada para dose_unit';
        END IF;
    END IF;

    -- Remover coluna 'dose_default' se existir (não é necessária)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_default'
    ) THEN
        ALTER TABLE public.products_custom DROP COLUMN IF EXISTS dose_default;
        RAISE NOTICE 'Coluna dose_default removida';
    END IF;

    -- Garantir que dose_unit tem o CHECK constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_unit'
    ) THEN
        -- Remover constraint antigo se existir
        ALTER TABLE public.products_custom DROP CONSTRAINT IF EXISTS products_custom_dose_unit_check;
        -- Adicionar constraint correto
        ALTER TABLE public.products_custom 
        ADD CONSTRAINT products_custom_dose_unit_check 
        CHECK (dose_unit IN ('mL', 'L', 'g', 'kg', 'mL/L'));
        RAISE NOTICE 'Constraint dose_unit atualizado';
    END IF;

    -- Garantir que dose_value não é NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_value'
        AND is_nullable = 'YES'
    ) THEN
        -- Atualizar valores NULL para 0
        UPDATE public.products_custom SET dose_value = 0 WHERE dose_value IS NULL;
        -- Tornar NOT NULL
        ALTER TABLE public.products_custom ALTER COLUMN dose_value SET NOT NULL;
        RAISE NOTICE 'Coluna dose_value agora é NOT NULL';
    END IF;

    -- Garantir que dose_unit não é NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_unit'
        AND is_nullable = 'YES'
    ) THEN
        -- Atualizar valores NULL para 'mL'
        UPDATE public.products_custom SET dose_unit = 'mL' WHERE dose_unit IS NULL;
        -- Tornar NOT NULL
        ALTER TABLE public.products_custom ALTER COLUMN dose_unit SET NOT NULL;
        RAISE NOTICE 'Coluna dose_unit agora é NOT NULL';
    END IF;
END $$;

-- 2. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
  missing_cols TEXT[];
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'products_custom';
  
  -- Verificar colunas obrigatórias
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_custom' AND column_name = 'category') THEN
    missing_cols := array_append(missing_cols, 'category');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_custom' AND column_name = 'description') THEN
    missing_cols := array_append(missing_cols, 'description');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_custom' AND column_name = 'dose_unit') THEN
    missing_cols := array_append(missing_cols, 'dose_unit');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_custom' AND column_name = 'dose_value') THEN
    missing_cols := array_append(missing_cols, 'dose_value');
  END IF;

  IF array_length(missing_cols, 1) > 0 THEN
    RAISE EXCEPTION 'Colunas obrigatórias faltando: %', array_to_string(missing_cols, ', ');
  ELSE
    RAISE NOTICE '✅ Tabela products_custom corrigida com sucesso! Total de colunas: %', col_count;
    RAISE NOTICE '✅ Todas as colunas obrigatórias estão presentes';
  END IF;
END $$;


