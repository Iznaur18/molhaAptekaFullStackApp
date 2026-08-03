/**
 * @param {import('../model/types.js').RuDeliveryAddressValue} a
 * @param {import('../model/types.js').RuDeliveryAddressValue} b
 */
export function isDeliveryAddressEqual(a, b) {
  return (
    String(a?.line ?? "").trim() === String(b?.line ?? "").trim() &&
    String(a?.flat ?? "").trim() === String(b?.flat ?? "").trim()
  );
}
