"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Input, Textarea } from "@fecho/design-system";

export interface CounterProposeValues {
  startAt: string;
  endAt: string;
  message?: string | undefined;
}

export interface CounterProposeDialogProps {
  open: boolean;
  onClose: () => void;
  /** Horário atualmente em discussão — usado para pré-preencher o formulário. */
  currentStart: Date;
  currentEnd: Date;
  onSubmit: (values: CounterProposeValues) => Promise<void>;
}

/** "YYYY-MM-DD" no fuso local — não usar toISOString() aqui, que converte para UTC. */
function toDateInputValue(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}

function toTimeInputValue(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year!, month! - 1, day!, hours, minutes);
}

export function CounterProposeDialog({
  open,
  onClose,
  currentStart,
  currentEnd,
  onSubmit,
}: CounterProposeDialogProps) {
  const [date, setDate] = useState(toDateInputValue(currentStart));
  const [startTime, setStartTime] = useState(toTimeInputValue(currentStart));
  const [endTime, setEndTime] = useState(toTimeInputValue(currentEnd));
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(toDateInputValue(currentStart));
    setStartTime(toTimeInputValue(currentStart));
    setEndTime(toTimeInputValue(currentEnd));
    setMessage("");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const startAt = combineDateAndTime(date, startTime);
    const endAt = combineDateAndTime(date, endTime);
    if (endAt <= startAt) {
      setError("O horário de término deve ser depois do início.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        message: message.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível propor um novo horário.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Propor novo horário">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Data" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Início"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="Fim"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <Textarea
          label="Mensagem (opcional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Propor novo horário"}
        </Button>
      </form>
    </Dialog>
  );
}
