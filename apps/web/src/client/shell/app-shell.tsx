import type { ReactNode } from "react";
import { RequireAuth } from "@/client/auth/require-auth";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="min-h-screen flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />
    </RequireAuth>
  );
}
