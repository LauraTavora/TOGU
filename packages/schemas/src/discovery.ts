import { z } from "zod";

export const eventCategorySchema = z.enum([
  "MUSICA",
  "GASTRONOMIA",
  "IGREJA",
  "ESPORTES",
  "TEATRO",
  "CINEMA",
  "CULTURA",
  "NETWORKING",
  "TECNOLOGIA",
  "FEIRAS",
  "FESTAS",
  "FAMILIA",
  "OUTDOOR",
]);

export const searchNearbyEventsQuerySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(500),
  from: z.string().datetime(),
  to: z.string().datetime(),
  category: eventCategorySchema.optional(),
  onlyFree: z.enum(["true", "false"]).optional(),
});
export type SearchNearbyEventsQuery = z.infer<typeof searchNearbyEventsQuerySchema>;

export const syncNearbyEventsSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
export type SyncNearbyEventsBody = z.infer<typeof syncNearbyEventsSchema>;
