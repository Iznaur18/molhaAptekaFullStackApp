/**
 * @param {string | number | null | undefined} productId
 * @returns {string | null}
 */
export function buildProductDetailsPath(productId) {
  const id = productId != null ? String(productId).trim() : "";
  if (!id) {
    return null;
  }
  return `/product/${encodeURIComponent(id)}`;
}

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {string | number | { _id?: string | number } | null | undefined} productOrId
 * @param {{ replace?: boolean }} [options]
 */
export function navigateToProductDetails(navigate, productOrId, options = {}) {
  const productId =
    productOrId != null && typeof productOrId === "object"
      ? productOrId._id
      : productOrId;
  const path = buildProductDetailsPath(productId);
  if (!path) {
    return;
  }
  navigate(path, { replace: options.replace === true });
}
