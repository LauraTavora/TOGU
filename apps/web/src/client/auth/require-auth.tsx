"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@togu/design-system";
import { useAuth } from "./auth-provider";

/** Envolve páginas privadas: redireciona para /login se não autenticado. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}

/** Envolve páginas públicas de auth: já logado vai direto para /hoje. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/hoje");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}
