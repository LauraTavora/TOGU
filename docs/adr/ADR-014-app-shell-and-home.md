# ADR-014 — App Shell (navegação) e Home real

## Status
Aceito.

## Contexto
docs/PRODUCT.md §45 define a navegação (sidebar desktop com 8 itens; bottom nav mobile com 5) e §44 define o conteúdo da Home. Até esta entrega só existia uma `/hoje` mínima sem chrome de navegação nenhum.

## Decisões

### Route group `(app)` para o chrome autenticado
Todas as páginas privadas vivem em `app/(app)/*`, com um único `layout.tsx` que aplica `<AppShell>` (Sidebar + BottomNav + `RequireAuth`) uma vez para todas — nenhuma página individual precisa importar `RequireAuth` por conta própria (diferente da primeira versão de `/hoje`, que fazia isso manualmente). Route groups do Next.js (pasta entre parênteses) não afetam a URL, então `/hoje` continua `/hoje`.

### Guard de autenticação engloba o chrome, não só o conteúdo
`AppShell` passa `Sidebar`/`main`/`BottomNav` como filhos de `RequireAuth` — enquanto o status de auth está `loading` ou `unauthenticated`, nada do chrome aparece, só o esqueleto de carregamento. Evita mostrar a navegação completa por uma fração de segundo antes de saber se a sessão é válida.

### Ícones originais, sem biblioteca externa
Em vez de adicionar uma dependência de ícones (lucide-react, heroicons, etc.) só para 9 símbolos, `client/shell/icons.tsx` traz SVGs simples desenhados à mão (formas geométricas básicas — casa, calendário, círculos sobrepostos, bússola). Evita uma dependência nova para um problema pequeno, e mantém a linha "ícones simples" da direção visual (docs/DESIGN-SYSTEM.md).

### Todas as 8 rotas do menu existem desde já — a maioria como placeholder
Construir só as páginas prontas e deixar as outras sem rota geraria links quebrados na navegação. Em vez disso, todo item do menu (`/calendario`, `/solicitacoes`, `/pessoas`, `/circulos`, `/explorar`, `/configuracoes`) tem uma página real usando um componente `ComingSoon` (título + `EmptyState` "Em construção" com uma frase específica do que falta) — nunca um 404. `/hoje` e `/notificacoes` são as duas páginas totalmente funcionais desta entrega, porque suas APIs já existem prontas e completas.

### Home (`/hoje`) escopada ao que é real
docs/PRODUCT.md §44 pede também "Pessoas" (sugestões), "Próximos eventos" e "Smart Suggestion". Nenhum dos três foi incluído nesta entrega:
- **Pessoas/sugestões**: não existe um módulo de amizades/contatos construído (só `Circles`, que é outra coisa) — mostrar uma seção fingindo essa funcionalidade seria enganoso.
- **Próximos eventos** (do módulo `discovery`): a busca exige coordenadas do usuário, e o fluxo de consentimento de geolocalização (docs/PRODUCT.md §61) ainda não tem UI.
- **Smart Suggestion**: depende do Smart Slots (seção 27), que ainda não foi implementado no backend.

A Home real desta entrega mostra apenas o que tem dado de verdade por trás: compromissos de hoje (`GET /api/v1/calendar`) e contagem de solicitações pendentes recebidas (`GET /api/v1/meeting-requests?box=received&status=PENDING`), com link para a futura Central de Solicitações.

## Consequências
- A navegação está estruturalmente completa (todos os 8 destinos existem e são alcançáveis), mesmo que o conteúdo de 6 delas ainda seja placeholder — próximas entregas substituem `ComingSoon` por conteúdo real uma a uma, sem precisar tocar na navegação.
- `/notificacoes` é a segunda página totalmente funcional da aplicação (além de `/hoje`), confirmando que o padrão de fetch com `useAuth().http` + tratamento de `ApiError` funciona igual em uma tela com mutação (marcar como lida) e não só leitura.
