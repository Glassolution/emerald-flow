# Correções: Falso Positivo "Tabela não encontrada"

## Problema Identificado

O app mostrava "Tabela não encontrada" mesmo quando a tabela `public.products_custom` existia no Supabase. O tratamento de erros estava muito genérico e capturava qualquer erro como "tabela não existe".

## Correções Implementadas

### 1. Novo Sistema de Classificação de Erros (`src/lib/supabaseErrorHandler.ts`)

Criado helper para classificar erros do Supabase corretamente:

- **`table_not_found`**: Tabela realmente não existe (42P01, PGRST116)
- **`auth_error`**: Erro de autenticação (401, JWT inválido)
- **`rls_error`**: Erro de Row Level Security (403, permissão negada)
- **`schema_error`**: Erro de schema/coluna (PGRST***)
- **`network_error`**: Erro de conexão/rede
- **`unknown`**: Erro desconhecido

### 2. Melhorias em `src/lib/productCatalogService.ts`

- ✅ Removidas verificações genéricas de "does not exist" e "schema cache"
- ✅ Implementada classificação correta de erros
- ✅ Logs detalhados para debug
- ✅ Retorno silencioso de array vazio para erros de tabela não encontrada (produtos padrão continuam funcionando)
- ✅ Verificação de `userId` antes de fazer query

### 3. Melhorias em `src/pages/app/Produtos.tsx`

- ✅ Removidas verificações incorretas de "tabela não encontrada"
- ✅ Mensagens de erro apropriadas baseadas no tipo de erro
- ✅ Botão "Recarregar catálogo" adicionado
- ✅ Logs detalhados para debug
- ✅ Fallback para produtos padrão sempre funciona

## Como Funciona Agora

### Fluxo de Carregamento

1. **Usuário acessa Catálogo**
   - Verifica se está logado
   - Chama `getAllProducts(userId)`

2. **Busca Produtos Custom**
   - Tenta buscar de `products_custom` com filtro `user_id = userId`
   - Se erro:
     - **Tabela não existe**: Retorna array vazio silenciosamente (não mostra erro)
     - **Auth/RLS**: Retorna array vazio, loga erro
     - **Outros**: Retorna array vazio, loga erro

3. **Busca Produtos Padrão**
   - Sempre funciona (hardcoded)
   - Mescla com produtos custom

4. **Resultado Final**
   - Produtos custom aparecem primeiro (se houver)
   - Produtos padrão aparecem depois
   - Se não houver custom, apenas padrão aparece (sem erro)

### Tratamento de Erros

#### Erro de Tabela Não Encontrada (42P01, PGRST116)
- **Ação**: Retorna array vazio silenciosamente
- **UI**: Não mostra erro (produtos padrão continuam funcionando)
- **Log**: Apenas warning no console

#### Erro de Autenticação (401)
- **Ação**: Retorna array vazio
- **UI**: Mostra toast "Erro de autenticação. Faça login novamente."
- **Log**: Erro completo no console

#### Erro de RLS (403)
- **Ação**: Retorna array vazio
- **UI**: Mostra toast "Sem permissão para acessar este recurso"
- **Log**: Erro completo no console

#### Outros Erros
- **Ação**: Retorna array vazio
- **UI**: Mostra toast genérico
- **Log**: Erro completo no console

## Como Testar

### 1. Verificar Logs no Console

Abra o DevTools (F12) e verifique os logs:

```
🔍 [ProductCatalog] Buscando produtos custom para userId: xxx
✅ [ProductCatalog] Produtos custom carregados: 0
✅ [Produtos] Produtos carregados: { total: 10, custom: 0, default: 10 }
```

### 2. Testar com Tabela Existente

1. Acesse `/app/produtos`
2. Verifique console - não deve aparecer "Tabela não encontrada"
3. Produtos padrão devem aparecer normalmente
4. Se tiver produtos custom, devem aparecer na seção "Meus Produtos"

### 3. Testar Botão Recarregar

1. Clique no botão "Recarregar" no header
2. Verifique logs no console
3. Produtos devem recarregar

### 4. Testar Adicionar Produto Custom

1. Clique em "Adicionar meu produto"
2. Preencha o formulário
3. Clique em "Salvar"
4. Se der erro, verifique a mensagem:
   - **"Tabela não encontrada"**: Tabela realmente não existe
   - **"Erro de autenticação"**: Problema com login
   - **"Sem permissão"**: Problema com RLS

## Verificações de Debug

### Verificar Supabase Configurado

No console, procure por:
```
✅ [Supabase] Client initialized successfully
✅ [Supabase] URL: https://xxx.supabase.co
```

### Verificar Query Executada

No console, procure por:
```
🔍 [ProductCatalog] Buscando produtos custom para userId: xxx
```

### Verificar Erro Real

Se houver erro, o console mostrará:
```
🔍 [SupabaseError] Classificando erro
Error type: auth_error
Error code: 401
Error message: ...
```

## Checklist de Verificação

- [ ] Supabase está configurado (`.env.local` existe e tem credenciais válidas)
- [ ] Tabela `products_custom` existe no Supabase
- [ ] RLS policies estão ativas
- [ ] Usuário está logado
- [ ] Console não mostra "Tabela não encontrada" quando tabela existe
- [ ] Produtos padrão sempre aparecem
- [ ] Produtos custom aparecem quando existem
- [ ] Botão "Recarregar" funciona
- [ ] Mensagens de erro são apropriadas

## Arquivos Modificados

1. **`src/lib/supabaseErrorHandler.ts`** (NOVO)
   - Sistema de classificação de erros

2. **`src/lib/productCatalogService.ts`**
   - Melhorado tratamento de erros
   - Logs detalhados
   - Verificação de userId

3. **`src/pages/app/Produtos.tsx`**
   - Removidas verificações incorretas
   - Adicionado botão Recarregar
   - Mensagens de erro apropriadas
   - Logs detalhados

## Próximos Passos (Opcional)

1. Adicionar métricas de erro (quantos erros de cada tipo)
2. Adicionar retry automático para erros de rede
3. Cache de produtos custom para melhor performance
4. Testes automatizados para diferentes cenários de erro




