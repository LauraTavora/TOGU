import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@fecho/database";
import type { WorkspaceProvisioner } from "../ports/workspace-provisioner";

export class PrismaWorkspaceProvisioner implements WorkspaceProvisioner {
  constructor(private readonly prisma: PrismaClient) {}

  async provisionPersonalWorkspace(userId: string): Promise<{ workspaceId: string }> {
    const workspace = await this.prisma.workspace.create({
      data: {
        id: randomUUID(),
        name: "Meu espaço",
        type: "PERSONAL",
        memberships: {
          create: { id: randomUUID(), userId, role: "OWNER" },
        },
        // Toda conta ganha um calendário pessoal por padrão (docs/ARCHITECTURE.md
        // §Multi-tenant) — o módulo `scheduling` o localiza via CalendarRepository.
        calendars: {
          create: { id: randomUUID(), ownerId: userId, name: "Minha agenda" },
        },
      },
    });
    return { workspaceId: workspace.id };
  }
}
