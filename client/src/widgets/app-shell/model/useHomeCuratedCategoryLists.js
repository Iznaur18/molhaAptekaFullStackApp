import { useMemo } from "react";

import { isHomeCuratedCategoryListsVisible } from "../../../entities/curated-category-list/lib/isHomeCuratedCategoryListsVisible.js";
import { useHomeCuratedCategoryListsQuery } from "../../../entities/curated-category-list/model/useHomeCuratedCategoryListsQuery.js";

/**
 * @param {Parameters<typeof isHomeCuratedCategoryListsVisible>[0] & {
 *   viewerRegionCode: string;
 * }} params
 */
export function useHomeCuratedCategoryLists(params) {
  const { viewerRegionCode, ...visibilityParams } = params;

  const showCuratedCategoryLists = isHomeCuratedCategoryListsVisible(visibilityParams);

  const curatedListsQuery = useHomeCuratedCategoryListsQuery({
    enabled: showCuratedCategoryLists,
    regionCode: viewerRegionCode,
  });

  const homeCuratedCategoryLists = useMemo(
    () => (showCuratedCategoryLists ? (curatedListsQuery.data ?? []) : []),
    [curatedListsQuery.data, showCuratedCategoryLists],
  );

  return {
    showCuratedCategoryLists,
    homeCuratedCategoryLists,
    curatedCategoryListsQuery: curatedListsQuery,
  };
}
