-- Tabela para produtos personalizados dos usuários
CREATE TABLE IF NOT EXISTS products_custom (
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_custom_user_id ON products_custom(user_id);
CREATE INDEX IF NOT EXISTS idx_products_custom_category ON products_custom(category);

-- RLS (Row Level Security)
ALTER TABLE products_custom ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seus próprios produtos
CREATE POLICY "Users can view own products"
  ON products_custom
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir seus próprios produtos
CREATE POLICY "Users can insert own products"
  ON products_custom
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar seus próprios produtos
CREATE POLICY "Users can update own products"
  ON products_custom
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar seus próprios produtos
CREATE POLICY "Users can delete own products"
  ON products_custom
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_custom_updated_at
  BEFORE UPDATE ON products_custom
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




