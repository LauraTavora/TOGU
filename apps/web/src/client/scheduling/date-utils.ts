export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Domingo como primeiro dia da semana. */
export function startOfWeek(date: Date): Date {
  const start = startOfDay(date);
  return addDays(start, -start.getDay());
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Fração do dia (0–1) que um instante representa — usada para posicionar eventos na grade. */
export function fractionOfDay(date: Date): number {
  return (date.getHours() * 60 + date.getMinutes()) / (24 * 60);
}

export const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

const dayLabelFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit" });
const monthLabelFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const dayHeaderFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export function formatDayLabel(date: Date): string {
  return dayLabelFormatter.format(date);
}

export function formatMonthLabel(date: Date): string {
  return monthLabelFormatter.format(date);
}

export function formatDayHeader(date: Date): string {
  return dayHeaderFormatter.format(date);
}
