import { useSellerProductsInfiniteQuery } from "../../../entities/user/model/useSellerProductsInfiniteQuery.js";

/**
 * @param {{ sellerId: string; enabled: boolean }} params
 */
export function useSellerProductsCatalog({ sellerId, enabled }) {
  return useSellerProductsInfiniteQuery({ sellerId, enabled });
}
