export type PriorityLevel = "LOW" | "NORMAL" | "HIGH" | "MAXIMUM";

/** Peso numérico de cada nível — usado pelo PriorityEngine para gerar o score. */
export const LEVEL_WEIGHT: Record<PriorityLevel, number> = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  MAXIMUM: 3,
};
