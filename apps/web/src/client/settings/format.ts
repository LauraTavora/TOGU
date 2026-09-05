import type { PriorityLevel, PriorityTargetType } from "./types";

export const PRIORITY_LEVEL_LABEL: Record<PriorityLevel, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  MAXIMUM: "Máxima",
};

export const PRIORITY_TARGET_TYPE_LABEL: Record<PriorityTargetType, string> = {
  PERSON: "Pessoa",
  CIRCLE: "Círculo",
  PLACE: "Local",
  EVENT_TYPE: "Tipo de evento",
};
