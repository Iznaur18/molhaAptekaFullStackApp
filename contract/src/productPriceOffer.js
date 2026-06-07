import { z } from "zod";

import { PRODUCT_PRICE_RUB_MAX } from "./productWrite.js";

export const productPriceOfferBodySchema = z.object({
  offerPrice: z.coerce
    .number()
    .int(`offerPrice — целое число от 1 до ${PRODUCT_PRICE_RUB_MAX}`)
    .min(1, `offerPrice — целое число от 1 до ${PRODUCT_PRICE_RUB_MAX}`)
    .max(PRODUCT_PRICE_RUB_MAX, `offerPrice — целое число от 1 до ${PRODUCT_PRICE_RUB_MAX}`),
});
