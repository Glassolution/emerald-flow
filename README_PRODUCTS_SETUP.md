# Setup do Catálogo de Produtos

## ⚠️ IMPORTANTE: Criar Tabela no Supabase

Antes de usar produtos personalizados, você precisa criar a tabela no Supabase.

### Opção 1: Via SQL Editor no Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. **PRIMEIRO**: Execute o arquivo `supabase/migrations/create_products_custom.sql`
4. **SEGUNDO**: Execute o arquivo `supabase/migrations/add_dose_min_max_columns.sql` (adiciona colunas opcionais)
5. Clique em **Run** ou Execute** em cada um

### Opção 2: Via Supabase CLI

```bash
supabase migration new create_products_custom
# Copie o conteúdo do SQL para o arquivo criado
supabase db push
```

### Verificar se funcionou

Após executar o SQL, verifique:
- A tabela `products_custom` foi criada
- As políticas RLS estão ativas
- Os índices foram criados

## Estrutura da Tabela

A tabela `products_custom` armazena produtos personalizados dos usuários com:
- `id` (UUID, auto-gerado)
- `user_id` (UUID, referência ao usuário)
- `name` (nome do produto)
- `category` (categoria: Herbicida, Inseticida, etc.)
- `description` (descrição)
- `dose_value` (dose recomendada)
- `dose_unit` (unidade: mL, L, g, kg, mL/L)
- `dose_min` e `dose_max` (faixa opcional)
- `recommendations` (recomendações)
- `notes` (observações)
- `image_url` (URL da imagem)
- `created_at` e `updated_at` (timestamps)

## Segurança (RLS)

As políticas Row Level Security garantem que:
- ✅ Usuários só veem seus próprios produtos
- ✅ Usuários só podem criar produtos para si mesmos
- ✅ Usuários só podem editar/excluir seus próprios produtos

## Produtos Padrão vs Personalizados

- **Produtos Padrão**: Aparecem para todos os usuários (hardcoded em `src/lib/products.ts`)
- **Produtos Personalizados**: Aparecem apenas para quem os criou (armazenados no Supabase)

Os produtos personalizados aparecem primeiro na lista, seguidos dos produtos padrão.

