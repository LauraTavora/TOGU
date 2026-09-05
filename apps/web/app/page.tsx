"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/client/auth/auth-provider";

export default function RootPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/hoje");
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-text-secondary">Carregando…</p>
    </main>
  );
}
