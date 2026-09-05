import { prisma } from "@togu/database";
import { RegisterUserUseCase } from "../application/register-user.use-case";
import { VerifyEmailUseCase } from "../application/verify-email.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { LogoutUseCase } from "../application/logout.use-case";
import { RefreshSessionUseCase } from "../application/refresh-session.use-case";
import { RequestPasswordResetUseCase } from "../application/request-password-reset.use-case";
import { ResetPasswordUseCase } from "../application/reset-password.use-case";
import { GetUsersPublicInfoUseCase } from "../application/get-users-public-info.use-case";
import { FindUserByEmailUseCase } from "../application/find-user-by-email.use-case";
import { PrismaUserRepository } from "../adapters/prisma-user-repository";
import { PrismaSessionRepository } from "../adapters/prisma-session-repository";
import { PrismaAuthTokenRepository } from "../adapters/prisma-auth-token-repository";
import { PrismaWorkspaceProvisioner } from "../adapters/prisma-workspace-provisioner";
import { BcryptPasswordHasher } from "../adapters/bcrypt-password-hasher";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import { JoseAccessTokenSigner } from "../adapters/jose-access-token-signer";
import { ConsoleEmailProvider } from "../adapters/console-email-provider";
import { getAuditLogger } from "@/shared/audit";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurado.");
  }
  return secret;
}

const userRepository = new PrismaUserRepository(prisma);
const sessionRepository = new PrismaSessionRepository(prisma);
const authTokenRepository = new PrismaAuthTokenRepository(prisma);
const workspaceProvisioner = new PrismaWorkspaceProvisioner(prisma);
const passwordHasher = new BcryptPasswordHasher();
const tokenGenerator = new CryptoOpaqueTokenGenerator();
const emailProvider = new ConsoleEmailProvider();
const auditLogger = getAuditLogger();

export function getAccessTokenSigner(): JoseAccessTokenSigner {
  return new JoseAccessTokenSigner(getAuthSecret());
}

export function createRegisterUserUseCase(): RegisterUserUseCase {
  return new RegisterUserUseCase(
    userRepository,
    passwordHasher,
    tokenGenerator,
    authTokenRepository,
    emailProvider,
    workspaceProvisioner,
  );
}

export function createVerifyEmailUseCase(): VerifyEmailUseCase {
  return new VerifyEmailUseCase(userRepository, authTokenRepository, tokenGenerator);
}

export function createLoginUseCase(): LoginUseCase {
  return new LoginUseCase(
    userRepository,
    sessionRepository,
    passwordHasher,
    tokenGenerator,
    getAccessTokenSigner(),
    auditLogger,
  );
}

export function createLogoutUseCase(): LogoutUseCase {
  return new LogoutUseCase(sessionRepository, tokenGenerator);
}

export function createRefreshSessionUseCase(): RefreshSessionUseCase {
  return new RefreshSessionUseCase(sessionRepository, tokenGenerator, getAccessTokenSigner());
}

export function createRequestPasswordResetUseCase(): RequestPasswordResetUseCase {
  return new RequestPasswordResetUseCase(
    userRepository,
    authTokenRepository,
    tokenGenerator,
    emailProvider,
  );
}

export function createResetPasswordUseCase(): ResetPasswordUseCase {
  return new ResetPasswordUseCase(
    userRepository,
    authTokenRepository,
    tokenGenerator,
    passwordHasher,
    sessionRepository,
    auditLogger,
  );
}

export function createGetUsersPublicInfoUseCase(): GetUsersPublicInfoUseCase {
  return new GetUsersPublicInfoUseCase(userRepository);
}

export function createFindUserByEmailUseCase(): FindUserByEmailUseCase {
  return new FindUserByEmailUseCase(userRepository);
}
