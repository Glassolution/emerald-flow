# 💰 Instruções - Campo Valor Cobrado nas Operações

## ✅ O que foi implementado

### 1. **Estrutura de Dados**
- ✅ Campo `price_charged` adicionado ao tipo `Operation`
- ✅ Migração SQL criada (`supabase/migrations/add_price_charged_to_operations.sql`)
- ✅ Serviço atualizado para salvar e buscar `price_charged`

### 2. **Interface do Usuário**
- ✅ Campo "Valor Cobrado (R$)" adicionado ao formulário de Nova Operação
- ✅ Validação: obrigatório, mínimo 0, permite decimais
- ✅ Campo exibido na página de detalhes da operação
- ✅ Formatação de moeda brasileira (R$ 1.234,56)

### 3. **Relatórios Financeiros**
- ✅ **Total de Receita**: Soma de todos os valores cobrados
- ✅ **Ticket Médio**: Receita total ÷ Número de operações
- ✅ Substituição do card "Economia Estimada" por dados reais
- ✅ Formatação em moeda brasileira em todos os valores

## 🗄️ Migração do Banco de Dados

### Passo 1: Executar a migração SQL

1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo: `supabase/migrations/add_price_charged_to_operations.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **RUN**

### Passo 2: Verificar a estrutura

Execute no SQL Editor para verificar:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'operations'
  AND column_name = 'price_charged';
```

Você deve ver:
- `price_charged` como `NUMERIC(10, 2)`
- `NOT NULL` com `DEFAULT 0`
- Constraint para valores >= 0

## 🧪 Como testar

### 1. Criar operação com valor cobrado

1. Acesse `/app/operacoes`
2. Clique em **"Nova Operação"**
3. Preencha todos os campos normalmente
4. No campo **"Valor Cobrado (R$)"**, digite: `2400.00`
5. Clique em **"Criar Operação"**

### 2. Verificar nos detalhes

1. Clique na operação criada
2. Na seção **"Cálculos e Valores"**, você verá:
   - Volume Total de Calda
   - Quantidade Total de Produto
   - **Valor Cobrado** formatado como R$ 2.400,00

### 3. Verificar nos relatórios

1. Vá em `/app/home`
2. Clique na categoria **"Relatórios"**
3. Você verá:
   - **Total de Receita**: Soma de todos os valores cobrados
   - **Ticket Médio**: Média dos valores cobrados por operação

### 4. Testar com múltiplas operações

1. Crie 3 operações com valores diferentes:
   - Operação 1: R$ 2.400,00
   - Operação 2: R$ 1.800,50
   - Operação 3: R$ 3.200,00
2. Vá em Relatórios
3. Verifique:
   - **Total de Receita**: R$ 7.400,50
   - **Ticket Médio**: R$ 2.466,83

### 5. Testar compatibilidade

- Operações antigas (sem `price_charged`) devem aparecer com R$ 0,00
- Não deve quebrar se alguma operação não tiver valor

## 📊 Cálculos Implementados

### Total de Receita
```typescript
totalReceita = operations.reduce((sum, op) => sum + (op.price_charged || 0), 0)
```

### Ticket Médio
```typescript
ticketMedio = totalOperacoes > 0 ? totalReceita / totalOperacoes : 0
```

## 🎨 Formatação de Moeda

Função criada em `src/lib/currencyUtils.ts`:
- `formatCurrency(value)`: Formata como "R$ 1.234,56"
- Usa `Intl.NumberFormat` com locale "pt-BR"
- Sempre 2 casas decimais
- Retorna "R$ 0,00" se valor inválido

## ⚠️ Importante

- A migração SQL **deve ser executada** para que tudo funcione
- Valores são salvos como números (não strings)
- Operações antigas sem valor terão 0 por padrão
- Validação: valor mínimo 0 (permite 0 para operações gratuitas)

## 🔄 Próximos passos (opcional)

- Gráficos de receita por período
- Comparação mês a mês
- Exportar relatórios financeiros
- Filtros por período nos relatórios


