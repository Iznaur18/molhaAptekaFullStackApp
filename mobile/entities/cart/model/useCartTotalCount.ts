import { useMemo } from "react";

import { countCartItems } from "../lib/countCartItems";
import { useMyCartQuery } from "./useMyCartQuery";

export const useCartTotalCount = (): number => {
  const cartQuery = useMyCartQuery();

  return useMemo(() => countCartItems(cartQuery.data ?? {}), [cartQuery.data]);
};
