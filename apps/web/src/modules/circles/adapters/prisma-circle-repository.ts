import type { PrismaClient } from "@fecho/database";
import type { Circle } from "../domain/circle";
import type { CircleRepository, CreateCircleInput } from "../ports/circle-repository";

export class PrismaCircleRepository implements CircleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateCircleInput): Promise<Circle> {
    return this.prisma.circle.create({
      data: { id: input.id, workspaceId: input.workspaceId, name: input.name },
    });
  }

  async findById(id: string): Promise<Circle | null> {
    return this.prisma.circle.findUnique({ where: { id } });
  }

  async listForWorkspace(workspaceId: string): Promise<Circle[]> {
    return this.prisma.circle.findMany({ where: { workspaceId }, orderBy: { createdAt: "asc" } });
  }

  async rename(id: string, name: string): Promise<Circle> {
    return this.prisma.circle.update({ where: { id }, data: { name } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.circle.delete({ where: { id } });
  }
}
