import { useQuery } from "@tanstack/react-query";

import {
  fetchCuratedCategoryListItemPreviewAdmin,
  type CuratedCategoryKind,
} from "../api/curatedCategoryListAdminApi";
import { curatedCategoryListQueryKeys } from "./curatedCategoryListQueryKeys";

const REF_ID_RE = /^[a-f\d]{24}$/i;

export const useCuratedListCategoryAddPreview = (
  kind: CuratedCategoryKind,
  refIdDraft: string,
) => {
  const refId = refIdDraft.trim();
  const enabled = REF_ID_RE.test(refId);

  const query = useQuery({
    queryKey: curatedCategoryListQueryKeys.itemPreview(kind, refId),
    enabled,
    queryFn: () => fetchCuratedCategoryListItemPreviewAdmin(kind, refId),
    retry: false,
  });

  return {
    preview: enabled ? (query.data ?? null) : null,
    isLoading: enabled && query.isPending,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.isError
          ? "Не удалось загрузить превью"
          : null,
  };
};
