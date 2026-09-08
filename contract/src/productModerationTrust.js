import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

/** Params `PATCH /staff/sellers/:userId/product-moderation-trust`. */
export const productModerationTrustParamsSchema = z.object({
  userId: mongoIdSchema,
});

/** Body того же роута: включить или снять публикацию товаров без проверки. */
export const productModerationTrustBodySchema = z.object({
  trusted: z.boolean({
    required_error: "Укажите, доверять продавцу публикацию без проверки",
    invalid_type_error: "Значение доверия должно быть логическим",
  }),
});
