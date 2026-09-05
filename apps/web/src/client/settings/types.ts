export interface NotificationPreferencesDto {
  userId: string;
  inApp: boolean;
  push: boolean;
  email: boolean;
  webPush: boolean;
}

export type PriorityLevel = "LOW" | "NORMAL" | "HIGH" | "MAXIMUM";
export type PriorityTargetType = "PERSON" | "CIRCLE" | "PLACE" | "EVENT_TYPE";

export interface PriorityRuleDto {
  id: string;
  userId: string;
  targetType: PriorityTargetType;
  targetId: string;
  level: PriorityLevel;
}
