"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState, Skeleton, StatusIndicator } from "@togu/design-system";
import { ApiError } from "@togu/sdk";
import { useAuth } from "@/client/auth/auth-provider";
import { toStatusKind } from "@/client/scheduling/status";
import type { CalendarEventDto } from "@/client/scheduling/types";
import type { MeetingRequestDto } from "@/client/meeting-requests/types";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function HojePage() {
  const { http } = useAuth();
  const [events, setEvents] = useState<CalendarEventDto[] | null>(null);
  const [pendingRequests, setPendingRequests] = useState<MeetingRequestDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const start = startOfToday();
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        const query = new URLSearchParams({ start: start.toISOString(), end: end.toISOString() });

        const [calendarResult, requestsResult] = await Promise.all([
          http.request<{ events: CalendarEventDto[] }>(`/api/v1/calendar?${query.toString()}`),
          http.request<{ meetingRequests: MeetingRequestDto[] }>(
            "/api/v1/meeting-requests?box=received&status=PENDING",
          ),
        ]);

        if (cancelled) return;
        setEvents(calendarResult.events);
        setPendingRequests(requestsResult.meetingRequests);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : "Não foi possível carregar sua agenda de hoje.",
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [http]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">Hoje</h1>
        <p className="text-sm text-text-secondary">
          {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(
            new Date(),
          )}
        </p>
      </header>

      {error && (
        <Card className="border-danger-conflict/40">
          <p className="text-sm text-danger-conflict">{error}</p>
        </Card>
      )}

      <Link href="/solicitacoes" className="block">
        <Card className="flex items-center justify-between transition-colors hover:bg-surface-hover">
          <div>
            <p className="text-sm font-medium text-text-primary">Solicitações pendentes</p>
            <p className="text-xs text-text-secondary">Encontros que estão esperando sua resposta</p>
          </div>
          {pendingRequests === null ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <Badge tone={pendingRequests.length > 0 ? "primary" : "neutral"} className="text-sm">
              {pendingRequests.length}
            </Badge>
          )}
        </Card>
      </Link>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Compromissos de hoje
        </h2>

        {events === null && !error && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {events !== null && events.length === 0 && (
          <EmptyState
            title="Nada agendado para hoje"
            description="Aproveite para descansar ou marcar algo novo com quem você gosta."
            action={
              <Link href="/calendario" className="text-sm font-medium text-primary hover:underline">
                Ver calendário
              </Link>
            }
          />
        )}

        {events !== null &&
          events.map((event) => (
            <Card key={event.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{event.title}</p>
                <p className="text-xs text-text-secondary">
                  {timeFormatter.format(new Date(event.startAt))} –{" "}
                  {timeFormatter.format(new Date(event.endAt))}
                  {event.location && <> · {event.location}</>}
                </p>
              </div>
              <StatusIndicator status={toStatusKind(event.availabilityState)} />
            </Card>
          ))}
      </section>
    </div>
  );
}
