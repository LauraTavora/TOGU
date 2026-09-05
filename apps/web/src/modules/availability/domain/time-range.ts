export interface TimeRange {
  start: Date;
  end: Date;
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.start < b.end && b.start < a.end;
}

export function expand(range: TimeRange, bufferMinutes: number): TimeRange {
  const bufferMs = bufferMinutes * 60_000;
  return {
    start: new Date(range.start.getTime() - bufferMs),
    end: new Date(range.end.getTime() + bufferMs),
  };
}
