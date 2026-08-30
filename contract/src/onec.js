import { z } from "zod";

/** Каналы обмена: `pull` — сайт ходит в 1С, `commerceml` — 1С ходит на сайт. */
export const ONEC_CHANNEL_VALUES = ["pull", "commerceml"];

export const putOneCSettingsBodySchema = z
  .object({
    enabled: z.boolean().optional(),
    channel: z.enum(ONEC_CHANNEL_VALUES).optional(),
    baseUrl: z.string().max(500).optional(),
    apiKey: z.string().max(512).optional().nullable(),
    clearApiKey: z.boolean().optional(),
    /** Ид типов цен CommerceML, разрешённых к показу на витрине. */
    priceTypeIds: z.array(z.string().max(128)).max(50).optional(),
    /** Ид складов, чьи остатки суммируются. */
    warehouseIds: z.array(z.string().max(128)).max(100).optional(),
  })
  .strict();

export const getOneCLogsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .strict();

export const putOneCCategoryMappingsBodySchema = z
  .object({
    items: z
      .array(
        z
          .object({
            externalId: z.string().min(1).max(128),
            /** `null` — снять сопоставление, товары уйдут с витрины. */
            categoryId: z.string().max(64).nullable(),
          })
          .strict(),
      )
      .min(1)
      .max(500),
  })
  .strict();

export const getOneCImportJobsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();
