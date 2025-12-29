-- Migração para atualizar tabela operations com campos completos
-- Esta migração é idempotente e pode ser executada múltiplas vezes

-- 1. Adicionar novas colunas se não existirem
DO $$ 
BEGIN
  -- farm_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'farm_name') THEN
    ALTER TABLE public.operations ADD COLUMN farm_name TEXT;
  END IF;

  -- field_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'field_name') THEN
    ALTER TABLE public.operations ADD COLUMN field_name TEXT;
  END IF;

  -- crop (renomear cultura se existir, ou criar crop)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'cultura') THEN
    -- Se cultura existe, renomear para crop
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'crop') THEN
      ALTER TABLE public.operations RENAME COLUMN cultura TO crop;
    END IF;
  ELSE
    -- Se cultura não existe e crop não existe, criar crop
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'crop') THEN
      ALTER TABLE public.operations ADD COLUMN crop TEXT;
    END IF;
  END IF;

  -- target
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'target') THEN
    ALTER TABLE public.operations ADD COLUMN target TEXT;
  END IF;

  -- product_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'product_name') THEN
    ALTER TABLE public.operations ADD COLUMN product_name TEXT;
  END IF;

  -- product_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'product_id') THEN
    ALTER TABLE public.operations ADD COLUMN product_id TEXT;
  END IF;

  -- dose_value
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'dose_value') THEN
    ALTER TABLE public.operations ADD COLUMN dose_value NUMERIC(10, 2);
  END IF;

  -- dose_unit
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'dose_unit') THEN
    ALTER TABLE public.operations ADD COLUMN dose_unit TEXT;
  END IF;

  -- volume_l_ha
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'volume_l_ha') THEN
    ALTER TABLE public.operations ADD COLUMN volume_l_ha NUMERIC(10, 2);
  END IF;

  -- drone_model
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'drone_model') THEN
    ALTER TABLE public.operations ADD COLUMN drone_model TEXT;
  END IF;

  -- status
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'status') THEN
    ALTER TABLE public.operations ADD COLUMN status TEXT DEFAULT 'planned';
  END IF;

  -- total_volume_l (calculado)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'total_volume_l') THEN
    ALTER TABLE public.operations ADD COLUMN total_volume_l NUMERIC(10, 2);
  END IF;

  -- total_product_quantity (calculado)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'total_product_quantity') THEN
    ALTER TABLE public.operations ADD COLUMN total_product_quantity NUMERIC(10, 2);
  END IF;

  -- Remover nome_da_operacao se existir (não é mais necessário)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'nome_da_operacao') THEN
    ALTER TABLE public.operations DROP COLUMN nome_da_operacao;
  END IF;
END $$;

-- 2. Atualizar valores padrão para campos obrigatórios existentes
UPDATE public.operations 
SET 
  farm_name = COALESCE(farm_name, 'Fazenda não informada'),
  field_name = COALESCE(field_name, 'Talhão não informado'),
  crop = COALESCE(crop, 'Cultura não informada'),
  status = COALESCE(status, 'planned')
WHERE farm_name IS NULL OR field_name IS NULL OR crop IS NULL OR status IS NULL;

-- 3. Tornar campos obrigatórios NOT NULL (após preencher valores padrão)
DO $$
BEGIN
  -- farm_name
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'operations' 
             AND column_name = 'farm_name' AND is_nullable = 'YES') THEN
    ALTER TABLE public.operations ALTER COLUMN farm_name SET NOT NULL;
  END IF;

  -- field_name
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'operations' 
             AND column_name = 'field_name' AND is_nullable = 'YES') THEN
    ALTER TABLE public.operations ALTER COLUMN field_name SET NOT NULL;
  END IF;

  -- crop
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'operations' 
             AND column_name = 'crop' AND is_nullable = 'YES') THEN
    ALTER TABLE public.operations ALTER COLUMN crop SET NOT NULL;
  END IF;

  -- status
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = 'operations' 
             AND column_name = 'status' AND is_nullable = 'YES') THEN
    ALTER TABLE public.operations ALTER COLUMN status SET DEFAULT 'planned';
    ALTER TABLE public.operations ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- 4. Adicionar constraint para status válido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'operations_status_check'
  ) THEN
    ALTER TABLE public.operations 
    ADD CONSTRAINT operations_status_check 
    CHECK (status IN ('planned', 'completed'));
  END IF;
END $$;

-- 5. Criar índices adicionais se não existirem
CREATE INDEX IF NOT EXISTS operations_farm_name_idx ON public.operations(farm_name);
CREATE INDEX IF NOT EXISTS operations_crop_idx ON public.operations(crop);
CREATE INDEX IF NOT EXISTS operations_status_idx ON public.operations(status);
CREATE INDEX IF NOT EXISTS operations_date_idx ON public.operations(date DESC);

-- 6. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'operations';
  
  RAISE NOTICE '✅ Tabela operations atualizada com % colunas', col_count;
  RAISE NOTICE '✅ Campos obrigatórios: farm_name, field_name, crop, area_ha, date, status';
END $$;




