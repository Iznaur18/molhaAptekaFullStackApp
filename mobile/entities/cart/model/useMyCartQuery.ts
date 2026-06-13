import { useQuery } from "@tanstack/react-query";

import { cartQueryKeys } from "@/shared/api";

import { fetchMyCart } from "../api/fetchMyCart";
import { useIsAuthorized } from "@/entities/session/model/useIsAuthorized";

export const useMyCartQuery = () => {
  const isAuthorized = useIsAuthorized();

  return useQuery({
    queryKey: cartQueryKeys.all,
    queryFn: fetchMyCart,
    enabled: isAuthorized,
  });
};
