import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-hover text-text-secondary",
  primary: "bg-primary/10 text-primary",
  success: "bg-secondary/10 text-secondary",
  warning: "bg-warning-soft-hold/15 text-warning-soft-hold",
  danger: "bg-danger-conflict/10 text-danger-conflict",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
