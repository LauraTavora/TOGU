"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@fecho/design-system";
import { ApiError } from "@fecho/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { GuestOnly } from "@/client/auth/require-auth";
import { AuthLayout } from "@/client/auth/auth-layout";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(email, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível criar sua conta. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (done) {
    return (
      <GuestOnly>
        <AuthLayout>
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-lg font-semibold text-text-primary">Quase lá!</h2>
            <p className="text-sm text-text-secondary">
              Enviamos um e-mail de confirmação para <strong>{email}</strong>. Verifique sua
              caixa de entrada para ativar a conta.
            </p>
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Voltar para o login
            </Link>
          </div>
        </AuthLayout>
      </GuestOnly>
    );
  }

  return (
    <GuestOnly>
      <AuthLayout>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Criar conta</h2>

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
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </AuthLayout>
    </GuestOnly>
  );
}
