# Correção: Erro PGRST204 - Colunas dose_min e dose_max

## Problema

Erro ao adicionar produto custom:
```
Error code: PGRST204
message: Could not find the 'dose_max' column of 'products_custom' in the schema cache
```

## Causa

A tabela `products_custom` foi criada sem as colunas `dose_min` e `dose_max`, ou essas colunas não existem no banco de dados atual.

## Solução

### 1. Executar Migração SQL

Execute a migração `supabase/migrations/add_dose_min_max_columns.sql` no Supabase:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase/migrations/add_dose_min_max_columns.sql`
4. Clique em **Run**

Esta migração é segura e pode ser executada mesmo se as colunas já existirem.

### 2. Correções no Código

#### A) `src/lib/productCatalogService.ts`
- ✅ Ajustado para não enviar campos `undefined` ou `null` no INSERT
- ✅ Apenas campos com valor são enviados para o banco
- ✅ Logs detalhados para debug

#### B) `src/lib/supabaseErrorHandler.ts`
- ✅ Melhorada detecção de erro de coluna não encontrada (PGRST204)
- ✅ Mensagem de erro específica indicando qual coluna está faltando
- ✅ Instruções para executar a migração

## Como Verificar

### Verificar se as colunas existem

Execute no SQL Editor do Supabase:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products_custom'
  AND column_name IN ('dose_min', 'dose_max');
```

Se retornar 2 linhas, as colunas existem. Se retornar 0 ou 1, execute a migração.

### Testar Adicionar Produto

1. Acesse `/app/produtos`
2. Clique em "Adicionar meu produto"
3. Preencha o formulário (pode deixar dose_min e dose_max vazios)
4. Clique em "Salvar"
5. Não deve mais aparecer erro PGRST204

## Estrutura Final da Tabela

A tabela `products_custom` deve ter:
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `name` (TEXT)
- `category` (TEXT)
- `description` (TEXT)
- `dose_value` (NUMERIC)
- `dose_unit` (TEXT)
- `dose_min` (NUMERIC, nullable) ✅ **NOVO**
- `dose_max` (NUMERIC, nullable) ✅ **NOVO**
- `recommendations` (TEXT, nullable)
- `notes` (TEXT, nullable)
- `image_url` (TEXT, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Notas

- As colunas `dose_min` e `dose_max` são opcionais (nullable)
- O código agora só envia esses campos se tiverem valor
- Se as colunas não existirem, o erro será mais claro indicando qual coluna está faltando


