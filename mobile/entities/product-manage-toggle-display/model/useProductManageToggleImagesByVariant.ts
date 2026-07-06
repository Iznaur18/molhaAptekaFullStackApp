import { useMemo } from "react";

import { buildProductManageToggleImageByVariant } from "../lib/buildProductManageToggleImageByVariant";
import { useProductManageToggleDisplaysQuery } from "./useProductManageToggleDisplaysQuery";

type UseProductManageToggleImagesByVariantOptions = {
  enabled?: boolean;
};

export const useProductManageToggleImagesByVariant = (
  options: UseProductManageToggleImagesByVariantOptions = {},
) => {
  const query = useProductManageToggleDisplaysQuery(options);

  const imageByVariant = useMemo(
    () => buildProductManageToggleImageByVariant(query.data ?? []),
    [query.data],
  );

  return { ...query, imageByVariant };
};
