# 📋 Instruções - Funcionalidade OPERAÇÕES na CALC

## ✅ O que foi implementado

### 1. **Estrutura de Dados**
- ✅ Tipos TypeScript atualizados (`src/types/operation.ts`)
- ✅ Migração SQL criada (`supabase/migrations/update_operations_table_complete.sql`)
- ✅ Serviço atualizado (`src/lib/operationsService.ts`)

### 2. **Interface do Usuário**
- ✅ Página de Operações (`src/pages/app/OperacoesPage.tsx`)
- ✅ Modal de Nova Operação (`src/components/operations/NewOperationModal.tsx`)
- ✅ Página de Detalhes (`src/pages/app/OperationDetails.tsx`)
- ✅ Integração com catálogo de produtos
- ✅ Cálculos automáticos (volume total e quantidade de produto)

### 3. **Funcionalidades**
- ✅ Criar operações com todos os campos
- ✅ Listar operações com busca e filtros
- ✅ Ver detalhes da operação
- ✅ Excluir operações
- ✅ Status (Planejada/Concluída)
- ✅ Integração com Supabase + localStorage fallback

## 🗄️ Migração do Banco de Dados

### Passo 1: Executar a migração SQL

1. Acesse: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo: `supabase/migrations/update_operations_table_complete.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **RUN**

### Passo 2: Verificar a estrutura

Execute no SQL Editor para verificar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'operations'
ORDER BY ordinal_position;
```

Você deve ver as seguintes colunas:
- `id`, `user_id`
- `farm_name`, `field_name`, `crop`, `target`
- `product_name`, `product_id`
- `area_ha`, `dose_value`, `dose_unit`, `volume_l_ha`
- `drone_model`, `date`, `status`
- `total_volume_l`, `total_product_quantity` (calculados)
- `created_at`, `updated_at`

## 🧪 Como testar

### 1. Criar uma operação

1. Acesse `/app/operacoes`
2. Clique em **"Nova Operação"**
3. Preencha todos os campos:
   - Fazenda/Cliente: "Fazenda Boa Vista"
   - Talhão: "Talhão 03"
   - Cultura: "Soja"
   - Praga/Doença: "Lagarta"
   - Produto: Busque e selecione do catálogo
   - Área: 10.5
   - Dose: 200
   - Unidade: mL/ha
   - Volume: 12
   - Drone: "DJI Agras T40"
   - Data: Selecione uma data
   - Status: "Planejada" ou "Concluída"
4. Clique em **"Criar Operação"**

### 2. Verificar cálculos automáticos

Após criar, os valores são calculados automaticamente:
- **Volume Total de Calda** = Área × Volume (L/ha)
- **Quantidade Total de Produto** = Área × Dose

### 3. Listar operações

1. Na página `/app/operacoes`
2. Use a busca para filtrar
3. Use os filtros de status (Todas/Planejadas/Concluídas)
4. Clique em uma operação para ver detalhes

### 4. Ver detalhes

1. Clique em uma operação na lista
2. Veja todas as informações
3. Veja os cálculos automáticos
4. Use "Excluir" se necessário

### 5. Acessar da CALC

1. Vá em `/app/calc`
2. Após calcular, veja o botão **"Operações"**
3. Clique para ir direto para a página de operações

## 📱 Rotas criadas

- `/app/operacoes` - Lista de operações
- `/app/operacoes/:id` - Detalhes da operação

## 🎨 Design

- Interface moderna e limpa
- Cards com informações organizadas
- Badges de status coloridos
- Busca e filtros funcionais
- Responsivo mobile-first

## ⚠️ Importante

- A migração SQL **deve ser executada** para que tudo funcione
- Os cálculos são feitos automaticamente ao salvar
- Produtos podem ser selecionados do catálogo ou personalizados
- Todas as operações são privadas (apenas o usuário vê as suas)

## 🔄 Próximos passos (opcional)

- Editar operações existentes
- Exportar operações (PDF/Excel)
- Relatórios por período
- Integração com calendário


