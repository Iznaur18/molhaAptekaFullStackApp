import { useSellerProductsInfiniteQuery } from "../../../entities/user/model/useSellerProductsInfiniteQuery.js";

/**
 * @param {{
 *   sellerId: string;
 *   enabled: boolean;
 *   shelfId?: string | null;
 *   onecGroupId?: string | null;
 * }} params
 */
export function useSellerProductsCatalog({
  sellerId,
  enabled,
  shelfId = null,
  onecGroupId = null,
}) {
  return useSellerProductsInfiniteQuery({ sellerId, enabled, shelfId, onecGroupId });
}
