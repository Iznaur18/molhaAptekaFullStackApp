import { useMemo } from "react";

import { buildProductManageToggleImageByVariant } from "../lib/buildProductManageToggleImageByVariant.js";
import { useProductManageToggleDisplaysQuery } from "./useProductManageToggleDisplaysQuery.js";

export function useProductManageToggleImagesByVariant(options = {}) {
  const query = useProductManageToggleDisplaysQuery(options);

  const imageByVariant = useMemo(
    () => buildProductManageToggleImageByVariant(query.data?.displays ?? []),
    [query.data?.displays],
  );

  return { ...query, imageByVariant };
}
