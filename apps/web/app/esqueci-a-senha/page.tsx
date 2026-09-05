"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button, Input } from "@togu/design-system";
import { useAuth } from "@/client/auth/auth-provider";
import { GuestOnly } from "@/client/auth/require-auth";
import { AuthLayout } from "@/client/auth/auth-layout";

export default function ForgotPasswordPage() {
  const { authApi } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset(email);
    } finally {
      // Sempre mostra a mesma mensagem, exista ou não a conta — anti-enumeration.
      setIsSubmitting(false);
      setSent(true);
    }
  }

  return (
    <GuestOnly>
      <AuthLayout>
        {sent ? (
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-lg font-semibold text-text-primary">Verifique seu e-mail</h2>
            <p className="text-sm text-text-secondary">
              Se houver uma conta com o e-mail <strong>{email}</strong>, enviamos instruções para
              redefinir a senha.
            </p>
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-text-primary">Esqueci minha senha</h2>
            <p className="text-sm text-text-secondary">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar instruções"}
            </Button>
            <Link href="/login" className="text-center text-sm text-text-secondary hover:text-primary">
              Voltar para o login
            </Link>
          </form>
        )}
      </AuthLayout>
    </GuestOnly>
  );
}
