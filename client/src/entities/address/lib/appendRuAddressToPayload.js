/**
 * @param {Record<string, unknown>} payload
 * @param {import('../model/types.js').RuDeliveryAddressValue} value
 * @param {{ lineKey?: string; flatKey?: string }} [options]
 */
export function appendRuAddressToPayload(payload, value, options = {}) {
  const { lineKey = "userAddress", flatKey = "userAddressFlat" } = options;
  const line = String(value.line ?? "").trim();

  if (line === "") return;

  payload[lineKey] = line;
  payload[flatKey] = "";
}
