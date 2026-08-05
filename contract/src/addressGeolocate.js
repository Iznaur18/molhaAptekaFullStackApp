import { z } from "zod";

export const addressGeolocateBodySchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
});
