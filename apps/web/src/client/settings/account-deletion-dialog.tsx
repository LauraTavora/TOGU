"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Input } from "@togu/design-system";

export interface AccountDeletionDialogProps {
  open: boolean;
  onClose: () => void;
  gracePeriodDays: number;
  onConfirm: (password: string) => Promise<void>;
}

export function AccountDeletionDialog({ open, onClose, gracePeriodDays, onConfirm }: AccountDeletionDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível agendar a exclusão da conta.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Apagar minha conta">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          Sua conta fica agendada para exclusão em {gracePeriodDays} dias — você pode cancelar a
          qualquer momento antes disso nesta mesma tela. Todas as suas sessões serão encerradas
          agora; para cancelar, entre de novo com sua senha.
        </p>

        <Input
          label="Confirme sua senha"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" variant="danger" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Agendando..." : "Apagar minha conta"}
        </Button>
      </form>
    </Dialog>
  );
}
