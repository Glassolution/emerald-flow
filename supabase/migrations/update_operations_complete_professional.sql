-- Migração completa para transformar operations em registro técnico profissional
-- Esta migração é idempotente e pode ser executada múltiplas vezes
-- Mantém compatibilidade com operações antigas

-- 1. Adicionar novos campos de identificação
DO $$ 
BEGIN
  -- operation_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'operation_name'
  ) THEN
    ALTER TABLE public.operations ADD COLUMN operation_name TEXT;
    -- Preencher com valor padrão baseado em farm_name e field_name para operações existentes
    UPDATE public.operations 
    SET operation_name = COALESCE(farm_name || ' - ' || field_name, 'Operação sem nome')
    WHERE operation_name IS NULL;
    ALTER TABLE public.operations ALTER COLUMN operation_name SET NOT NULL;
  END IF;

  -- client_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'client_name'
  ) THEN
    ALTER TABLE public.operations ADD COLUMN client_name TEXT;
    -- Preencher com farm_name para compatibilidade
    UPDATE public.operations 
    SET client_name = COALESCE(farm_name, 'Cliente não informado')
    WHERE client_name IS NULL;
    ALTER TABLE public.operations ALTER COLUMN client_name SET NOT NULL;
  END IF;

  -- location (opcional)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.operations ADD COLUMN location TEXT;
  END IF;

  -- target_pest (novo nome para target)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'target_pest'
  ) THEN
    ALTER TABLE public.operations ADD COLUMN target_pest TEXT;
    -- Migrar dados de target para target_pest se existir
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'target'
    ) THEN
      UPDATE public.operations 
      SET target_pest = COALESCE(target, 'Não informado')
      WHERE target_pest IS NULL;
    ELSE
      UPDATE public.operations 
      SET target_pest = 'Não informado'
      WHERE target_pest IS NULL;
    END IF;
    ALTER TABLE public.operations ALTER COLUMN target_pest SET NOT NULL;
  END IF;

  -- water_volume (alias para volume_l_ha)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'water_volume'
  ) THEN
    ALTER TABLE public.operations ADD COLUMN water_volume NUMERIC(10, 2);
    -- Copiar de volume_l_ha se existir
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'volume_l_ha'
    ) THEN
      UPDATE public.operations 
      SET water_volume = volume_l_ha
      WHERE water_volume IS NULL;
    END IF;
  END IF;

  -- operation_date (alias para date)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'operation_date'
  ) THEN
    ALTER TABLE public.operations ADD COLUMN operation_date DATE;
    -- Copiar de date se existir
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'operations' AND column_name = 'date'
    ) THEN
      UPDATE public.operations 
      SET operation_date = date::DATE
      WHERE operation_date IS NULL;
    END IF;
  END IF;

  -- Garantir que drone_model pode ser NULL (opcional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'operations' 
    AND column_name = 'drone_model' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.operations ALTER COLUMN drone_model DROP NOT NULL;
  END IF;
END $$;

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS operations_operation_name_idx ON public.operations(operation_name);
CREATE INDEX IF NOT EXISTS operations_client_name_idx ON public.operations(client_name);
CREATE INDEX IF NOT EXISTS operations_location_idx ON public.operations(location);
CREATE INDEX IF NOT EXISTS operations_target_pest_idx ON public.operations(target_pest);
CREATE INDEX IF NOT EXISTS operations_operation_date_idx ON public.operations(operation_date DESC);

-- 3. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
  new_cols TEXT[];
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'operations';
  
  SELECT ARRAY_AGG(column_name) INTO new_cols
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'operations'
    AND column_name IN ('operation_name', 'client_name', 'location', 'target_pest', 'water_volume', 'operation_date');
  
  RAISE NOTICE '✅ Tabela operations atualizada com % colunas', col_count;
  RAISE NOTICE '✅ Novos campos profissionais: %', array_to_string(new_cols, ', ');
END $$;




