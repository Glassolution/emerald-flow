# ⚠️ INSTRUÇÕES URGENTES: Executar Migração Completa

## Problema Atual

A tabela `products_custom` no Supabase está **incompleta** - faltam colunas essenciais como `dose_unit` e possivelmente outras.

## Solução: Executar Migração Completa

### Passo 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)

### Passo 2: Executar Migração Completa

1. Abra o arquivo: `supabase/migrations/fix_products_custom_complete.sql`
2. **COPIE TODO O CONTEÚDO** do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **RUN** ou **Execute**

### Passo 3: Verificar se Funcionou

Execute esta query no SQL Editor para verificar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products_custom'
ORDER BY ordinal_position;
```

**Resultado esperado**: Deve mostrar todas estas colunas:
- ✅ id
- ✅ user_id
- ✅ name
- ✅ category
- ✅ description
- ✅ dose_value
- ✅ dose_unit ⚠️ **IMPORTANTE**
- ✅ dose_min
- ✅ dose_max
- ✅ recommendations
- ✅ notes
- ✅ image_url
- ✅ created_at
- ✅ updated_at

### Passo 4: Testar no App

1. Recarregue a página do app (F5)
2. Acesse `/app/produtos`
3. Clique em "Adicionar meu produto"
4. Preencha o formulário
5. Clique em "Salvar"
6. **Deve funcionar agora!** ✅

## O que a Migração Faz

A migração `fix_products_custom_complete.sql`:

1. ✅ Cria a tabela se não existir (com todas as colunas)
2. ✅ Adiciona colunas faltantes se a tabela já existir
3. ✅ Cria índices para performance
4. ✅ Configura RLS (Row Level Security)
5. ✅ Cria trigger para `updated_at`
6. ✅ É **idempotente** (pode executar múltiplas vezes sem problema)

## Por que Esta Migração é Segura

- ✅ Não apaga dados existentes
- ✅ Só adiciona colunas que faltam
- ✅ Pode ser executada múltiplas vezes
- ✅ Não quebra nada que já está funcionando

## Se Ainda Der Erro

1. **Limpar cache do Supabase**:
   - No Supabase Dashboard, vá em **Settings** → **API**
   - Clique em "Clear cache" ou aguarde alguns minutos

2. **Verificar se a migração foi executada**:
   - Execute a query de verificação acima
   - Confirme que todas as colunas existem

3. **Recarregar o app**:
   - Feche e abra o navegador
   - Ou limpe o cache do navegador (Ctrl+Shift+Delete)

## Arquivo da Migração

📁 `supabase/migrations/fix_products_custom_complete.sql`

Este arquivo contém TUDO que é necessário para criar/corrigir a tabela completamente.




