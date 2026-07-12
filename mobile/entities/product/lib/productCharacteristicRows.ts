export type ProductCharacteristicRow = {
  id: number;
  key: string;
  value: string;
};

let nextCharacteristicRowId = 1;

export const createProductCharacteristicRow = (
  key = "",
  value = "",
): ProductCharacteristicRow => ({
  id: nextCharacteristicRowId++,
  key,
  value,
});

export const mapProductCharacteristicsToRows = (
  characteristics: unknown,
): ProductCharacteristicRow[] => {
  if (!Array.isArray(characteristics)) {
    return [];
  }

  return characteristics
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const record = item as { key?: unknown; value?: unknown };
      return createProductCharacteristicRow(
        String(record.key ?? "").trim(),
        String(record.value ?? "").trim(),
      );
    })
    .filter((row): row is ProductCharacteristicRow => row !== null);
};

export const serializeProductCharacteristicRows = (
  rows: ProductCharacteristicRow[],
): Array<{ key: string; value: string }> =>
  rows
    .filter((row) => row.key.trim() && row.value.trim())
    .map((row) => ({ key: row.key.trim(), value: row.value.trim() }));
