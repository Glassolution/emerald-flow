-- Migração para criar tabela recipes
-- Esta migração é idempotente e pode ser executada múltiplas vezes

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  area_ha NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
  volume_tanque_l NUMERIC(10, 2) NOT NULL DEFAULT 10.0,
  taxa_l_ha NUMERIC(10, 2) NOT NULL DEFAULT 10.0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS recipes_is_public_idx ON public.recipes(is_public) WHERE is_public = true;

-- 3. Habilitar RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS (remover existentes primeiro para evitar conflito)
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view public recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON public.recipes;

-- Política: Usuários podem ver suas próprias receitas
CREATE POLICY "Users can view own recipes"
  ON public.recipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem ver receitas públicas
CREATE POLICY "Users can view public recipes"
  ON public.recipes
  FOR SELECT
  USING (is_public = true);

-- Política: Usuários podem inserir suas próprias receitas
CREATE POLICY "Users can insert own recipes"
  ON public.recipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias receitas
CREATE POLICY "Users can update own recipes"
  ON public.recipes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias receitas
CREATE POLICY "Users can delete own recipes"
  ON public.recipes
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_recipes_updated_at();

-- 6. Verificar estrutura final
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'recipes';
  
  RAISE NOTICE '✅ Tabela recipes criada/atualizada com % colunas', col_count;
  RAISE NOTICE '✅ Colunas obrigatórias verificadas: name, products, user_id';
END $$;


