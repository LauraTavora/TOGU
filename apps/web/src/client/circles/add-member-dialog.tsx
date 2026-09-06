"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Input } from "@fecho/design-system";

export interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  /** Resolve o e-mail digitado para um id de usuário e adiciona ao círculo. */
  onAdd: (email: string) => Promise<void>;
}

export function AddMemberDialog({ open, onClose, onAdd }: AddMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onAdd(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar essa pessoa.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Adicionar membro">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          required
          hint="A pessoa precisa já ter uma conta no Fechô."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Adicionando..." : "Adicionar"}
        </Button>
      </form>
    </Dialog>
  );
}
