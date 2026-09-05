import { randomUUID } from "node:crypto";
import { assertValidCircleName } from "../domain/circle";
import type { Circle } from "../domain/circle";
import type { CircleRepository } from "../ports/circle-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { PersonalWorkspaceNotFoundError } from "./errors";

export class CreateCircleUseCase {
  constructor(
    private readonly circleRepository: CircleRepository,
    private readonly workspaceAccess: WorkspaceAccess,
  ) {}

  async execute(ownerUserId: string, name: string): Promise<Circle> {
    assertValidCircleName(name);

    const workspaceId = await this.workspaceAccess.findPersonalWorkspaceIdForUser(ownerUserId);
    if (!workspaceId) {
      throw new PersonalWorkspaceNotFoundError();
    }

    return this.circleRepository.create({ id: randomUUID(), workspaceId, name });
  }
}
