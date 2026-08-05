import { z } from "zod";

export const putOneCSettingsBodySchema = z
  .object({
    enabled: z.boolean().optional(),
    baseUrl: z.string().max(500).optional(),
    apiKey: z.string().max(512).optional().nullable(),
    clearApiKey: z.boolean().optional(),
  })
  .strict();

export const getOneCLogsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();
