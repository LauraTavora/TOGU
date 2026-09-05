export interface Circle {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: Date;
}

export interface CircleMember {
  id: string;
  circleId: string;
  userId: string;
  createdAt: Date;
}

export class InvalidCircleNameError extends Error {
  constructor() {
    super("Nome do círculo deve ter entre 1 e 100 caracteres.");
  }
}

export function assertValidCircleName(name: string): void {
  if (name.trim().length === 0 || name.length > 100) {
    throw new InvalidCircleNameError();
  }
}
