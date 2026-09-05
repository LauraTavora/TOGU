import type { ComponentType, SVGProps } from "react";
import {
  BellIcon,
  CalendarIcon,
  CircleUsersIcon,
  CompassIcon,
  HomeIcon,
  InboxIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/** Itens da sidebar desktop (docs/PRODUCT.md §45). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/hoje", label: "Hoje", icon: HomeIcon },
  { href: "/calendario", label: "Calendário", icon: CalendarIcon },
  { href: "/solicitacoes", label: "Solicitações", icon: InboxIcon },
  { href: "/pessoas", label: "Pessoas", icon: UsersIcon },
  { href: "/circulos", label: "Círculos", icon: CircleUsersIcon },
  { href: "/explorar", label: "Explorar", icon: CompassIcon },
  { href: "/notificacoes", label: "Notificações", icon: BellIcon },
  { href: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];
