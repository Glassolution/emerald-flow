-- Migração para criar tabela operations
-- Esta migração é idempotente e pode ser executada múltiplas vezes

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_da_operacao TEXT NOT NULL,
  cultura TEXT NOT NULL,
  area_ha NUMERIC(10, 2) NOT NULL,
  data DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS operations_user_id_idx ON public.operations(user_id);
CREATE INDEX IF NOT EXISTS operations_data_idx ON public.operations(data DESC);
CREATE INDEX IF NOT EXISTS operations_created_at_idx ON public.operations(created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS (remover existentes primeiro para evitar conflito)
DROP POLICY IF EXISTS "Users can view own operations" ON public.operations;
DROP POLICY IF EXISTS "Users can insert own operations" ON public.operations;
DROP POLICY IF EXISTS "Users can update own operations" ON public.operations;
DROP POLICY IF EXISTS "Users can delete own operations" ON public.operations;

-- Política: Usuários podem ver suas próprias operações
CREATE POLICY "Users can view own operations"
  ON public.operations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir suas próprias operações
CREATE POLICY "Users can insert own operations"
  ON public.operations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias operações
CREATE POLICY "Users can update own operations"
  ON public.operations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias operações
CREATE POLICY "Users can delete own operations"
  ON public.operations
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_operations_updated_at ON public.operations;
CREATE TRIGGER update_operations_updated_at
  BEFORE UPDATE ON public.operations
  FOR EACH ROW
  EXECUTE FUNCTION update_operations_updated_at();

-- 6. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'operations';
  
  RAISE NOTICE '✅ Tabela operations criada/atualizada com % colunas', col_count;
  RAISE NOTICE '✅ Colunas obrigatórias verificadas: nome_da_operacao, cultura, area_ha, data, user_id';
END $$;




