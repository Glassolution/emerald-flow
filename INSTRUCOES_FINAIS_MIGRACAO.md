# ⚠️ INSTRUÇÕES FINAIS: Corrigir Tabela products_custom

## Problema Identificado

A tabela `products_custom` no Supabase está **incompleta**:
- ❌ Faltam colunas: `category`, `description`, `dose_min`, `dose_max`, `created_at`
- ❌ Tem coluna incorreta: `unit` (deveria ser `dose_unit`)
- ❌ Pode ter coluna incorreta: `dose_default` (não é necessária)

## Solução: Executar Migração Final

### Passo 1: Executar Migração no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo: `supabase/migrations/fix_products_custom_final.sql`
5. **COPIE TODO O CONTEÚDO**
6. Cole no SQL Editor
7. Clique em **RUN**

### Passo 2: Verificar Estrutura

Execute esta query para verificar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products_custom'
ORDER BY column_name;
```

**Resultado esperado** (deve ter TODAS estas colunas):
- ✅ `category` (TEXT, NOT NULL)
- ✅ `created_at` (TIMESTAMP)
- ✅ `description` (TEXT, NOT NULL)
- ✅ `dose_max` (NUMERIC, nullable)
- ✅ `dose_min` (NUMERIC, nullable)
- ✅ `dose_unit` (TEXT, NOT NULL)
- ✅ `dose_value` (NUMERIC, NOT NULL)
- ✅ `id` (UUID)
- ✅ `image_url` (TEXT, nullable)
- ✅ `name` (TEXT, NOT NULL)
- ✅ `notes` (TEXT, nullable)
- ✅ `recommendations` (TEXT, nullable)
- ✅ `updated_at` (TIMESTAMP)
- ✅ `user_id` (UUID, NOT NULL)

**NÃO deve ter:**
- ❌ `unit` (deve ser removida)
- ❌ `dose_default` (deve ser removida)

### Passo 3: Limpar Cache (Importante!)

Após executar a migração:

1. No Supabase Dashboard, vá em **Settings** → **API**
2. Ou simplesmente aguarde 1-2 minutos para o cache atualizar
3. Recarregue a página do app (F5)

### Passo 4: Testar no App

1. Recarregue a página do app (Ctrl+F5 para limpar cache)
2. Acesse `/app/produtos`
3. Clique em "Adicionar meu produto"
4. Preencha:
   - Nome: "Teste"
   - Categoria: "Herbicida"
   - Descrição: "Produto de teste"
   - Dose: 200
   - Unidade: mL
5. Clique em "Salvar"
6. **Deve funcionar agora!** ✅

## O que a Migração Faz

A migração `fix_products_custom_final.sql`:

1. ✅ Adiciona `category` (se não existir)
2. ✅ Adiciona `description` (se não existir)
3. ✅ Adiciona `dose_min` (se não existir)
4. ✅ Adiciona `dose_max` (se não existir)
5. ✅ Adiciona `created_at` (se não existir)
6. ✅ Remove `unit` (coluna incorreta)
7. ✅ Remove `dose_default` (coluna incorreta)
8. ✅ Garante que `dose_unit` e `dose_value` são NOT NULL
9. ✅ Adiciona constraints corretos
10. ✅ Verifica se tudo está correto

## Se Ainda Der Erro

### Verificar se Migração Foi Executada

Execute:
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'products_custom'
ORDER BY column_name;
```

Se faltar alguma coluna, execute a migração novamente.

### Limpar Cache do Supabase

1. Aguarde 2-3 minutos após executar a migração
2. Ou reinicie o projeto no Supabase Dashboard

### Verificar Logs no Console

Abra o DevTools (F12) → Console e verifique:
- Se há erros de "coluna não encontrada"
- Qual coluna está faltando
- Execute a migração novamente se necessário

## Arquivo da Migração

📁 `supabase/migrations/fix_products_custom_final.sql`

Este arquivo corrige **TUDO** que está errado na tabela.


