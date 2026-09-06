import { cn } from "@fecho/design-system";
import { addDays, fractionOfDay, formatDayLabel, isSameDay, HOURS } from "./date-utils";
import type { AvailabilityState, CalendarEventDto } from "./types";

const HOUR_HEIGHT_PX = 48;
const GRID_HEIGHT_PX = HOURS.length * HOUR_HEIGHT_PX;

const hourLabelFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit" });

const BLOCK_CLASSES: Record<AvailabilityState, string> = {
  BUSY: "border-l-4 border-primary bg-primary/10 text-primary",
  PRIVATE_BUSY: "border-l-4 border-primary bg-primary/10 text-primary",
  SOFT_HOLD: "border-l-4 border-warning-soft-hold bg-warning-soft-hold/15 text-text-primary",
  AVAILABLE: "border-l-4 border-secondary bg-secondary/10 text-secondary",
};

export interface WeekGridProps {
  weekStart: Date;
  events: CalendarEventDto[];
  onSlotClick: (start: Date) => void;
  onEventClick: (event: CalendarEventDto) => void;
}

export function WeekGrid({ weekStart, events, onSlotClick, onEventClick }: WeekGridProps) {
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const today = new Date();

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-[56px_repeat(7,1fr)]">
        <div />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-b border-border pb-2 text-center text-xs font-medium capitalize",
              isSameDay(day, today) ? "text-primary" : "text-text-secondary",
            )}
          >
            {formatDayLabel(day)}
          </div>
        ))}

        <div className="relative" style={{ height: GRID_HEIGHT_PX }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute inset-x-0 -translate-y-2 text-right text-[10px] text-text-secondary"
              style={{ top: hour * HOUR_HEIGHT_PX }}
            >
              {hourLabelFormatter.format(new Date(2000, 0, 1, hour))}
            </div>
          ))}
        </div>

        {days.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.startAt), day));
          return (
            <div key={day.toISOString()} className="relative border-l border-border" style={{ height: GRID_HEIGHT_PX }}>
              {HOURS.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  aria-label={`Criar compromisso às ${hour}h`}
                  onClick={() => onSlotClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour))}
                  className="absolute inset-x-0 border-t border-border/60 hover:bg-surface-hover"
                  style={{ top: hour * HOUR_HEIGHT_PX, height: HOUR_HEIGHT_PX }}
                />
              ))}

              {dayEvents.map((event) => {
                const start = new Date(event.startAt);
                const end = new Date(event.endAt);
                const top = fractionOfDay(start) * GRID_HEIGHT_PX;
                const height = Math.max((fractionOfDay(end) - fractionOfDay(start)) * GRID_HEIGHT_PX, 22);

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      onEventClick(event);
                    }}
                    className={cn(
                      "absolute inset-x-1 z-10 overflow-hidden rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight shadow-subtle",
                      BLOCK_CLASSES[event.availabilityState],
                    )}
                    style={{ top, height }}
                  >
                    {event.title}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
