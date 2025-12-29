-- Adicionar colunas dose_min e dose_max se não existirem
-- Esta migração é segura para executar mesmo se as colunas já existirem

DO $$ 
BEGIN
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
    ELSE
        RAISE NOTICE 'Coluna dose_min já existe';
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
    ELSE
        RAISE NOTICE 'Coluna dose_max já existe';
    END IF;
END $$;




