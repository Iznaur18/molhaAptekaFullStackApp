import mongoose from "mongoose";
import { query } from "express-validator";

import { ORDER_STATUSES } from "../../constants/orderConstants.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

const SEARCH_MAX_LENGTH = 100;
const PRODUCT_IDS_QUERY_MAX_LENGTH = 2800;
const MAX_PRODUCT_IDS_IN_FILTER = 50;

/** Валидация query `GET /order/sales` (продажи текущего продавца). */
export const getMySalesValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page должен быть целым числом от 1")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit должен быть целым числом от 1 до 100")
    .toInt(),
  query("status")
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage(`status должен быть одним из: ${ORDER_STATUSES.join(", ")}`),
  query("search")
    .optional()
    .isString()
    .withMessage("search должен быть строкой")
    .trim()
    .isLength({ max: SEARCH_MAX_LENGTH })
    .withMessage(`search не более ${SEARCH_MAX_LENGTH} символов`),
  query("productIds")
    .optional()
    .isString()
    .withMessage("productIds должен быть строкой")
    .trim()
    .isLength({ max: PRODUCT_IDS_QUERY_MAX_LENGTH })
    .withMessage(`productIds не длиннее ${PRODUCT_IDS_QUERY_MAX_LENGTH} символов`)
    .custom((value) => {
      if (!value || String(value).trim() === "") return true;
      const parts = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length > MAX_PRODUCT_IDS_IN_FILTER) {
        throw new Error(`не более ${MAX_PRODUCT_IDS_IN_FILTER} товаров в фильтре`);
      }
      for (const id of parts) {
        if (!mongoose.isValidObjectId(id)) {
          throw new Error("неверный идентификатор товара в productIds");
        }
      }
      return true;
    }),
  handleValidationByExpressErrors,
];
