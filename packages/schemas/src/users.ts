import { z } from "zod";

export const listUsersByIdsQuerySchema = z.object({
  ids: z
    .string()
    .min(1)
    .transform((value) => value.split(",").filter(Boolean)),
});
export type ListUsersByIdsQuery = z.infer<typeof listUsersByIdsQuerySchema>;
