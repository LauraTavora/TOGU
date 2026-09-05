import { z } from "zod";

export const availabilityStateSchema = z.enum([
  "AVAILABLE",
  "SOFT_HOLD",
  "BUSY",
  "PRIVATE_BUSY",
]);

export const privacyLevelSchema = z.enum([
  "PRIVATE",
  "BUSY_ONLY",
  "CIRCLE",
  "PARTICIPANTS",
  "PUBLIC",
]);

export const meetingKindSchema = z.enum(["IN_PERSON", "ONLINE", "HYBRID"]);

export const createEventRequestSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  availabilityState: availabilityStateSchema.optional(),
  privacyLevel: privacyLevelSchema.optional(),
  meetingKind: meetingKindSchema.optional(),
  location: z.string().max(300).optional(),
  onlineLink: z.string().url().optional(),
  bufferBeforeMin: z.number().int().min(0).max(180).optional(),
  bufferAfterMin: z.number().int().min(0).max(180).optional(),
  participantUserIds: z.array(z.string().min(1)).max(50).optional(),
});
export type CreateEventRequest = z.infer<typeof createEventRequestSchema>;

export const updateEventRequestSchema = createEventRequestSchema.partial();
export type UpdateEventRequest = z.infer<typeof updateEventRequestSchema>;

export const listCalendarQuerySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});
export type ListCalendarQuery = z.infer<typeof listCalendarQuerySchema>;
