import { createCharacteristicRow } from "./createCharacteristicRow.js";

/**
 * @param {import('../model/types.js').ProductCharacteristic[] | undefined} items
 */
export function characteristicRowsFromApi(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item) =>
    createCharacteristicRow(item.key ?? "", item.value ?? ""),
  );
}
