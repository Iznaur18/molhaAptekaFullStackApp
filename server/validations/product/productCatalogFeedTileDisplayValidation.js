import { body, param } from "express-validator";

import { CATALOG_FEED_TILE_KEY_VALUES } from "../../constants/catalogFeedTileConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

export const catalogFeedTileKeyParamValidation = [
  param("tileKey")
    .isString()
    .withMessage("tileKey обязателен")
    .trim()
    .notEmpty()
    .withMessage("tileKey обязателен")
    .custom((value) => CATALOG_FEED_TILE_KEY_VALUES.includes(String(value)))
    .withMessage("Неизвестная подборка"),
  handleValidationByExpressErrors,
];

export const patchProductCatalogFeedTileDisplayValidation = [
  body("customLabel")
    .optional({ nullable: true })
    .isString()
    .withMessage("customLabel должен быть строкой")
    .isLength({ max: 120 })
    .withMessage("customLabel слишком длинный"),
  body("imageUrl")
    .optional({ nullable: true })
    .isString()
    .withMessage("imageUrl должен быть строкой")
    .isLength({ max: 2048 })
    .withMessage("imageUrl слишком длинный"),
  body("resetCustomLabel")
    .optional()
    .isBoolean()
    .withMessage("resetCustomLabel должен быть boolean"),
  body("resetImageUrl")
    .optional()
    .isBoolean()
    .withMessage("resetImageUrl должен быть boolean"),
  handleValidationByExpressErrors,
];
