import { z } from "zod";

export const SELLER_PERSONAL_CATEGORY_LABEL_MAX_LENGTH = 80;

export const SELLER_PERSONAL_CATEGORY_DURATION_CODES = ["24h", "7d", "30d"];

export const submitSellerPersonalCategoryCampaignBodySchema = z.object({
  labelRu: z
    .string()
    .trim()
    .min(1, "Укажите название категории")
    .max(SELLER_PERSONAL_CATEGORY_LABEL_MAX_LENGTH),
  imageUrl: z.string().trim().min(1, "Загрузите картинку категории").max(2048),
  tariffCode: z.enum(SELLER_PERSONAL_CATEGORY_DURATION_CODES),
});

export const rejectSellerPersonalCategoryCampaignBodySchema = z.object({
  reason: z.string().trim().max(500).optional().nullable(),
});

export const sellerPersonalCategoryCampaignIdParamsSchema = z.object({
  campaignId: z.string().trim().min(1),
});

export const sellerPersonalCategoryDurationSchema = z.object({
  code: z.string(),
  title: z.string(),
  durationHours: z.number().int(),
  pricePoints: z.number().int(),
});

export const sellerPersonalCategoryCampaignSchema = z.object({
  _id: z.string(),
  sellerId: z.string(),
  personalCategoryId: z.string().nullable().optional(),
  status: z.string(),
  labelRu: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  tariffCode: z.string().nullable().optional(),
  durationHours: z.number().nullable().optional(),
  amountPoints: z.number().nullable().optional(),
  pointsReservedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pointsChargedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pointsReleasedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  approvedByUserId: z.string().nullable().optional(),
  rejectedReason: z.string().nullable().optional(),
  activatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  activeUntil: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  reminderSentAt1Day: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  reminderSentAt1Hour: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  cancelledAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  cancelledByUserId: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const sellerPersonalCategoryTileSchema = z.object({
  _id: z.string(),
  sellerId: z.string(),
  labelRu: z.string(),
  imageUrl: z.string().nullable().optional(),
  activeUntil: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const sellerPersonalCategoryConfigDataSchema = z.object({
  durations: z.array(sellerPersonalCategoryDurationSchema),
});

export const sellerPersonalCategoryCatalogTilesDataSchema = z.object({
  tiles: z.array(sellerPersonalCategoryTileSchema),
});

export const mySellerPersonalCategoryCampaignDataSchema = z.object({
  campaign: sellerPersonalCategoryCampaignSchema.nullable(),
  durations: z.array(sellerPersonalCategoryDurationSchema),
});

export const pendingSellerPersonalCategoryCampaignsDataSchema = z.object({
  campaigns: z.array(
    sellerPersonalCategoryCampaignSchema.extend({
      seller: z.record(z.unknown()).nullable().optional(),
    }),
  ),
});

export const pendingSellerPersonalCategoryCampaignsCountDataSchema = z.object({
  count: z.number().int(),
});

export const submitSellerPersonalCategoryCampaignDataSchema = z.object({
  message: z.string(),
  campaign: sellerPersonalCategoryCampaignSchema,
  loyaltyPointsBalance: z.number().nullable().optional(),
});

export const cancelSellerPersonalCategoryCampaignDataSchema = z.object({
  message: z.string(),
});

export const approveSellerPersonalCategoryCampaignDataSchema = z.object({
  message: z.string(),
  campaign: sellerPersonalCategoryCampaignSchema,
});

export const rejectSellerPersonalCategoryCampaignDataSchema = z.object({
  message: z.string(),
});

export const managedSellerPersonalCategoryCampaignsDataSchema = z.object({
  campaigns: z.array(
    sellerPersonalCategoryCampaignSchema.extend({
      seller: z.record(z.unknown()).nullable().optional(),
    }),
  ),
});

export const staffSellerPersonalCategoryCampaignActionDataSchema = z.object({
  message: z.string(),
});
