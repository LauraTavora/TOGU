"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Skeleton, cn } from "@fecho/design-system";
import { ApiError } from "@fecho/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { AgendaList } from "@/client/scheduling/agenda-list";
import { WeekGrid } from "@/client/scheduling/week-grid";
import { EventFormDialog, type EventFormValues } from "@/client/scheduling/event-form-dialog";
import { addDays, formatMonthLabel, startOfDay, startOfWeek } from "@/client/scheduling/date-utils";
import type { CalendarEventDto } from "@/client/scheduling/types";

type ViewMode = "agenda" | "week";

interface DialogState {
  open: boolean;
  event: CalendarEventDto | null;
  initialStart?: Date | undefined;
}

export default function CalendarioPage() {
  const { http } = useAuth();
  const [view, setView] = useState<ViewMode>("week");
  const [referenceDate, setReferenceDate] = useState(() => startOfDay(new Date()));
  const [events, setEvents] = useState<CalendarEventDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ open: false, event: null });

  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(referenceDate);
      return { start, end: addDays(start, 7) };
    }
    const start = startOfDay(referenceDate);
    return { start, end: addDays(start, 14) };
  }, [view, referenceDate]);

  const loadEvents = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });
      const result = await http.request<{ events: CalendarEventDto[] }>(`/api/v1/calendar?${query.toString()}`);
      setEvents(result.events);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar o calendário.");
    }
  }, [http, range.start, range.end]);

  useEffect(() => {
    setEvents(null);
    loadEvents();
  }, [loadEvents]);

  function goToPrevious() {
    setReferenceDate((current) => addDays(current, view === "week" ? -7 : -14));
  }

  function goToNext() {
    setReferenceDate((current) => addDays(current, view === "week" ? 7 : 14));
  }

  function goToToday() {
    setReferenceDate(startOfDay(new Date()));
  }

  function openCreateDialog(initialStart?: Date) {
    setDialog({ open: true, event: null, initialStart });
  }

  function openEditDialog(event: CalendarEventDto) {
    setDialog({ open: true, event });
  }

  function closeDialog() {
    setDialog({ open: false, event: null });
  }

  async function handleSubmit(values: EventFormValues) {
    if (dialog.event) {
      await http.request(`/api/v1/events/${dialog.event.id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    } else {
      await http.request("/api/v1/events", {
        method: "POST",
        body: JSON.stringify(values),
      });
    }
    closeDialog();
    await loadEvents();
  }

  async function handleDelete() {
    if (!dialog.event) return;
    await http.request(`/api/v1/events/${dialog.event.id}`, { method: "DELETE" });
    closeDialog();
    await loadEvents();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Calendário</h1>
          <p className="text-sm capitalize text-text-secondary">{formatMonthLabel(referenceDate)}</p>
        </div>
        <Button onClick={() => openCreateDialog()}>Novo</Button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-pill border border-border bg-surface p-1">
          {(["agenda", "week"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                "rounded-pill px-3 py-1.5 text-sm font-medium transition-colors",
                view === mode ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary",
              )}
            >
              {mode === "agenda" ? "Agenda" : "Semana"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={goToPrevious} aria-label="Período anterior">
            ←
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="ghost" size="sm" onClick={goToNext} aria-label="Próximo período">
            →
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-danger-conflict">{error}</p>}

      {events === null && !error && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {events !== null && view === "agenda" && <AgendaList events={events} onEventClick={openEditDialog} />}

      {events !== null && view === "week" && (
        <WeekGrid
          weekStart={range.start}
          events={events}
          onSlotClick={openCreateDialog}
          onEventClick={openEditDialog}
        />
      )}

      <EventFormDialog
        open={dialog.open}
        onClose={closeDialog}
        event={dialog.event}
        initialStart={dialog.initialStart}
        onSubmit={handleSubmit}
        onDelete={dialog.event ? handleDelete : undefined}
      />
    </div>
  );
}
