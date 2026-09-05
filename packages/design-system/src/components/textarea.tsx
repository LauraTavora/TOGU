import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string | undefined;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, id, rows = 3, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-describedby={hintId}
        className={cn(
          "rounded-card border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          className,
        )}
        {...props}
      />
      {hint && (
        <span id={hintId} className="text-xs text-text-secondary">
          {hint}
        </span>
      )}
    </div>
  );
});
