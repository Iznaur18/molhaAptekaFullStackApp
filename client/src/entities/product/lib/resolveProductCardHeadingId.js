/**
 * @param {string | null | undefined} productId
 * @returns {string | undefined}
 */
export function resolveProductCardHeadingId(productId) {
  const id = productId != null ? String(productId).trim() : "";
  if (!id) {
    return undefined;
  }

  return `product-card-heading-${id}`;
}
