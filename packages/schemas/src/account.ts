import { z } from "zod";

export const requestAccountDeletionSchema = z.object({
  password: z.string().min(1),
});
export type RequestAccountDeletionBody = z.infer<typeof requestAccountDeletionSchema>;
