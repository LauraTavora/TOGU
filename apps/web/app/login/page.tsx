"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@togu/design-system";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { GuestOnly } from "@/client/auth/require-auth";
import { AuthLayout } from "@/client/auth/auth-layout";

export default function LoginPage() {
  const { login, authApi } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResent(false);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.replace("/hoje");
    } catch (err) {
      if (err instanceof ApiError && err.code === "email_not_verified") {
        setNeedsVerification(true);
      }
      setError(
        err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setIsResending(true);
    try {
      await authApi.resendVerification(email);
    } finally {
      setIsResending(false);
      setResent(true);
    }
  }

  return (
    <GuestOnly>
      <AuthLayout>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Entrar</h2>

          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-sm text-danger-conflict">
              {error}
            </p>
          )}

          {needsVerification && (
            <div className="flex flex-col gap-2 rounded-card bg-surface-hover p-3">
              {resent ? (
                <p className="text-sm text-text-secondary">
                  Se a conta existir e ainda não estiver verificada, reenviamos o e-mail.
                </p>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResending || !email}
                >
                  {isResending ? "Reenviando..." : "Reenviar e-mail de verificação"}
                </Button>
              )}
            </div>
          )}

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/esqueci-a-senha" className="text-text-secondary hover:text-primary">
              Esqueci minha senha
            </Link>
            <Link href="/cadastro" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </div>
        </form>
      </AuthLayout>
    </GuestOnly>
  );
}
