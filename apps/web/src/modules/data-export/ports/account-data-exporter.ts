export interface AccountDataExport {
  exportedAt: string;
  account: {
    id: string;
    email: string;
    createdAt: string;
    emailVerifiedAt: string | null;
  };
  memberships: { workspaceId: string; workspaceName: string; role: string }[];
  calendars: { id: string; name: string }[];
  events: {
    id: string;
    title: string;
    notes: string | null;
    startAt: string;
    endAt: string;
    location: string | null;
  }[];
  meetingRequestsSent: {
    id: string;
    title: string;
    status: string;
    startAt: string;
    endAt: string;
    createdAt: string;
  }[];
  meetingRequestsReceived: {
    id: string;
    title: string;
    status: string;
    startAt: string;
    endAt: string;
    respondedAt: string | null;
  }[];
  circleMemberships: { circleId: string; circleName: string }[];
  priorityRules: { targetType: string; targetId: string; level: string }[];
  savedEvents: { nearbyEventId: string; title: string }[];
  contacts: { name: string; email: string | null; phone: string | null }[];
  notificationPreference: { inApp: boolean; push: boolean; email: boolean; webPush: boolean } | null;
  auditLogs: { action: string; createdAt: string }[];
}

/**
 * Único port desta entrega sem uma implementação em memória (ver ADR-022):
 * exportar dados é, por natureza, uma leitura ampla que atravessa quase
 * todos os módulos — diferente de qualquer outro port do sistema, que
 * pertence a um único módulo. Um adapter em memória fiel exigiria
 * replicar o grafo inteiro do schema Prisma sem ganhar cobertura real.
 */
export interface AccountDataExporter {
  exportForUser(userId: string): Promise<AccountDataExport>;
}
