import { body } from "express-validator";

import {
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_DESCRIPTION_MIN_CHARS,
  PRODUCT_IMAGE_URLS_MAX,
  PRODUCT_PRICE_RUB_MAX,
} from "../../constants/productConstants.js";
import {
  PRODUCT_STOCK_QUANTITY_MAX,
  PRODUCT_STOCK_QUANTITY_MIN,
} from "../../constants/productStockConstants.js";
import { assertAtMostChars } from "../../utils/maxWordsText.js";
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

export const makeProductValidation = [
  body("productName")
    .notEmpty()
    .withMessage("Название продукта обязательно")
    .isLength({ min: 3 })
    .withMessage("Название продукта должно быть не менее 3 символов")
    .trim(),
  body("productDescription")
    .notEmpty()
    .withMessage("Описание продукта обязательно")
    .isLength({ min: PRODUCT_DESCRIPTION_MIN_CHARS })
    .withMessage(
      `Описание продукта должно быть не менее ${PRODUCT_DESCRIPTION_MIN_CHARS} символов`,
    )
    .trim()
    .custom((value) => {
      try {
        assertAtMostChars(
          value,
          "Описание товара",
          PRODUCT_DESCRIPTION_MAX_CHARS,
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
  body("productPreviewVideoUrl")
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value == null || String(value).trim() === "") return true;
      assertHttpImageUrl(value, "Превью-видео");
      return true;
    }),
  body("productPrice")
    .notEmpty()
    .withMessage("Цена продукта обязательна")
    .isInt({ min: 0, max: PRODUCT_PRICE_RUB_MAX })
    .withMessage(
      `Цена продукта — целое число от 0 до ${PRODUCT_PRICE_RUB_MAX}`,
    )
    .toInt(),
  body("productOldPrice")
    .optional({ nullable: true })
    .custom((value, { req }) => {
      try {
        const productOldPrice = normalizeProductOldPriceRub(value);
        const productPrice = normalizeProductPriceRub(req.body?.productPrice);
        assertProductOldPricePair(productOldPrice, productPrice);
      } catch (e) {
        throw new Error(
          e instanceof Error ? e.message : "Некорректная старая цена",
        );
      }
      return true;
    }),
  body("productCategory")
    .notEmpty()
    .withMessage("Категория продукта обязательна")
    .isIn(PRODUCT_CATEGORY_VALUES)
    .withMessage("Указана неизвестная категория товара")
    .trim(),
  body("productIsAvailable")
    .notEmpty()
    .withMessage("Доступность продукта обязательна")
    .isBoolean()
    .withMessage("Доступность продукта должна быть булевым значением"),
  body("productStockQuantity")
    .optional()
    .isInt({
      min: PRODUCT_STOCK_QUANTITY_MIN,
      max: PRODUCT_STOCK_QUANTITY_MAX,
    })
    .withMessage(
      `Количество в наличии — целое число от ${PRODUCT_STOCK_QUANTITY_MIN} до ${PRODUCT_STOCK_QUANTITY_MAX}`,
    )
    .toInt(),
  body("productAuctionEnabled")
    .optional()
    .isBoolean()
    .withMessage("productAuctionEnabled должно быть true или false"),
  handleValidationByExpressErrors,
];
