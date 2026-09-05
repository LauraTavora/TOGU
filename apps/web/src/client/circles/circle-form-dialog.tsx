"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Input } from "@togu/design-system";
import type { CircleDto } from "./types";

export interface CircleFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Presente = renomeando um círculo existente; ausente = criando um novo. */
  circle: CircleDto | null;
  onSubmit: (name: string) => Promise<void>;
}

export function CircleFormDialog({ open, onClose, circle, onSubmit }: CircleFormDialogProps) {
  const [name, setName] = useState(circle?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(circle?.name ?? "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, circle?.id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSubmit(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o círculo.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={circle ? "Renomear círculo" : "Novo círculo"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nome"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Dialog>
  );
}
