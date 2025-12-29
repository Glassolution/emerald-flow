# ⚠️ INSTRUÇÕES: Corrigir Erro ao Salvar Cálculo

## Problema

Erro ao salvar cálculo:
```
Could not find the table 'public.saved_calculations' in the schema cache
```

## Solução: Executar Migração SQL

### Passo 1: Executar Migração no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Abra o arquivo: `supabase/migrations/fix_saved_calculations.sql`
5. **COPIE TODO O CONTEÚDO**
6. Cole no SQL Editor
7. Clique em **RUN**

### Passo 2: Verificar se Funcionou

Execute esta query para verificar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'saved_calculations'
ORDER BY column_name;
```

**Resultado esperado**: Deve mostrar:
- ✅ `calculation_data` (jsonb)
- ✅ `created_at` (timestamp with time zone)
- ✅ `id` (uuid)
- ✅ `title` (text)
- ✅ `updated_at` (timestamp with time zone)
- ✅ `user_id` (uuid)

### Passo 3: Testar no App

1. Recarregue a página do app (F5)
2. Acesse `/app/calc`
3. Preencha os campos e calcule
4. Clique em "Salvar cálculo"
5. **Deve funcionar agora!** ✅

## O que a Migração Faz

A migração `fix_saved_calculations.sql`:

1. ✅ Cria a tabela se não existir (com todas as colunas)
2. ✅ Adiciona colunas faltantes se a tabela já existir
3. ✅ Cria índices para performance
4. ✅ Configura RLS (Row Level Security)
5. ✅ Cria trigger para `updated_at`
6. ✅ É **idempotente** (pode executar múltiplas vezes)

## Melhorias Implementadas

### 1. Tratamento de Erros Melhorado
- ✅ Usa `supabaseErrorHandler` para classificar erros corretamente
- ✅ Mensagens de erro mais claras
- ✅ Fallback para localStorage se tabela não existir

### 2. Ícone Atualizado
- ✅ Botão "Salvar cálculo" agora usa ícone `Save` (disquete)
- ✅ Novo botão "Ver histórico" com ícone `History` (relógio)
- ✅ Botão histórico navega para `/app/favoritos`

## Arquivos Modificados

1. **`supabase/migrations/fix_saved_calculations.sql`** (NOVO)
   - Migração completa para criar/corrigir tabela

2. **`src/lib/favoritesService.ts`**
   - Melhorado tratamento de erros
   - Usa `supabaseErrorHandler` para classificar erros

3. **`src/pages/app/Calc.tsx`**
   - Ícone `Heart` trocado por `Save` no botão salvar
   - Adicionado botão "Ver histórico" com ícone `History`
   - Botão histórico navega para `/app/favoritos`

## Como Funciona Agora

### Salvar Cálculo
1. Usuário calcula
2. Clica em "Salvar cálculo" (ícone de disquete)
3. Se tabela existir: salva no Supabase
4. Se tabela não existir: salva no localStorage (fallback)
5. Mostra toast de sucesso/erro

### Ver Histórico
1. Usuário clica em "Ver histórico" (ícone de relógio)
2. Navega para `/app/favoritos`
3. Vê todos os cálculos salvos

## Se Ainda Der Erro

1. **Verificar se migração foi executada**:
   - Execute a query de verificação acima
   - Confirme que todas as colunas existem

2. **Limpar cache do Supabase**:
   - Aguarde 1-2 minutos após executar a migração
   - Ou recarregue a página do app (Ctrl+F5)

3. **Verificar logs no console**:
   - Abra DevTools (F12) → Console
   - Verifique se há erros específicos
   - Execute a migração novamente se necessário




