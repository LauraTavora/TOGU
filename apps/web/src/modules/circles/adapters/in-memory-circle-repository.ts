import type { Circle } from "../domain/circle";
import type { CircleRepository, CreateCircleInput } from "../ports/circle-repository";
import { CircleNotFoundError } from "../application/errors";

export class InMemoryCircleRepository implements CircleRepository {
  private readonly circles = new Map<string, Circle>();

  async create(input: CreateCircleInput): Promise<Circle> {
    const circle: Circle = {
      id: input.id,
      workspaceId: input.workspaceId,
      name: input.name,
      createdAt: new Date(),
    };
    this.circles.set(circle.id, circle);
    return circle;
  }

  async findById(id: string): Promise<Circle | null> {
    return this.circles.get(id) ?? null;
  }

  async listForWorkspace(workspaceId: string): Promise<Circle[]> {
    return Array.from(this.circles.values()).filter((c) => c.workspaceId === workspaceId);
  }

  async rename(id: string, name: string): Promise<Circle> {
    const circle = this.circles.get(id);
    if (!circle) throw new CircleNotFoundError();
    const updated = { ...circle, name };
    this.circles.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.circles.delete(id);
  }
}
