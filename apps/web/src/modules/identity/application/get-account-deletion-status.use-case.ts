import { computeScheduledDeletionAt } from "../domain/account-deletion";
import type { UserRepository } from "../ports/user-repository";

export interface AccountDeletionStatus {
  requestedAt: Date | null;
  scheduledDeletionAt: Date | null;
}

export class GetAccountDeletionStatusUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<AccountDeletionStatus> {
    const user = await this.userRepository.findById(userId);
    const requestedAt = user?.deletionRequestedAt ?? null;
    return {
      requestedAt,
      scheduledDeletionAt: requestedAt ? computeScheduledDeletionAt(requestedAt) : null,
    };
  }
}
