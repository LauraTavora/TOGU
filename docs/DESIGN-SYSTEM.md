# TOGU — Design System

Pacote: `packages/design-system`. Tokens centralizados — nunca espalhados diretamente pelos componentes.

## Direção de identidade
Proximidade, amizade, organização, confiança, leveza, modernidade sem parecer excessivamente "tech" nem corporativo (evitar estética tipo Outlook), e sem parecer "gerado por IA" — deve parecer projetado por uma equipe de UX madura.

## Tokens — cor

```text
primary            #665CF6   (roxo/índigo amigável)
secondary          #23BFA7   (verde/teal — disponibilidade)
warning-soft-hold  #F2B84B   (amarelo/âmbar — soft hold)
danger-conflict    #EF6461   (coral/vermelho suave — conflito)
background         #F7F8FB
surface            #FFFFFF
text-primary       #17181C
text-secondary     #71717A
```

Modos: Light Mode e Dark Mode (com tokens equivalentes semânticos, ex.: `background`/`surface` invertidos), preparado para temas customizados futuros. Implementado via CSS variables em `apps/web/app/globals.css` (light por padrão, dark via `prefers-color-scheme` e via classe `.dark` para alternância manual futura) — ver `ADR-013`.

## Fundamentos visuais
- Fundo claro, superfícies brancas/levemente acinzentadas, contraste alto.
- Cards arredondados, sombras extremamente discretas.
- Bastante espaço em branco, tipografia moderna, ícones simples.
- Microinterações e animações naturais (nunca exageradas).

## Estrutura do pacote (estado atual)
```text
tokens/
  colors.ts     (light/dark, exporta também as triplas RGB usadas em globals.css)
  spacing.ts    (spacing, radius, shadow)
lib/
  cn.ts         (combinador de classes minimalista)
components/
  button.tsx           (variantes primary/secondary/ghost/danger)
  input.tsx             (label + hint + erro, acessível via aria-describedby)
  textarea.tsx          (mesmo padrão visual do input)
  card.tsx
  badge.tsx
  avatar.tsx            (iniciais como fallback)
  status-indicator.tsx  (ver seção seguinte)
  empty-state.tsx
  skeleton.tsx
  dialog.tsx            (modal simples, sem dependência — ocupa a largura toda em telas pequenas)
```
Ainda não implementados (pendentes de UI futura): `bottom-sheet` dedicado (o `Dialog` já cobre o caso em telas pequenas), `calendar-primitives`.

## Componentes de status (padronizados)
```text
🟢 Disponível
🟡 Parcialmente reservado (Soft Hold)
🔴 Ocupado
🟣 Prioridade
```
Nunca depender exclusivamente de cor — sempre combinar com ícone e/ou texto (requisito de acessibilidade).

## Acessibilidade — meta mínima
**WCAG 2.2 AA**: navegação por teclado, foco visível, aria labels, contraste adequado, suporte a leitor de tela, touch targets com tamanho mínimo, `prefers-reduced-motion`, textos escaláveis.

## Empty states e loading
- Empty states amigáveis e específicos (ex.: "Nenhuma solicitação por aqui. Quando alguém quiser marcar algo com você, aparecerá aqui.").
- Skeletons e optimistic UI onde seguro; nunca loading infinito sem feedback.

## Responsividade
Requisito arquitetural desde o primeiro componente, testado nos breakpoints: `320, 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920`. Sem overflow horizontal, modais maiores que viewport, textos cortados ou botões inacessíveis.
