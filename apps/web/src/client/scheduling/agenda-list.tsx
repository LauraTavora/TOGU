import { Card, EmptyState, StatusIndicator } from "@fecho/design-system";
import { formatDayHeader, isSameDay } from "./date-utils";
import { toStatusKind } from "./status";
import type { CalendarEventDto } from "./types";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export interface AgendaListProps {
  events: CalendarEventDto[];
  onEventClick: (event: CalendarEventDto) => void;
}

export function AgendaList({ events, onEventClick }: AgendaListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="Nada por aqui"
        description="Nenhum compromisso nos próximos dias. Use o botão “Novo” para marcar algo."
      />
    );
  }

  const sorted = [...events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const groups: { day: Date; items: CalendarEventDto[] }[] = [];
  for (const event of sorted) {
    const start = new Date(event.startAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && isSameDay(lastGroup.day, start)) {
      lastGroup.items.push(event);
    } else {
      groups.push({ day: start, items: [event] });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.day.toISOString()} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold capitalize text-text-secondary">
            {formatDayHeader(group.day)}
          </h3>
          <div className="flex flex-col gap-2">
            {group.items.map((event) => (
              <button key={event.id} type="button" onClick={() => onEventClick(event)} className="text-left">
                <Card className="flex items-center justify-between gap-4 transition-colors hover:bg-surface-hover">
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
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
