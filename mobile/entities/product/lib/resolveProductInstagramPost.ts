import { parseInstagramPostUrl } from "@molha/api-contract";

export function resolveProductInstagramPost(product: Record<string, unknown> | null | undefined) {
  const trimmed = String(product?.productInstagramPostUrl ?? "").trim();
  if (!trimmed) {
    return null;
  }
  return parseInstagramPostUrl(trimmed);
}
