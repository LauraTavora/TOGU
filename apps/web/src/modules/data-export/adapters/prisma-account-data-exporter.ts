import type { PrismaClient } from "@fecho/database";
import type { AccountDataExport, AccountDataExporter } from "../ports/account-data-exporter";

export class PrismaAccountDataExporter implements AccountDataExporter {
  constructor(private readonly prisma: PrismaClient) {}

  async exportForUser(userId: string): Promise<AccountDataExport> {
    const record = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: { include: { workspace: true } },
        ownedCalendars: { include: { events: true } },
        sentRequests: true,
        meetingParticipations: { include: { meetingRequest: true } },
        circleMemberships: { include: { circle: true } },
        priorityProfile: { include: { rules: true } },
        savedEvents: { include: { nearbyEvent: true } },
        contacts: true,
        notificationPreference: true,
        auditLogs: true,
      },
    });

    return {
      exportedAt: new Date().toISOString(),
      account: {
        id: record.id,
        email: record.email,
        createdAt: record.createdAt.toISOString(),
        emailVerifiedAt: record.emailVerified?.toISOString() ?? null,
      },
      memberships: record.memberships.map((membership) => ({
        workspaceId: membership.workspaceId,
        workspaceName: membership.workspace.name,
        role: membership.role,
      })),
      calendars: record.ownedCalendars.map((calendar) => ({ id: calendar.id, name: calendar.name })),
      events: record.ownedCalendars.flatMap((calendar) =>
        calendar.events.map((event) => ({
          id: event.id,
          title: event.title,
          notes: event.notes,
          startAt: event.startAt.toISOString(),
          endAt: event.endAt.toISOString(),
          location: event.location,
        })),
      ),
      meetingRequestsSent: record.sentRequests.map((request) => ({
        id: request.id,
        title: request.title,
        status: request.status,
        startAt: request.startAt.toISOString(),
        endAt: request.endAt.toISOString(),
        createdAt: request.createdAt.toISOString(),
      })),
      meetingRequestsReceived: record.meetingParticipations.map((participation) => ({
        id: participation.meetingRequest.id,
        title: participation.meetingRequest.title,
        status: participation.meetingRequest.status,
        startAt: participation.meetingRequest.startAt.toISOString(),
        endAt: participation.meetingRequest.endAt.toISOString(),
        respondedAt: participation.respondedAt?.toISOString() ?? null,
      })),
      circleMemberships: record.circleMemberships.map((membership) => ({
        circleId: membership.circleId,
        circleName: membership.circle.name,
      })),
      priorityRules: (record.priorityProfile?.rules ?? []).map((rule) => ({
        targetType: rule.targetType,
        targetId: rule.targetId,
        level: rule.level,
      })),
      savedEvents: record.savedEvents.map((saved) => ({
        nearbyEventId: saved.nearbyEventId,
        title: saved.nearbyEvent.title,
      })),
      contacts: record.contacts.map((contact) => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      })),
      notificationPreference: record.notificationPreference
        ? {
            inApp: record.notificationPreference.inApp,
            push: record.notificationPreference.push,
            email: record.notificationPreference.email,
            webPush: record.notificationPreference.webPush,
          }
        : null,
      auditLogs: record.auditLogs.map((log) => ({
        action: log.action,
        createdAt: log.createdAt.toISOString(),
      })),
    };
  }
}
