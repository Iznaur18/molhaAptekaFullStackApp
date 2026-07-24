export const PRODUCT_RETURN_TERMS_MAX_ITEMS = 5;
export const PRODUCT_RETURN_TERM_KEY_MAX = 50;
export const PRODUCT_RETURN_TERM_VALUE_MAX = 200;

let nextReturnTermRowId = 1;

/**
 * @param {string} [key]
 * @param {string} [value]
 */
export function createProductReturnTermRow(key = "", value = "") {
  nextReturnTermRowId += 1;
  return {
    id: nextReturnTermRowId,
    key,
    value,
  };
}

/**
 * @param {unknown} terms
 * @returns {{ id: number; key: string; value: string }[]}
 */
export function mapProductReturnTermsToRows(terms) {
  if (!Array.isArray(terms)) {
    return [];
  }

  return terms
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = /** @type {{ key?: unknown; value?: unknown }} */ (item);
      return createProductReturnTermRow(
        String(record.key ?? "").trim(),
        String(record.value ?? "").trim(),
      );
    })
    .filter((row) => row != null)
    .slice(0, PRODUCT_RETURN_TERMS_MAX_ITEMS);
}

/**
 * @param {{ id: number; key: string; value: string }[]} rows
 * @returns {{ key: string; value: string }[]}
 */
export function serializeProductReturnTermRows(rows) {
  return rows
    .filter((row) => row.key.trim() && row.value.trim())
    .slice(0, PRODUCT_RETURN_TERMS_MAX_ITEMS)
    .map((row) => ({ key: row.key.trim(), value: row.value.trim() }));
}

/**
 * @param {{ id: number; key: string; value: string }[]} rows
 * @returns {string | null}
 */
export function validateProductReturnTermRows(rows) {
  for (const row of rows) {
    const key = row.key.trim();
    const value = row.value.trim();
    if (!key && !value) {
      continue;
    }
    if (!key || !value) {
      return "Условие возврата: укажите и ключ, и значение";
    }
    if (key.length > PRODUCT_RETURN_TERM_KEY_MAX) {
      return `Ключ — не длиннее ${PRODUCT_RETURN_TERM_KEY_MAX} символов`;
    }
    if (value.length > PRODUCT_RETURN_TERM_VALUE_MAX) {
      return `Значение — не длиннее ${PRODUCT_RETURN_TERM_VALUE_MAX} символов`;
    }
  }

  if (serializeProductReturnTermRows(rows).length === 0) {
    return "При возврате укажите хотя бы одно условие (ключ и значение)";
  }

  return null;
}
