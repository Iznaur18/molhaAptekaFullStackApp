import { body } from "express-validator";

import {
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_DESCRIPTION_MAX_WORDS,
  PRODUCT_IMAGE_URLS_MAX,
} from "../../constants/productConstants.js";
import { assertAtMostWords } from "../../utils/maxWordsText.js";
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
    .notEmpty()
    .withMessage("Цена продукта обязательна")
    .isFloat({ min: 0 })
    .withMessage("Цена продукта должна быть положительным числом")
    .toFloat(),
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
  body("productAuctionEnabled")
    .optional()
    .isBoolean()
    .withMessage("productAuctionEnabled должно быть true или false"),
  handleValidationByExpressErrors,
];
