# TOGU — Integrations

Todas as integrações externas são isoladas via **ports** e implementadas como **adapters** substituíveis (Arquitetura Hexagonal, ver `ARCHITECTURE.md`).

## Calendários externos
```text
Ports: ExternalCalendarProvider
Adapters previstos: Google Calendar, Microsoft Outlook, ICS, (futuro) CalDAV
```
Objetivo futuro: sincronização bidirecional. Tokens OAuth nunca em texto puro (criptografados em repouso, ver `SECURITY.md`).

## Reuniões online
```text
Ports: MeetingProvider
Adapters previstos: Google Meet, Microsoft Teams, Zoom, Jitsi
```

## Descoberta de eventos
```text
Ports: EventDiscoveryProvider
```
Adapters futuros integrarão provedores de eventos autorizados. Scraping proibido nunca é utilizado.

## Geolocalização
```text
Ports: GeolocationProvider
```
Usado somente mediante consentimento explícito, sem retenção de histórico desnecessária (ver `PRIVACY-LGPD.md`).

## Notificações
```text
Ports: NotificationGateway, EmailProvider, PushNotificationProvider
Canais: in-app, push mobile, e-mail, web push
Arquitetura preparada para canal futuro: WhatsApp
```

## Mapas / deslocamento
```text
Ports: DistanceEstimationProvider (nome sugerido)
```
Usado para estimar deslocamento entre compromissos presenciais consecutivos (feature futura, estruturada desde já por adapter).

## Regra geral
Nenhuma dependência de fornecedor externo pode vazar para o domínio ou para casos de uso — sempre acessada via interface (port), permitindo troca de fornecedor sem reescrever regra de negócio.
