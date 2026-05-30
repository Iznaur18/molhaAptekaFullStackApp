import { body, oneOf } from "express-validator";

import {
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_DESCRIPTION_MAX_WORDS,
  PRODUCT_IMAGE_URLS_MAX,
} from "../../constants/productConstants.js";
import { assertAtMostWords } from "../../utils/maxWordsText.js";
import { assertProductOldPricePair, normalizeProductOldPriceRub, normalizeProductPriceRub } from "../../utils/productDiscount.js";
import { handleValidationByExpressErrors } from "../handleValidationByExpressErrors.js";

const assertHttpImageUrl = (raw, label) => {
  if (raw == null || String(raw).trim() === "") return;
  const s = String(raw).trim();
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      throw new Error(
        `${label}: URL должен начинаться с http:// или https://`,
      );
    }
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`${label}: некорректный URL`);
    }
    throw e;
  }
};

export const patchMyProductValidation = [
  oneOf(
    [
      body("productName").exists(),
      body("productDescription").exists(),
      body("productPrice").exists(),
      body("productOldPrice").exists(),
      body("productCategory").exists(),
      body("productImageUrls").exists(),
      body("productImageUrl").exists(),
      body("productIsAvailable").exists(),
      body("productAuctionEnabled").exists(),
    ],
    { message: "Укажите хотя бы одно поле для обновления" },
  ),
  body("productName")
    .optional()
    .notEmpty()
    .withMessage("Название продукта не может быть пустым")
    .isLength({ min: 3 })
    .withMessage("Название продукта должно быть не менее 3 символов")
    .trim(),
  body("productDescription")
    .optional()
    .notEmpty()
    .withMessage("Описание продукта не может быть пустым")
    .isLength({ min: 10 })
    .withMessage("Описание продукта должно быть не менее 10 символов")
    .trim()
    .custom((value) => {
      try {
        assertAtMostWords(
          value,
          "Описание товара",
          PRODUCT_DESCRIPTION_MAX_WORDS,
        );
      } catch (e) {
        throw new Error(
          e instanceof Error ? e.message : "Слишком длинное описание",
        );
      }
      return true;
    }),
  body("productImageUrls")
    .optional()
    .custom((value) => {
      if (value === undefined || value === null) return true;
      if (!Array.isArray(value)) {
        throw new Error("productImageUrls должен быть массивом");
      }
      if (value.length > PRODUCT_IMAGE_URLS_MAX) {
        throw new Error(`Не более ${PRODUCT_IMAGE_URLS_MAX} изображений`);
      }
      value.forEach((item, i) => {
        assertHttpImageUrl(item, `Изображение ${i + 1}`);
      });
      return true;
    }),
  body("productImageUrl")
    .optional({ values: "falsy" })
    .isURL({ require_protocol: true })
    .withMessage("Ссылка на картинку должна быть валидным URL с http/https")
    .trim(),
  body("productPrice")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Цена продукта должна быть целым числом не меньше 0")
    .toInt(),
  body("productOldPrice")
    .optional({ nullable: true })
    .custom((value, { req }) => {
      try {
        const productOldPrice = normalizeProductOldPriceRub(value);
        const productPrice = Object.prototype.hasOwnProperty.call(
          req.body ?? {},
          "productPrice",
        )
          ? normalizeProductPriceRub(req.body.productPrice)
          : 0;
        if (
          !Object.prototype.hasOwnProperty.call(req.body ?? {}, "productPrice")
        ) {
          return true;
        }
        assertProductOldPricePair(productOldPrice, productPrice);
      } catch (e) {
        throw new Error(
          e instanceof Error ? e.message : "Некорректная старая цена",
        );
      }
      return true;
    }),
  body("productCategory")
    .optional()
    .notEmpty()
    .withMessage("Категория продукта не может быть пустой")
    .isIn(PRODUCT_CATEGORY_VALUES)
    .withMessage("Указана неизвестная категория товара")
    .trim(),
  body("productIsAvailable")
    .optional()
    .isBoolean()
    .withMessage("productIsAvailable должно быть true или false"),
  body("productStockQuantity")
    .optional()
    .isInt({ min: 0, max: 9999 })
    .withMessage("productStockQuantity — целое число от 0 до 9999")
    .toInt(),
  body("productAuctionEnabled")
    .optional()
    .isBoolean()
    .withMessage("productAuctionEnabled должно быть true или false"),
  handleValidationByExpressErrors,
];
