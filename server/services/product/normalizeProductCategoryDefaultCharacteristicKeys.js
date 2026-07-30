import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
} from "../../constants/productCharacteristicsConstants.js";
import { AppError } from "../../errors/AppError.js";

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
export const normalizeProductCategoryDefaultCharacteristicKeys = (raw) => {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    throw new AppError(400, "defaultCharacteristicKeys: ожидается массив строк");
  }

  const unique = [];
  const seen = new Set();

  for (const item of raw) {
    const key = String(item ?? "").trim();
    if (!key) continue;

    if (key.length > PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS) {
      throw new AppError(
        400,
        `Ключ характеристики: не более ${PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS} символов`,
      );
    }

    const keyLower = key.toLowerCase();
    if (seen.has(keyLower)) continue;
    seen.add(keyLower);
    unique.push(key);

    if (unique.length > PRODUCT_CHARACTERISTICS_MAX_ITEMS) {
      throw new AppError(
        400,
        `Не более ${PRODUCT_CHARACTERISTICS_MAX_ITEMS} характеристик по категории`,
      );
    }
  }

  return unique;
};
