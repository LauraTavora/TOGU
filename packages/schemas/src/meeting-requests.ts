import { z } from "zod";
import { meetingKindSchema } from "./scheduling";

export const createMeetingRequestSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().max(2000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  meetingKind: meetingKindSchema.optional(),
  location: z.string().max(300).optional(),
  onlineLink: z.string().url().optional(),
  participantUserIds: z.array(z.string().min(1)).min(1).max(20),
});
export type CreateMeetingRequestBody = z.infer<typeof createMeetingRequestSchema>;

export const declineMeetingRequestSchema = z.object({
  message: z.string().max(2000).optional(),
});
export type DeclineMeetingRequestBody = z.infer<typeof declineMeetingRequestSchema>;

export const counterProposeSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  message: z.string().max(2000).optional(),
});
export type CounterProposeBody = z.infer<typeof counterProposeSchema>;

export const meetingRequestStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "COUNTER_PROPOSED",
  "CANCELLED",
  "EXPIRED",
]);

export const listMeetingRequestsQuerySchema = z.object({
  box: z.enum(["received", "sent"]),
  status: meetingRequestStatusSchema.optional(),
});
export type ListMeetingRequestsQuery = z.infer<typeof listMeetingRequestsQuerySchema>;
