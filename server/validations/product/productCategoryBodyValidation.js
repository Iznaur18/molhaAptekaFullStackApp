import { body } from "express-validator";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";

export const productCategoryIdBodyValidation = body("productCategoryId")
  .optional()
  .isMongoId()
  .withMessage("productCategoryId должен быть валидным ObjectId");

export const productCategoryLegacyBodyValidation = body("productCategory")
  .optional()
  .isIn(PRODUCT_CATEGORY_VALUES)
  .withMessage("Указана неизвестная категория товара")
  .trim();

/** POST: нужен productCategoryId или productCategory (legacy). */
export const requireProductCategoryIdOrLegacyValidation = body().custom(
  (_, { req }) => {
    const hasId =
      req.body?.productCategoryId != null &&
      String(req.body.productCategoryId).trim() !== "";
    const hasLegacy =
      req.body?.productCategory != null &&
      String(req.body.productCategory).trim() !== "";

    if (!hasId && !hasLegacy) {
      throw new Error("Укажите productCategoryId (лист дерева) или productCategory");
    }

    return true;
  },
);
