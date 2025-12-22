/**
 * SQL para criar a tabela profiles no Supabase
 * 
 * Execute este SQL no SQL Editor do Supabase Dashboard
 * ou via Supabase CLI
 * 
 * Esta tabela armazena informações do perfil do usuário,
 * incluindo a URL do avatar.
 */

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  drones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Política: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar bucket de avatares no Storage (execute no SQL Editor)
-- Nota: O bucket deve ser criado manualmente no Dashboard do Supabase
-- Storage > Buckets > New Bucket
-- Nome: avatars
-- Public: true (para URLs públicas)
-- File size limit: 3MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Política de Storage para o bucket avatars
-- Execute no SQL Editor após criar o bucket

-- Política: Usuários podem fazer upload de seus próprios avatares
CREATE POLICY "Users can upload own avatars"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Usuários podem ler avatares públicos
CREATE POLICY "Avatars are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Política: Usuários podem atualizar seus próprios avatares
CREATE POLICY "Users can update own avatars"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Política: Usuários podem deletar seus próprios avatares
CREATE POLICY "Users can delete own avatars"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

