import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@togu/database";
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
      },
    });
    return { workspaceId: workspace.id };
  }
}
