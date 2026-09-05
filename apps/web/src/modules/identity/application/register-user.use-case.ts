import { randomUUID } from "node:crypto";
import { Email } from "../domain/email";
import { assertPasswordStrength } from "../domain/password-policy";
import { EMAIL_VERIFICATION_TOKEN_TTL_MS } from "../domain/constants";
import type { User } from "../domain/user";
import type { UserRepository } from "../ports/user-repository";
import type { PasswordHasher } from "../ports/password-hasher";
import type { OpaqueTokenGenerator } from "../ports/opaque-token-generator";
import type { AuthTokenRepository } from "../ports/auth-token-repository";
import type { EmailProvider } from "../ports/email-provider";
import type { WorkspaceProvisioner } from "../ports/workspace-provisioner";

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("E-mail já cadastrado.");
  }
}

export interface RegisterUserInput {
  email: string;
  rawPassword: string;
}

export interface RegisterUserOutput {
  user: User;
  workspaceId: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: OpaqueTokenGenerator,
    private readonly authTokenRepository: AuthTokenRepository,
    private readonly emailProvider: EmailProvider,
    private readonly workspaceProvisioner: WorkspaceProvisioner,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email);
    assertPasswordStrength(input.rawPassword);

    const existing = await this.userRepository.findByEmail(email.toString());
    if (existing) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await this.passwordHasher.hash(input.rawPassword);
    const user = await this.userRepository.create({
      id: randomUUID(),
      email: email.toString(),
      passwordHash,
    });

    const { workspaceId } = await this.workspaceProvisioner.provisionPersonalWorkspace(user.id);

    const verification = this.tokenGenerator.generate();
    await this.authTokenRepository.create({
      id: randomUUID(),
      userId: user.id,
      purpose: "EMAIL_VERIFICATION",
      tokenHash: verification.tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    });
    await this.emailProvider.sendVerificationEmail(user.email, verification.token);

    return { user, workspaceId };
  }
}
