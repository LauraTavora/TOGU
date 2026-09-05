export class InvalidTimeRangeError extends Error {
  constructor() {
    super("O horário de término deve ser posterior ao horário de início.");
  }
}

export function assertValidTimeRange(startAt: Date, endAt: Date): void {
  if (endAt <= startAt) {
    throw new InvalidTimeRangeError();
  }
}
