"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@togu/design-system";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
      <div className="mb-6 px-2 text-lg font-semibold text-text-primary">TOGU</div>
      <nav className="flex flex-col gap-1" aria-label="Navegação principal">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
