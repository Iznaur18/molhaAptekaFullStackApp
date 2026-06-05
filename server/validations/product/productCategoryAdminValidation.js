import { body, param } from "express-validator";

import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import {
  PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH,
  PRODUCT_CATEGORY_SLUG_MAX_LENGTH,
} from "../../constants/productCategoryTreeConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SLUG_INVALID_MESSAGE =
  "slug: только латиница a–z, цифры и дефис (например electronics-headphones)";

export const createProductCategoryAdminValidation = [
  body("slug")
    .isString()
    .trim()
    .isLength({ min: 2, max: PRODUCT_CATEGORY_SLUG_MAX_LENGTH })
    .withMessage("slug: от 2 до 80 символов")
    .matches(CATEGORY_SLUG_PATTERN)
    .withMessage(SLUG_INVALID_MESSAGE),
  body("labelRu")
    .isString()
    .trim()
    .isLength({ min: 1, max: PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH }),
  body("parentId").optional({ nullable: true }).isMongoId(),
  body("isLeaf").optional().isBoolean(),
  body("sortOrder").optional().isInt({ min: 0, max: 9999 }),
  body("legacyProductCategory")
    .optional({ nullable: true })
    .isIn(PRODUCT_CATEGORY_VALUES),
  body("searchKeywords").optional().isArray({ max: 30 }),
  body("searchKeywords.*").optional().isString().trim().isLength({ max: 40 }),
  handleValidationByExpressErrors,
];

export const patchProductCategoryAdminValidation = [
  body("slug")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: PRODUCT_CATEGORY_SLUG_MAX_LENGTH })
    .withMessage("slug: от 2 до 80 символов")
    .matches(CATEGORY_SLUG_PATTERN)
    .withMessage(SLUG_INVALID_MESSAGE),
  body("labelRu")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH }),
  body("parentId").optional({ nullable: true }).isMongoId(),
  body("isLeaf").optional().isBoolean(),
  body("sortOrder").optional().isInt({ min: 0, max: 9999 }),
  body("legacyProductCategory")
    .optional({ nullable: true })
    .isIn([...PRODUCT_CATEGORY_VALUES, ""]),
  body("searchKeywords").optional().isArray({ max: 30 }),
  body("searchKeywords.*").optional().isString().trim().isLength({ max: 40 }),
  handleValidationByExpressErrors,
];
