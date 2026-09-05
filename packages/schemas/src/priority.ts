import { z } from "zod";

export const priorityTargetTypeSchema = z.enum(["PERSON", "CIRCLE", "PLACE", "EVENT_TYPE"]);
export const priorityLevelSchema = z.enum(["LOW", "NORMAL", "HIGH", "MAXIMUM"]);

export const setPriorityRuleSchema = z.object({
  targetType: priorityTargetTypeSchema,
  targetId: z.string().min(1),
  level: priorityLevelSchema,
});
export type SetPriorityRuleBody = z.infer<typeof setPriorityRuleSchema>;
