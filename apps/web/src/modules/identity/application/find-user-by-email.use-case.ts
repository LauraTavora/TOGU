import type { UserRepository } from "../ports/user-repository";
import type { UserPublicInfo } from "./get-users-public-info.use-case";

export class FindUserByEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(email: string): Promise<UserPublicInfo | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? { id: user.id, email: user.email } : null;
  }
}
