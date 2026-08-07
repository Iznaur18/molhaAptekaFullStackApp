export type ProductReturnTermRow = {
  id: number;
  key: string;
  value: string;
};

/** SSOT: `contract/src/productWrite.js`. */
import {
  PRODUCT_RETURN_TERMS_MAX_ITEMS,
  PRODUCT_RETURN_TERM_KEY_MAX_CHARS as PRODUCT_RETURN_TERM_KEY_MAX,
  PRODUCT_RETURN_TERM_VALUE_MAX_CHARS as PRODUCT_RETURN_TERM_VALUE_MAX,
} from "@molha/api-contract";

export {
  PRODUCT_RETURN_TERMS_MAX_ITEMS,
  PRODUCT_RETURN_TERM_KEY_MAX,
  PRODUCT_RETURN_TERM_VALUE_MAX,
};

let nextReturnTermRowId = 1;

export const createProductReturnTermRow = (
  key = "",
  value = "",
): ProductReturnTermRow => ({
  id: nextReturnTermRowId++,
  key,
  value,
});

export const mapProductReturnTermsToRows = (
  terms: unknown,
): ProductReturnTermRow[] => {
  if (!Array.isArray(terms)) {
    return [];
  }

  return terms
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as { key?: unknown; value?: unknown };
      return createProductReturnTermRow(
        String(record.key ?? "").trim(),
        String(record.value ?? "").trim(),
      );
    })
    .filter((row): row is ProductReturnTermRow => row !== null)
    .slice(0, PRODUCT_RETURN_TERMS_MAX_ITEMS);
};

export const serializeProductReturnTermRows = (
  rows: ProductReturnTermRow[],
): Array<{ key: string; value: string }> =>
  rows
    .filter((row) => row.key.trim() && row.value.trim())
    .slice(0, PRODUCT_RETURN_TERMS_MAX_ITEMS)
    .map((row) => ({ key: row.key.trim(), value: row.value.trim() }));

export const validateProductReturnTermRows = (
  rows: ProductReturnTermRow[],
): string | null => {
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
};
