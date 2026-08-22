import { apiClient } from "@/shared/api";
import { API_CLIENT_UI, POPULAR_CATEGORIES_ADMIN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type CuratedCategoryKind = "tree" | "personal";

export type CuratedCategoryListItem = {
  kind: CuratedCategoryKind;
  refId: string;
  itemKey: string;
};

export type CuratedCategoryListAdminRow = {
  _id: string;
  title: string;
  regionCode: string;
  items: CuratedCategoryListItem[];
  sortOrder?: number;
  updatedAt?: string | null;
};

export type CuratedCategoryListItemPreview = {
  kind: CuratedCategoryKind;
  refId: string;
  label: string;
  imageUrl: string | null;
  categorySlug: string | null;
  regionCode: string | null;
  regionLabel: string | null;
  catalogVisible: boolean;
};

export const fetchCuratedCategoryListsAdmin = async (): Promise<
  CuratedCategoryListAdminRow[]
> => {
  try {
    const { data } = await apiClient.get("/product/admin/curated-category-lists");
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(POPULAR_CATEGORIES_ADMIN_PAGE_UI.LOAD_ERROR);
    }
    return data.data.lists as CuratedCategoryListAdminRow[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.LOAD_ERROR),
    );
  }
};

export const fetchCuratedCategoryListItemPreviewAdmin = async (
  kind: CuratedCategoryKind,
  refId: string,
): Promise<CuratedCategoryListItemPreview> => {
  try {
    const { data } = await apiClient.get(
      "/product/admin/curated-category-lists/item-preview",
      { params: { kind, refId } },
    );
    if (!data?.success || !data.data?.preview) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.preview as CuratedCategoryListItemPreview;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.PREVIEW_LOADING),
    );
  }
};

export const createCuratedCategoryListAdmin = async (body: {
  title: string;
  regionCode: string;
}): Promise<CuratedCategoryListAdminRow> => {
  try {
    const { data } = await apiClient.post("/product/admin/curated-category-lists", body);
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedCategoryListAdminRow;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.CREATE_ERROR),
    );
  }
};

export const patchCuratedCategoryListAdmin = async (
  listId: string,
  body: { title?: string; regionCode?: string },
): Promise<CuratedCategoryListAdminRow> => {
  try {
    const { data } = await apiClient.patch(
      `/product/admin/curated-category-lists/${listId}`,
      body,
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedCategoryListAdminRow;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.SAVE_ERROR),
    );
  }
};

export const deleteCuratedCategoryListAdmin = async (listId: string): Promise<void> => {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/curated-category-lists/${listId}`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.DELETE_ERROR),
    );
  }
};

export const reorderCuratedCategoryListsAdmin = async (
  orderedListIds: string[],
): Promise<CuratedCategoryListAdminRow[]> => {
  try {
    const { data } = await apiClient.patch(
      "/product/admin/curated-category-lists/reorder",
      { orderedListIds },
    );
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists as CuratedCategoryListAdminRow[];
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.REORDER_ERROR),
    );
  }
};

export const addCuratedCategoryListItemAdmin = async (
  listId: string,
  kind: CuratedCategoryKind,
  refId: string,
): Promise<CuratedCategoryListAdminRow> => {
  try {
    const { data } = await apiClient.post(
      `/product/admin/curated-category-lists/${listId}/items`,
      { kind, refId },
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedCategoryListAdminRow;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.ADD_ITEM_ERROR),
    );
  }
};

export const removeCuratedCategoryListItemAdmin = async (
  listId: string,
  itemKey: string,
): Promise<CuratedCategoryListAdminRow> => {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/curated-category-lists/${listId}/items/${encodeURIComponent(itemKey)}`,
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedCategoryListAdminRow;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, POPULAR_CATEGORIES_ADMIN_PAGE_UI.REMOVE_ITEM_ERROR),
    );
  }
};
