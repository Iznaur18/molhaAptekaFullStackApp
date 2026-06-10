/**
 * @param {import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue} a
 * @param {import('../model/structuredTypes.js').RuStructuredDeliveryAddressValue} b
 */
export function isStructuredAddressEqual(a, b) {
  return (
    String(a.city ?? "").trim() === String(b.city ?? "").trim() &&
    String(a.district ?? "").trim() === String(b.district ?? "").trim() &&
    String(a.street ?? "").trim() === String(b.street ?? "").trim() &&
    String(a.house ?? "").trim() === String(b.house ?? "").trim() &&
    String(a.flat ?? "").trim() === String(b.flat ?? "").trim()
  );
}
