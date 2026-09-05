export class InvalidEventTimeRangeError extends Error {
  constructor() {
    super("O horário de término deve ser posterior ao horário de início.");
  }
}

export function assertValidEventTimeRange(startAt: Date, endAt: Date): void {
  if (endAt <= startAt) {
    throw new InvalidEventTimeRangeError();
  }
}
