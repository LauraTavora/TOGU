# ADR-020 — Headers de segurança (CSP, HSTS e afins)

## Status
Aceito.

## Contexto
`docs/SECURITY.md` afirmava, desde a entrega inicial de documentação, que "Content Security Policy, HSTS, cookies seguros... HTTPS obrigatório, CORS restritivo" estavam entre os "Controles aplicados". Isso nunca foi verdade para CSP, HSTS e CORS — `next.config.mjs` não tinha nenhum header de segurança configurado, e não existia `middleware.ts`. Só os cookies (`httpOnly`/`secure` em produção/`sameSite: lax`, em `shared/http/refresh-cookie.ts`) já estavam corretos desde a ADR-006. Esta entrega fecha a lacuna real de CSP/HSTS/headers e corrige a documentação para refletir o que de fato existe.

## Decisão

### CSP com nonce por requisição, via `middleware.ts`
Content-Security-Policy não pode ser um header estático em `next.config.mjs` porque uma política restritiva de `script-src` precisa de um nonce diferente a cada requisição (a alternativa, `'unsafe-inline'`, permitiria qualquer script injetado, tornando a CSP inútil contra XSS). Seguindo o padrão documentado pelo próprio Next.js para o App Router: o middleware gera um nonce aleatório por requisição, coloca no header `Content-Security-Policy` da resposta, e o Next automaticamente aplica esse mesmo nonce a todo `<script>` que ele gera (chunks e bootstrap de hidratação) — nenhum layout precisa passar o nonce manualmente.

### `export const dynamic = "force-dynamic"` no layout raiz — descoberto como necessário, não copiado da documentação
Testando de verdade com `next build` + `next start` + `curl` (não só confiando na receita da documentação do Next.js), descobri que a abordagem de nonce **quebra silenciosamente em páginas estaticamente pré-geradas**: o HTML delas é congelado em build time, então os `<script>` inline de hidratação nunca têm o nonce daquela requisição específica — o navegador bloquearia a hidratação inteira do app. Como praticamente toda página deste app é client-side (busca dados no `useEffect` depois de montar) e por isso qualifica para otimização estática do Next, isso afetaria literalmente todas as páginas, não um caso isolado.

A correção foi forçar renderização dinâmica em todo o app (`export const dynamic = "force-dynamic"` no `app/layout.tsx`, que se propaga para toda a árvore). Verificado depois com `next start` real: o nonce do header `Content-Security-Policy` bate exatamente com o nonce em todo `<script>` do HTML retornado, em `/`, `/login` e `/hoje`.

**Custo assumido conscientemente:** perde-se a otimização estática/cache de borda para todas as páginas — cada requisição agora é renderizada no servidor. Aceitável aqui porque o produto é majoritariamente autenticado (a maior parte do conteúdo real já dependeria de dados por usuário de qualquer forma) e a prioridade era CSP corretamente aplicada, não a última milissegundo de latência numa página estática. Se isso se tornar um problema de performance real, a alternativa correta seria usar `'unsafe-inline'` só como `script-src` (com hash-based CSP sendo impraticável aqui, já que o payload de hidratação muda a cada build/dado) — uma CSP mais fraca, não a ausência dela.

### `upgrade-insecure-requests` e HSTS fora do modo de desenvolvimento
`upgrade-insecure-requests` faria o navegador tentar recarregar os próprios recursos da página via HTTPS — em `next dev` (servido por `http://localhost`), isso quebraria o carregamento de scripts/estilos do próprio servidor de desenvolvimento. HSTS tecnicamente já é ignorado pelo navegador em conexões não-HTTPS, mas mesmo assim é omitido em desenvolvimento para não ser enganoso. Ambos ficam condicionados a `NODE_ENV === "production"`.

### `Permissions-Policy` libera geolocalização só para o próprio site
`geolocation=(self)` — não `()` (bloqueado) — porque a página Explorar (ADR-018) depende de `navigator.geolocation`. Câmera e microfone são bloqueados (`camera=(), microphone=()`) porque nenhuma feature do produto os usa hoje.

### `X-Frame-Options: DENY` mantido apesar de `frame-ancestors 'none'` na CSP
Redundante para navegadores modernos (que já respeitam `frame-ancestors`), mas mantido como defesa em profundidade para qualquer cliente que só suporte o header legado.

## Correção na documentação
`docs/SECURITY.md` tinha "CORS restritivo" listado como controle aplicado — não existe nenhum handling de CORS no código (nenhuma rota seta `Access-Control-Allow-Origin` ou similar). Isso nunca foi necessário até agora porque não existe nenhum cliente cross-origin real (o app mobile, que precisaria disso, ainda não foi implementado). Corrigido para registrar isso como pendente, não implementado.

## Consequências
- Sem navegador real disponível neste ambiente (mesma limitação desde a ADR-013), a verificação foi feita via `next build` + `next start` real + `curl`, inspecionando o HTML retornado e confirmando que o nonce do header bate com o nonce de todo `<script>` da página — não uma simples inspeção de header, mas confirmação de que a política realmente permitiria a hidratação. Ainda assim, checar o console do navegador por violações de CSP antes de considerar isso pronto para produção é recomendado, já que sutilezas de runtime (ex.: uma lib futura que injete `<style>` sem nonce) só apareceriam ali.
- CORS continua não implementado — vira relevante no dia em que o app mobile (ou qualquer outro cliente cross-origin) precisar chamar esta API.
