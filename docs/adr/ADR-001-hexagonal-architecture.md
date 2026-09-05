# ADR-001 — Arquitetura Hexagonal (Ports and Adapters)

## Status
Aceito.

## Contexto
O TOGU precisa evoluir por anos, trocar fornecedores (e-mail, mapas, eventos, calendários externos) e rodar em web e mobile sem duplicar regra de negócio. Acoplar o domínio diretamente ao Next.js/Prisma tornaria essas trocas caras e arriscadas.

## Decisão
Adotar Arquitetura Hexagonal (Ports and Adapters) como obrigatória e não negociável. Domínio e casos de uso não conhecem framework, banco ou APIs externas — apenas interfaces (ports). Implementações concretas ficam em `adapters/`.

## Consequências
- Mais arquivos/indireção do que uma abordagem direta no framework.
- Testes de domínio ficam rápidos e independentes de infraestrutura.
- Troca de fornecedor (ex.: SendGrid → Resend, Google Meet → Zoom) não exige tocar em regra de negócio.
- Exige disciplina de code review para não vazar dependências de framework para dentro do domínio.
