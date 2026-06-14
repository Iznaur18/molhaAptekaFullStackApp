import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

export const productIdParamsSchema = z.object({
  productId: mongoIdSchema,
});

export const userIdClientParamsSchema = z.object({
  userIdClient: mongoIdSchema,
});

export const voteTargetIdParamsSchema = z.object({
  userVoteTargetIdClient: mongoIdSchema,
});

export const storyIdParamsSchema = z.object({
  storyId: mongoIdSchema,
});

export const raffleIdParamsSchema = z.object({
  raffleId: mongoIdSchema,
});

export const promotionIdParamsSchema = z.object({
  promotionId: mongoIdSchema,
});

export const reviewIdParamsSchema = z.object({
  reviewId: mongoIdSchema,
});

export const offerIdParamsSchema = z.object({
  offerId: mongoIdSchema,
});
