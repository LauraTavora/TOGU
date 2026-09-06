"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@fecho/design-system";
import type { ComponentType, SVGProps } from "react";
import { CalendarIcon, CompassIcon, HomeIcon, InboxIcon, PlusIcon } from "./icons";

interface MobileNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isAction?: boolean;
}

const MOBILE_ITEMS: MobileNavItem[] = [
  { href: "/hoje", label: "Hoje", icon: HomeIcon },
  { href: "/calendario", label: "Agenda", icon: CalendarIcon },
  { href: "/calendario", label: "Novo", icon: PlusIcon, isAction: true },
  { href: "/solicitacoes", label: "Pedidos", icon: InboxIcon },
  { href: "/explorar", label: "Explorar", icon: CompassIcon },
];

/** Navegação inferior mobile (docs/PRODUCT.md §45/§47). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-10 flex items-stretch justify-around border-t border-border bg-surface md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {MOBILE_ITEMS.map((item, index) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={`${item.href}-${index}`}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-text-secondary",
            )}
          >
            <Icon
              className={cn("h-5 w-5", item.isAction && "rounded-full bg-primary p-1 text-white")}
              aria-hidden
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
