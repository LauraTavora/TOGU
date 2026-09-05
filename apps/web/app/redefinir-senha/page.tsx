"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@togu/design-system";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { AuthLayout } from "@/client/auth/auth-layout";

export default function ResetPasswordPage() {
  const { authApi } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Link de redefinição inválido — falta o token.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset({ token, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível redefinir sua senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-lg font-semibold text-text-primary">Senha redefinida!</h2>
          <p className="text-sm text-text-secondary">
            Sua senha foi alterada e todas as sessões antigas foram encerradas.
          </p>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">Redefinir senha</h2>
        <p className="text-sm text-text-secondary">Escolha uma nova senha para sua conta.</p>

        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="Mínimo de 8 caracteres, com maiúscula, minúscula e número."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
        </Button>

        <Link href="/login" className="text-center text-sm text-text-secondary hover:text-primary">
          Voltar para o login
        </Link>
      </form>
    </AuthLayout>
  );
}
