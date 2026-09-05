import { z } from "zod";

export const createCircleRequestSchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateCircleRequest = z.infer<typeof createCircleRequestSchema>;

export const renameCircleRequestSchema = z.object({
  name: z.string().min(1).max(100),
});
export type RenameCircleRequest = z.infer<typeof renameCircleRequestSchema>;

export const addCircleMemberRequestSchema = z.object({
  userId: z.string().min(1),
});
export type AddCircleMemberRequest = z.infer<typeof addCircleMemberRequestSchema>;
