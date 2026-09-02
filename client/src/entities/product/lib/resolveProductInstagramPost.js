import { parseInstagramPostUrl } from "@molha/api-contract";

/**
 * @param {unknown} product
 * @returns {import('@molha/api-contract').ParsedInstagramPostUrl | null}
 */
export function resolveProductInstagramPost(product) {
  const raw = product?.productInstagramPostUrl;
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    return null;
  }
  return parseInstagramPostUrl(trimmed);
}
