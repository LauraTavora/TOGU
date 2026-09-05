import { describe, expect, it } from "vitest";
import { RegisterUserUseCase, EmailAlreadyRegisteredError } from "./register-user.use-case";
import { InvalidEmailError } from "../domain/email";
import { WeakPasswordError } from "../domain/password-policy";
import { InMemoryUserRepository } from "../adapters/in-memory-user-repository";
import { InMemoryAuthTokenRepository } from "../adapters/in-memory-auth-token-repository";
import { InMemoryWorkspaceProvisioner } from "../adapters/in-memory-workspace-provisioner";
import { BcryptPasswordHasher } from "../adapters/bcrypt-password-hasher";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import { ConsoleEmailProvider } from "../adapters/console-email-provider";

function buildUseCase() {
  const userRepository = new InMemoryUserRepository();
  const authTokenRepository = new InMemoryAuthTokenRepository();
  return {
    useCase: new RegisterUserUseCase(
      userRepository,
      new BcryptPasswordHasher(),
      new CryptoOpaqueTokenGenerator(),
      authTokenRepository,
      new ConsoleEmailProvider(),
      new InMemoryWorkspaceProvisioner(),
    ),
    userRepository,
    authTokenRepository,
  };
}

describe("RegisterUserUseCase", () => {
  it("cria o usuário, provisiona workspace pessoal e emite token de verificação", async () => {
    const { useCase, userRepository, authTokenRepository } = buildUseCase();

    const { user, workspaceId } = await useCase.execute({
      email: "Ana@Example.com",
      rawPassword: "Segura123",
    });

    expect(user.email).toBe("ana@example.com");
    expect(workspaceId).toBeTruthy();

    const stored = await userRepository.findByEmail("ana@example.com");
    expect(stored).not.toBeNull();
    expect(stored?.emailVerifiedAt).toBeNull();

    const tokens = authTokenRepository.findAllForUser(user.id);
    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.purpose).toBe("EMAIL_VERIFICATION");
  });

  it("rejeita e-mail duplicado", async () => {
    const { useCase } = buildUseCase();
    await useCase.execute({ email: "ana@example.com", rawPassword: "Segura123" });

    await expect(
      useCase.execute({ email: "ana@example.com", rawPassword: "OutraSenha123" }),
    ).rejects.toThrow(EmailAlreadyRegisteredError);
  });

  it("rejeita e-mail inválido antes de tocar o repositório", async () => {
    const { useCase } = buildUseCase();
    await expect(
      useCase.execute({ email: "invalido", rawPassword: "Segura123" }),
    ).rejects.toThrow(InvalidEmailError);
  });

  it("rejeita senha fraca", async () => {
    const { useCase } = buildUseCase();
    await expect(
      useCase.execute({ email: "ana@example.com", rawPassword: "fraca" }),
    ).rejects.toThrow(WeakPasswordError);
  });
});
