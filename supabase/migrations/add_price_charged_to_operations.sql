-- Migração para adicionar campo price_charged na tabela operations
-- Esta migração é idempotente e pode ser executada múltiplas vezes

-- 1. Adicionar coluna price_charged se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'operations' 
      AND column_name = 'price_charged'
  ) THEN
    ALTER TABLE public.operations 
    ADD COLUMN price_charged NUMERIC(10, 2) DEFAULT 0 NOT NULL;
    
    RAISE NOTICE '✅ Coluna price_charged adicionada com sucesso';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna price_charged já existe';
  END IF;
END $$;

-- 2. Garantir que valores NULL sejam 0 (para compatibilidade com dados existentes)
UPDATE public.operations 
SET price_charged = 0 
WHERE price_charged IS NULL;

-- 3. Adicionar constraint para garantir valor não negativo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'operations_price_charged_check'
  ) THEN
    ALTER TABLE public.operations 
    ADD CONSTRAINT operations_price_charged_check 
    CHECK (price_charged >= 0);
    
    RAISE NOTICE '✅ Constraint de validação adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Constraint já existe';
  END IF;
END $$;

-- 4. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'operations'
    AND column_name = 'price_charged';
  
  IF col_count > 0 THEN
    RAISE NOTICE '✅ Campo price_charged verificado e pronto para uso';
  ELSE
    RAISE WARNING '⚠️ Campo price_charged não foi encontrado';
  END IF;
END $$;




