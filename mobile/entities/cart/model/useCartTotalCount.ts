import { useMemo } from "react";

import { useMyAcceptedBidsQuery } from "@/entities/product-price-offer/model/useMyAcceptedBidsQuery";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";

import { countCartItems } from "../lib/countCartItems";
import { useMyCartQuery } from "./useMyCartQuery";

/** Товары в корзине плюс выигранные аукционные лоты, ожидающие оплаты. */
export const useCartTotalCount = (): number => {
  const cartQuery = useMyCartQuery();
  const isAuthorized = useIsAuthorized();
  const acceptedBidsQuery = useMyAcceptedBidsQuery(isAuthorized);
  const auctionCount = acceptedBidsQuery.data?.length ?? 0;

  return useMemo(
    () => countCartItems(cartQuery.data ?? {}) + auctionCount,
    [auctionCount, cartQuery.data],
  );
};
