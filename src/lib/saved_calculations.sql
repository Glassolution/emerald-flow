/**
 * SQL para criar a tabela saved_calculations no Supabase
 * 
 * Execute este SQL no SQL Editor do Supabase Dashboard
 * ou via Supabase CLI
 * 
 * Esta tabela armazena os cálculos salvos pelos usuários.
 */

-- Criar tabela saved_calculations
CREATE TABLE IF NOT EXISTS saved_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  calculation_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS saved_calculations_user_id_idx ON saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS saved_calculations_created_at_idx ON saved_calculations(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler apenas seus próprios cálculos
CREATE POLICY "Users can view own saved calculations"
  ON saved_calculations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios cálculos
CREATE POLICY "Users can insert own saved calculations"
  ON saved_calculations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios cálculos
CREATE POLICY "Users can update own saved calculations"
  ON saved_calculations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios cálculos
CREATE POLICY "Users can delete own saved calculations"
  ON saved_calculations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_saved_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_saved_calculations_updated_at
  BEFORE UPDATE ON saved_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_calculations_updated_at();

-- Exemplo de estrutura do calculation_data (JSONB):
-- {
--   "input": {
--     "areaHa": 10,
--     "taxaLHa": 10,
--     "volumeTanqueL": 10,
--     "products": [
--       {
--         "id": "1",
--         "name": "Glifosato 360",
--         "dose": 2.5,
--         "unit": "L"
--       }
--     ]
--   },
--   "result": {
--     "volumeTotalL": 100,
--     "numeroTanques": 10,
--     "produtos": [
--       {
--         "nome": "Glifosato 360",
--         "doseHa": 2.5,
--         "unit": "L",
--         "totalProduto": 25,
--         "produtoPorTanque": 2.5
--       }
--     ]
--   }
-- }

