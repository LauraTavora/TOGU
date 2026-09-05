# ADR-013 — Fundação da UI web (Design System, SDK e autenticação)

## Status
Aceito.

## Contexto
Até esta entrega, o TOGU era 100% backend (API + banco). Esta é a primeira entrega de UI web real: `packages/design-system` ganha componentes de fato (não só tokens), nasce `packages/sdk` (cliente HTTP tipado, pensado para ser reaproveitado pelo app mobile depois — docs/ARCHITECTURE.md §6), e as telas de autenticação (login, cadastro, recuperação de senha) mais uma home mínima (`/hoje`) passam a existir.

## Decisões

### Tokens de cor via CSS variables, não valores fixos do Tailwind
`tailwind.config.ts` referencia `rgb(var(--color-x) / <alpha-value>)` em vez de importar os hexadecimais de `@togu/design-system` diretamente. As variáveis são declaradas em `globals.css` para light (padrão), dark via `prefers-color-scheme` e uma classe `.dark` manual (preparada para a futura tela de Aparência, seção 76 do PRD). Trocar de tema não exige rebuild do Tailwind — só troca a variável CSS. O `packages/design-system/src/tokens/colors.ts` continua sendo a fonte da verdade conceitual; os valores em `globals.css` precisam ser mantidos manualmente em sincronia (documentado com comentário no próprio arquivo) — não há geração automática nesta entrega.

### SDK fino, sem estado
`packages/sdk` expõe `createHttpClient` (fetch com tratamento de erro padronizado, `ApiError` tipado) e `createAuthApi` (métodos tipados para os endpoints de `/api/v1/auth/*`). Não guarda token nem faz cache — quem usa o SDK (o `AuthProvider` da web, futuramente o app mobile) decide onde e como manter o estado de sessão. Isso permite reaproveitar o mesmo pacote em React Native sem trazer nenhuma dependência de DOM/Next.js junto.

### Estratégia de sessão no cliente: access token em memória + refresh silencioso
O access token (JWT de 15 min, ver ADR-006) nunca é persistido em `localStorage`/`sessionStorage` — vive só em memória (`useRef` dentro do `AuthProvider`), perdido a cada reload de página de propósito. Ao montar, o `AuthProvider` chama `POST /api/v1/auth/refresh` (que usa o refresh token no cookie `HttpOnly`) para obter um access token novo silenciosamente; se isso falhar, o usuário é tratado como não autenticado. Isso evita expor o access token a XSS via `localStorage`, ao custo de um round-trip extra a cada carregamento de página — aceitável dado o volume esperado do MVP.

### Guards de rota no cliente, não middleware
`RequireAuth` (redireciona para `/login` se não autenticado) e `GuestOnly` (redireciona para `/hoje` se já autenticado) são componentes client-side que leem o contexto de auth. Isso é suficiente para UX (evitar telas erradas), mas **nunca** substitui a validação real no backend — cada rota de API já valida autenticação/autorização de forma independente (docs/SECURITY.md), então mesmo que alguém contorne o guard client-side, nenhum dado é exposto.

### Correção retroativa importante: `params` assíncrono no Next.js 15
Ao rodar o primeiro `next build` real deste projeto (nenhuma entrega anterior havia rodado um build de produção — só `vitest`, que chama os handlers diretamente sem passar pelo contrato de tipos do Next.js), descobrimos que **todas** as rotas dinâmicas (`[id]`, `[targetType]/[targetId]`, etc.) em `circles`, `events`, `meeting-requests`, `discovery`, `notifications` e `priority` usavam a assinatura antiga do Next.js 14 (`{ params: { id: string } }`) — no Next.js 15, `params` é uma `Promise`. Isso nunca falhava nos testes (que constroem o objeto de contexto manualmente), mas quebraria о build de produção real. Corrigido em todas as ~13 rotas afetadas, com um tipo compartilhado `RouteParams<T>` em `shared/http/route-params.ts` para evitar repetir a assinatura em cada arquivo.

## Consequências
- **Nenhum teste automatizado de renderização de componente** nesta entrega — validar visualmente exigiria `@testing-library/react` + `jsdom`, não configurados ainda. A verificação foi feita via `next build` (produção) limpo + `next dev` real + `curl` confirmando HTML renderizado e validação de API ponta a ponta. Testar interações reais (clique, navegação) ainda depende de um navegador, que não está disponível neste ambiente — fica como lacuna conhecida a fechar quando houver acesso a esse tipo de ferramenta.
- A home em `/hoje` é deliberadamente mínima (confirma que o login funciona, mostra o `userId`) — o design completo da seção 44 do PRD (compromissos do dia, contagem de solicitações, sugestões) é a próxima entrega de UI.
- Como o `next build` corrigiu um bug real presente desde as primeiras entregas de backend, isso reforça a lição operacional: um build de produção real deveria ter sido rodado antes, não só testes unitários — passa a ser um passo de verificação padrão para entregas futuras que tocam `app/api`.
