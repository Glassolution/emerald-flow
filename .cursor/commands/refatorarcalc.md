# refatorarcalc

Refatore o código do projeto Calc seguindo rigorosamente as regras abaixo.

OBJETIVO
- Organizar o código de forma linear, limpa e previsível.
- Melhorar legibilidade, performance e manutenção.
- Não quebrar funcionalidades existentes.
- Manter o projeto sempre funcional após a refatoração.

REGRAS OBRIGATÓRIAS

1) Organização e arquitetura
- Nunca colocar lógica de negócio diretamente em componentes React.
- Toda lógica de cálculo deve ficar em src/lib (ex: calcUtils.ts).
- Componentes devem conter apenas:
  - estado
  - chamadas de funções
  - renderização de UI
- Não duplicar lógica existente.

2) Estrutura do projeto (respeitar sempre)
- Páginas: src/pages/app
- Componentes reutilizáveis: src/components
- Layouts: src/components/layout
- Lógica e regras de negócio: src/lib
- Hooks reutilizáveis: src/hooks

3) Calculadora de Calda
- Toda alteração relacionada à calculadora deve usar calculateCalda().
- Nunca reimplementar fórmulas dentro da UI.
- Validações devem ficar na camada de lógica, não no JSX.
- Resultados devem ser retornados prontos para exibição.

4) Navegação
- BottomNavigation deve estar sempre conectada a rotas reais.
- Não criar botões sem ação.
- Aba ativa deve refletir a rota atual.
- Não alterar rotas sem necessidade.

5) Código
- Usar TypeScript de forma explícita.
- Evitar any.
- Preferir funções puras.
- Nomes claros e autoexplicativos.
- Manter código simples (evitar abstrações desnecessárias).

6) UI e UX
- Mobile-first sempre.
- Paleta fixa: preto e verde.
- Não introduzir cores fora do padrão.
- Manter consistência visual em todas as telas.

7) Refatoração segura
- Refatorar em pequenos passos.
- Não reescrever arquivos inteiros sem necessidade.
- Se algo precisar ser alterado estruturalmente, explicar o motivo.

8) Entrega
- Ao finalizar, explicar brevemente:
  - O que foi refatorado
  - Quais arquivos foram alterados
  - Se houve mudança de comportamento

IMPORTANTE
- Utilize o MCP Context7 para manter contexto completo do projeto, rotas, componentes e estado atual da aplicação.
