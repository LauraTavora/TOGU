import type { Circle } from "../domain/circle";
import type { CircleRepository } from "../ports/circle-repository";
import type { WorkspaceAccess } from "../ports/workspace-access";
import { PersonalWorkspaceNotFoundError } from "./errors";

export class ListCirclesUseCase {
  constructor(
    private readonly circleRepository: CircleRepository,
    private readonly workspaceAccess: WorkspaceAccess,
  ) {}

  async execute(userId: string): Promise<Circle[]> {
    const workspaceId = await this.workspaceAccess.findPersonalWorkspaceIdForUser(userId);
    if (!workspaceId) {
      throw new PersonalWorkspaceNotFoundError();
    }

    return this.circleRepository.listForWorkspace(workspaceId);
  }
}
