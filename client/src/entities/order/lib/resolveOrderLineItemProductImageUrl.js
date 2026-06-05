/**
 * @param {import('../model/types.js').OrderLineItem} item
 * @returns {string | null}
 */
export function resolveOrderLineItemProductImageUrl(item) {
  const populated = item.productId;
  if (populated == null || typeof populated !== "object") {
    return null;
  }

  const urls = populated.productImageUrls;
  if (Array.isArray(urls)) {
    const first = urls.map((url) => String(url).trim()).find(Boolean);
    if (first) {
      return first;
    }
  }

  const legacy = populated.productImageUrl?.trim();
  return legacy || null;
}
