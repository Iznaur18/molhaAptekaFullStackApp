let characteristicRowIdCounter = 0;

/**
 * @param {string} [key]
 * @param {string} [value]
 */
export function createCharacteristicRow(key = "", value = "") {
  characteristicRowIdCounter += 1;
  return {
    id: `characteristic-row-${characteristicRowIdCounter}`,
    key,
    value,
  };
}
