"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "@togu/design-system";
import { useAuth } from "@/client/auth/auth-provider";
import { RequireAuth } from "@/client/auth/require-auth";

function HojeContent() {
  const { userId, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Hoje</h1>
          <p className="text-sm text-text-secondary">Bem-vindo(a) de volta.</p>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Sair
        </Button>
      </header>

      <Card>
        <p className="text-sm text-text-secondary">
          Usuário autenticado: <span className="font-mono text-text-primary">{userId}</span>
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          O calendário, as solicitações e as sugestões do dia chegam nas próximas entregas.
        </p>
      </Card>
    </main>
  );
}

export default function HojePage() {
  return (
    <RequireAuth>
      <HojeContent />
    </RequireAuth>
  );
}
