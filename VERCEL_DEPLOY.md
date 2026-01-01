# Guia de Deploy na Vercel

Este documento descreve como configurar e fazer deploy da aplicação CALC na Vercel.

## ✅ Verificações Pré-Deploy

### 1. Exportações Corretas

- ✅ `src/contexts/AuthContext.tsx` exporta `useAuth` como named export
- ✅ `src/contexts/AuthContext.tsx` exporta `AuthProvider` como named export
- ✅ Não há exportações duplicadas
- ✅ Todos os imports usam named imports: `import { useAuth } from "@/contexts/AuthContext"`

### 2. Build Local

Execute localmente para garantir que não há erros:

```bash
npm run build
```

O build deve completar com sucesso sem erros.

## 🔧 Configuração de Variáveis de Ambiente na Vercel

### Variáveis Obrigatórias

A aplicação requer as seguintes variáveis de ambiente para funcionar corretamente:

1. **VITE_SUPABASE_URL**
   - Descrição: URL do projeto Supabase
   - Formato: `https://seu-projeto.supabase.co`
   - Onde obter: Dashboard do Supabase → Settings → API → Project URL

2. **VITE_SUPABASE_ANON_KEY**
   - Descrição: Chave pública (anon key) do Supabase
   - Formato: String longa (JWT) ou chave publishable (`sb_publishable_...`)
   - Onde obter: Dashboard do Supabase → Settings → API → Project API keys → `anon` `public`

### Como Configurar na Vercel

#### Opção 1: Via Dashboard da Vercel (Recomendado)

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://seu-projeto.supabase.co`
   - **Environment**: Selecione `Production`, `Preview` e `Development` (ou apenas Production)
   - Clique em **Save**
5. Repita para `VITE_SUPABASE_ANON_KEY`

#### Opção 2: Via CLI da Vercel

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Adicionar variáveis de ambiente
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Para preview e development também
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development
```

### ⚠️ Importante

- **Prefixo VITE_**: Todas as variáveis de ambiente que precisam ser acessadas no frontend devem ter o prefixo `VITE_` (requisito do Vite)
- **Rebuild Necessário**: Após adicionar/modificar variáveis de ambiente, você precisa fazer um novo deploy para que as mudanças tenham efeito
- **Segurança**: A `VITE_SUPABASE_ANON_KEY` é uma chave pública e pode ser exposta no frontend. Certifique-se de ter Row Level Security (RLS) configurado no Supabase

## 🚀 Deploy

### Primeiro Deploy

1. Conecte seu repositório GitHub/GitLab/Bitbucket à Vercel
2. Configure as variáveis de ambiente (veja seção acima)
3. A Vercel detectará automaticamente que é um projeto Vite
4. O build será executado automaticamente

### Deploys Subsequentes

- **Push para branch principal**: Deploy automático em produção
- **Pull Requests**: Deploy automático em preview

## 📋 Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Build local passa sem erros (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Vercel:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Exportações corretas em `src/contexts/AuthContext.tsx`
- [ ] Imports corretos em todos os arquivos que usam `useAuth`

## 🐛 Troubleshooting

### Build Falha com Erro de Import

Se o build falhar com erro sobre `useAuth` não estar exportado:

1. Verifique que `src/contexts/AuthContext.tsx` tem:
   ```typescript
   export function useAuth(): AuthContextType { ... }
   ```

2. Verifique que não há exportação duplicada de `AuthProvider`

3. Execute `npm run build` localmente para reproduzir o erro

### Variáveis de Ambiente Não Funcionam

1. Certifique-se de que as variáveis têm o prefixo `VITE_`
2. Após adicionar variáveis, faça um novo deploy
3. Verifique os logs do build na Vercel para ver se as variáveis estão sendo lidas

### App Funciona Localmente mas Não na Vercel

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique os logs de build na Vercel
3. Verifique o console do navegador para erros de runtime

## 📚 Recursos

- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Documentação do Supabase](https://supabase.com/docs)





