import type { UserRepository } from "../ports/user-repository";

export class CancelAccountDeletionUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    await this.userRepository.setDeletionRequestedAt(userId, null);
  }
}
