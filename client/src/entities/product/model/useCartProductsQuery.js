import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchCatalogProductsByIds } from "../api/fetchCatalogProductsByIds.js";
import { cartProductsQueryKeys } from "./cartProductsQueryKeys.js";

const CART_PRODUCTS_STALE_MS = 60_000;

/**
 * Товары только из корзины — без полного обхода каталога.
 *
 * @param {{
 *   productIds: string[];
 *   enabled?: boolean;
 * }} params
 */
export function useCartProductsQuery({ productIds, enabled = true }) {
  const idsKey = useMemo(() => {
    return [...new Set((productIds ?? []).map(String).filter(Boolean))]
      .sort()
      .join(",");
  }, [productIds]);

  const ids = useMemo(() => (idsKey ? idsKey.split(",") : []), [idsKey]);

  return useQuery({
    queryKey: cartProductsQueryKeys.byIds(ids),
    queryFn: () => fetchCatalogProductsByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: CART_PRODUCTS_STALE_MS,
    placeholderData: (previous) => previous,
  });
}
