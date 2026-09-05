"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { AuthLayout } from "@/client/auth/auth-layout";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const { authApi } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Link de verificação inválido — falta o token.");
      return;
    }

    let cancelled = false;
    authApi
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Não foi possível verificar seu e-mail.");
      });

    return () => {
      cancelled = true;
    };
  }, [token, authApi]);

  return (
    <AuthLayout>
      <div className="flex flex-col gap-3 text-center">
        {status === "verifying" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary">Verificando seu e-mail...</h2>
            <p className="text-sm text-text-secondary">Só um instante.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary">E-mail verificado!</h2>
            <p className="text-sm text-text-secondary">Sua conta está pronta. Você já pode entrar.</p>
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Ir para o login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-lg font-semibold text-text-primary">Não foi possível verificar</h2>
            <p role="alert" className="text-sm text-danger-conflict">
              {error}
            </p>
            <Link href="/login" className="text-sm font-medium text-primary hover:underline">
              Voltar para o login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
