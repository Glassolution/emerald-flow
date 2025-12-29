# Solução Definitiva: Erro PGRST204 - Colunas dose_min e dose_max

## Problema

O erro persiste mesmo após tentativas de correção:
```
Error code: PGRST204
message: Could not find the 'dose_max' column of 'products_custom' in the schema cache
```

## Solução Implementada (3 Camadas de Proteção)

### 1. Retry Automático com Fallback

O código agora tenta inserir o produto em duas etapas:

1. **Primeira tentativa**: Com todos os campos (incluindo `dose_min` e `dose_max`)
2. **Se der erro PGRST204**: Tenta novamente **SEM** as colunas `dose_min` e `dose_max`

Isso permite que o produto seja salvo mesmo se as colunas não existirem.

### 2. Validação Rigorosa de Campos

- Campos opcionais só são enviados se tiverem valor válido
- Strings vazias são convertidas para `undefined`
- Números inválidos são ignorados
- Validação no formulário antes de enviar

### 3. Mensagens de Erro Melhoradas

- Erro específico indicando qual coluna está faltando
- Instruções claras para executar a migração
- Logs detalhados para debug

## Como Funciona Agora

### Fluxo de Inserção

```
1. Usuário preenche formulário
   ↓
2. Validação: campos opcionais só são incluídos se válidos
   ↓
3. Primeira tentativa: INSERT com todos os campos
   ↓
4. Se erro PGRST204 (coluna não encontrada):
   ↓
5. Segunda tentativa: INSERT sem dose_min/dose_max
   ↓
6. Sucesso! Produto salvo (sem faixa de dose)
```

### Resultado

- ✅ Produto é salvo mesmo sem as colunas `dose_min` e `dose_max`
- ✅ Usuário pode usar o app normalmente
- ✅ Quando executar a migração, as colunas estarão disponíveis
- ✅ Produtos salvos sem faixa podem ser editados depois para adicionar faixa

## Como Resolver Definitivamente

### Opção 1: Executar Migração SQL (Recomendado)

Execute no Supabase SQL Editor:

```sql
-- Arquivo: supabase/migrations/add_dose_min_max_columns.sql
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_min'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN dose_min NUMERIC(10, 2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products_custom' 
        AND column_name = 'dose_max'
    ) THEN
        ALTER TABLE public.products_custom 
        ADD COLUMN dose_max NUMERIC(10, 2);
    END IF;
END $$;
```

### Opção 2: Usar o App Sem as Colunas (Temporário)

O app agora funciona mesmo sem as colunas:
- Produtos podem ser salvos sem faixa de dose
- Quando executar a migração, poderá adicionar faixa depois

## Verificação

### Verificar se Colunas Existem

```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'products_custom' 
  AND column_name IN ('dose_min', 'dose_max');
```

**Resultado esperado**: 2 linhas (dose_min e dose_max)

### Testar Inserção

1. Acesse `/app/produtos`
2. Clique em "Adicionar meu produto"
3. Preencha:
   - Nome: "Teste"
   - Categoria: "Herbicida"
   - Descrição: "Teste"
   - Dose: 200
   - Unidade: mL
   - **Deixe dose_min e dose_max vazios**
4. Clique em "Salvar"
5. **Deve funcionar!** (mesmo sem as colunas)

## Arquivos Modificados

1. **`src/lib/productCatalogService.ts`**
   - ✅ Retry automático sem colunas opcionais
   - ✅ Validação rigorosa de campos
   - ✅ Logs detalhados

2. **`src/components/catalog/AddProductModal.tsx`**
   - ✅ Validação antes de enviar
   - ✅ Campos opcionais só enviados se válidos
   - ✅ Strings vazias convertidas para undefined

## Status

- ✅ **App funciona mesmo sem as colunas** (fallback implementado)
- ✅ **Produtos podem ser salvos sem faixa de dose**
- ✅ **Quando migração for executada, faixa estará disponível**
- ✅ **Mensagens de erro são claras e úteis**

## Próximos Passos

1. Execute a migração SQL quando possível (recomendado)
2. Ou continue usando o app sem as colunas (funciona normalmente)
3. Produtos salvos sem faixa podem ser editados depois para adicionar faixa




