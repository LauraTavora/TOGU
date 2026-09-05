const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const UNITS: { limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { limit: 60, divisor: 1, unit: "second" },
  { limit: 3600, divisor: 60, unit: "minute" },
  { limit: 86400, divisor: 3600, unit: "hour" },
  { limit: 2592000, divisor: 86400, unit: "day" },
  { limit: 31536000, divisor: 2592000, unit: "month" },
];

export function formatRelativeTime(isoDate: string): string {
  const diffSeconds = (new Date(isoDate).getTime() - Date.now()) / 1000;
  const absDiff = Math.abs(diffSeconds);

  for (const { limit, divisor, unit } of UNITS) {
    if (absDiff < limit) {
      return rtf.format(Math.round(diffSeconds / divisor), unit);
    }
  }
  return rtf.format(Math.round(diffSeconds / 31536000), "year");
}
