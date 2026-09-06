"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Dialog, Input, Textarea } from "@fecho/design-system";
import type { CalendarEventDto } from "./types";

export interface EventFormValues {
  title: string;
  startAt: string;
  endAt: string;
  location?: string | undefined;
  notes?: string | undefined;
}

export interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Presente = editando um evento existente; ausente = criando um novo. */
  event: CalendarEventDto | null;
  /** Usado só ao criar: pré-preenche data/horário a partir do slot clicado. */
  initialStart?: Date | undefined;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onDelete?: (() => Promise<void>) | undefined;
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

export function EventFormDialog({
  open,
  onClose,
  event,
  initialStart,
  onSubmit,
  onDelete,
}: EventFormDialogProps) {
  const referenceStart = event ? new Date(event.startAt) : (initialStart ?? new Date());
  const referenceEnd = event ? new Date(event.endAt) : new Date(referenceStart.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState(event?.title ?? "");
  const [date, setDate] = useState(toDateInputValue(referenceStart));
  const [startTime, setStartTime] = useState(toTimeInputValue(referenceStart));
  const [endTime, setEndTime] = useState(toTimeInputValue(referenceEnd));
  const [location, setLocation] = useState(event?.location ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = event ? new Date(event.startAt) : (initialStart ?? new Date());
    const end = event ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60 * 1000);
    setTitle(event?.title ?? "");
    setDate(toDateInputValue(start));
    setStartTime(toTimeInputValue(start));
    setEndTime(toTimeInputValue(end));
    setLocation(event?.location ?? "");
    setNotes(event?.notes ?? "");
    setError(null);
    setConfirmingDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id]);

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault();
    setError(null);

    const startAt = combineDateAndTime(date, startTime);
    const endAt = combineDateAndTime(date, endTime);
    if (endAt <= startAt) {
      setError("O horário de término deve ser depois do início.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        title,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o evento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setIsSaving(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir o evento.");
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={event ? "Editar compromisso" : "Novo compromisso"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Título" required value={title} onChange={(e) => setTitle(e.target.value)} />

        <Input
          label="Data"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

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

        <Input
          label="Local (opcional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Textarea
          label="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-conflict">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          {onDelete ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={isSaving}
            >
              {confirmingDelete ? "Confirmar exclusão" : "Excluir"}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
