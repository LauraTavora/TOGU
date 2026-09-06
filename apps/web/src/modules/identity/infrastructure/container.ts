import { prisma } from "@fecho/database";
import { RegisterUserUseCase } from "../application/register-user.use-case";
import { VerifyEmailUseCase } from "../application/verify-email.use-case";
import { LoginUseCase } from "../application/login.use-case";
import { LogoutUseCase } from "../application/logout.use-case";
import { RefreshSessionUseCase } from "../application/refresh-session.use-case";
import { RequestPasswordResetUseCase } from "../application/request-password-reset.use-case";
import { ResendVerificationEmailUseCase } from "../application/resend-verification-email.use-case";
import { ResetPasswordUseCase } from "../application/reset-password.use-case";
import { GetUsersPublicInfoUseCase } from "../application/get-users-public-info.use-case";
import { FindUserByEmailUseCase } from "../application/find-user-by-email.use-case";
import { RequestAccountDeletionUseCase } from "../application/request-account-deletion.use-case";
import { CancelAccountDeletionUseCase } from "../application/cancel-account-deletion.use-case";
import { GetAccountDeletionStatusUseCase } from "../application/get-account-deletion-status.use-case";
import { ExecuteScheduledAccountDeletionsUseCase } from "../application/execute-scheduled-account-deletions.use-case";
import { PrismaUserRepository } from "../adapters/prisma-user-repository";
import { PrismaSessionRepository } from "../adapters/prisma-session-repository";
import { PrismaAuthTokenRepository } from "../adapters/prisma-auth-token-repository";
import { PrismaWorkspaceProvisioner } from "../adapters/prisma-workspace-provisioner";
import { BcryptPasswordHasher } from "../adapters/bcrypt-password-hasher";
import { CryptoOpaqueTokenGenerator } from "../adapters/crypto-opaque-token-generator";
import { JoseAccessTokenSigner } from "../adapters/jose-access-token-signer";
import { ConsoleEmailProvider } from "../adapters/console-email-provider";
import { ResendEmailProvider } from "../adapters/resend-email-provider";
import type { EmailProvider } from "../ports/email-provider";
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

/**
 * Usa Resend de verdade quando EMAIL_PROVIDER_API_KEY está configurado;
 * cai para o log no console (desenvolvimento) caso contrário. Em
 * produção sem a chave configurada, avisa uma vez — ninguém recebe
 * e-mail de verificação/reset de senha nesse estado. Ver ADR-023.
 */
function buildEmailProvider(): EmailProvider {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (apiKey) {
    const fromAddress = process.env.EMAIL_FROM ?? "no-reply@fecho.app";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return new ResendEmailProvider(apiKey, fromAddress, appUrl);
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[identity] EMAIL_PROVIDER_API_KEY não configurado — e-mails de verificação/reset de senha " +
        "só aparecem no log do servidor, ninguém realmente os recebe (ver ADR-023).",
    );
  }

  return new ConsoleEmailProvider();
}

const emailProvider = buildEmailProvider();
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

export function createResendVerificationEmailUseCase(): ResendVerificationEmailUseCase {
  return new ResendVerificationEmailUseCase(
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

export function createRequestAccountDeletionUseCase(): RequestAccountDeletionUseCase {
  return new RequestAccountDeletionUseCase(userRepository, passwordHasher, sessionRepository, auditLogger);
}

export function createCancelAccountDeletionUseCase(): CancelAccountDeletionUseCase {
  return new CancelAccountDeletionUseCase(userRepository);
}

export function createGetAccountDeletionStatusUseCase(): GetAccountDeletionStatusUseCase {
  return new GetAccountDeletionStatusUseCase(userRepository);
}

export function createExecuteScheduledAccountDeletionsUseCase(): ExecuteScheduledAccountDeletionsUseCase {
  return new ExecuteScheduledAccountDeletionsUseCase(userRepository, auditLogger);
}
