import { useQuery } from "@tanstack/react-query";

import { fetchPublicSellerOneCShelves } from "../api/sellerShelfApi";
import { sellerShelfQueryKeys } from "./sellerShelfQueryKeys";

/** Полки витрины из 1С. Без обмена — пустой список, блок не рисуется. */
export const usePublicSellerOneCShelvesQuery = ({
  sellerId,
  enabled = true,
}: {
  sellerId: string;
  enabled?: boolean;
}) => {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: sellerShelfQueryKeys.publicOneCBySeller(id),
    queryFn: () => fetchPublicSellerOneCShelves(id),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
  });
};
