"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Textarea } from "@fecho/design-system";

export interface DeclineDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (message?: string) => Promise<void>;
}

export function DeclineDialog({ open, onClose, onConfirm }: DeclineDialogProps) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(message.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível negar a solicitação.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Negar solicitação">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Textarea
          label="Mensagem (opcional)"
          placeholder="Explique por que não vai dar, se quiser."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" variant="danger" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Negando..." : "Negar"}
        </Button>
      </form>
    </Dialog>
  );
}
