import type { ReactNode } from "react";
import { Card } from "@fecho/design-system";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-text-primary">Fechô</h1>
          <p className="mt-1 text-sm text-text-secondary">Seu tempo. Suas pessoas. Juntos.</p>
        </div>
        <Card>{children}</Card>
      </div>
    </main>
  );
}
