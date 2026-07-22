import {
  PRODUCT_RETURN_EMPTY_PAIR_MESSAGE,
  PRODUCT_RETURN_REQUIRED_WHEN_ENABLED_MESSAGE,
  PRODUCT_RETURN_TERM_KEY_MAX_CHARS,
  PRODUCT_RETURN_TERM_VALUE_MAX_CHARS,
  PRODUCT_RETURN_TERMS_MAX_ITEMS,
} from "../../constants/productReturnConstants.js";

/**
 * @param {unknown} raw
 * @returns {{ key: string; value: string }[]}
 */
export const normalizeProductReturnTerms = (raw) => {
  if (raw == null) {
    return [];
  }

  if (!Array.isArray(raw)) {
    throw new Error("productReturnTerms должен быть массивом");
  }

  const result = [];

  for (const item of raw) {
    if (item == null || typeof item !== "object") {
      throw new Error("Каждое условие возврата должно быть объектом с key и value");
    }

    const key = item.key == null ? "" : String(item.key).trim();
    const value = item.value == null ? "" : String(item.value).trim();

    if (!key && !value) {
      continue;
    }

    if (!key || !value) {
      throw new Error(PRODUCT_RETURN_EMPTY_PAIR_MESSAGE);
    }

    if (key.length > PRODUCT_RETURN_TERM_KEY_MAX_CHARS) {
      throw new Error(
        `Ключ условия возврата не длиннее ${PRODUCT_RETURN_TERM_KEY_MAX_CHARS} символов`,
      );
    }

    if (value.length > PRODUCT_RETURN_TERM_VALUE_MAX_CHARS) {
      throw new Error(
        `Значение условия возврата не длиннее ${PRODUCT_RETURN_TERM_VALUE_MAX_CHARS} символов`,
      );
    }

    result.push({ key, value });
  }

  if (result.length > PRODUCT_RETURN_TERMS_MAX_ITEMS) {
    throw new Error(`Не более ${PRODUCT_RETURN_TERMS_MAX_ITEMS} условий возврата`);
  }

  return result;
};

/**
 * @param {{
 *   productReturnEnabled?: unknown;
 *   productReturnTerms?: unknown;
 * }} body
 * @returns {{ productReturnEnabled: boolean; productReturnTerms: { key: string; value: string }[] }}
 */
export const resolveProductReturnWriteFromBody = (body) => {
  const productReturnEnabled = body?.productReturnEnabled === true;
  if (!productReturnEnabled) {
    return { productReturnEnabled: false, productReturnTerms: [] };
  }

  const productReturnTerms = normalizeProductReturnTerms(body?.productReturnTerms);
  if (productReturnTerms.length === 0) {
    throw new Error(PRODUCT_RETURN_REQUIRED_WHEN_ENABLED_MESSAGE);
  }

  return { productReturnEnabled: true, productReturnTerms };
};
