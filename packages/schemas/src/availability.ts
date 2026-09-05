import { z } from "zod";

export const checkAvailabilityRequestSchema = z.object({
  participantIds: z.array(z.string().min(1)).min(1).max(50),
  start: z.string().datetime(),
  end: z.string().datetime(),
  bufferMinutes: z.number().int().min(0).max(180).optional(),
});

export type CheckAvailabilityRequest = z.infer<typeof checkAvailabilityRequestSchema>;
