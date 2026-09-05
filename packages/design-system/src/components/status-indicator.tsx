import { cn } from "../lib/cn";

export type StatusKind = "available" | "soft-hold" | "busy" | "priority";

export interface StatusIndicatorProps {
  status: StatusKind;
  /** Sobrescreve o rótulo padrão (ex.: "Você já tem um compromisso"). */
  label?: string;
  className?: string;
}

const STATUS_CONFIG: Record<StatusKind, { label: string; dotClass: string }> = {
  available: { label: "Disponível", dotClass: "bg-secondary" },
  "soft-hold": { label: "Parcialmente reservado", dotClass: "bg-warning-soft-hold" },
  busy: { label: "Ocupado", dotClass: "bg-danger-conflict" },
  priority: { label: "Prioridade", dotClass: "bg-primary" },
};

/**
 * Nunca depende só da cor (docs/DESIGN-SYSTEM.md §Componentes de status)
 * — sempre combina o ponto colorido com o rótulo em texto.
 */
export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm text-text-primary", className)}>
      <span aria-hidden className={cn("h-2.5 w-2.5 rounded-full", config.dotClass)} />
      {label ?? config.label}
    </span>
  );
}
