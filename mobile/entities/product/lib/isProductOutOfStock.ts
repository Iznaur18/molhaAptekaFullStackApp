export function isProductOutOfStock(product: unknown): boolean {
  if (product == null || typeof product !== "object") {
    return false;
  }
  return (product as { productOutOfStock?: unknown }).productOutOfStock === true;
}
