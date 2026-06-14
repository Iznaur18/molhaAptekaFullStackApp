import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type { CuratedListAdminRow } from "./curatedProductListAdminApi";

export const createCuratedProductListAdmin = async (body: {
  title: string;
}): Promise<CuratedListAdminRow> => {
  try {
    const { data } = await apiClient.post("/product/admin/curated-lists", body);
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedListAdminRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось создать список"));
  }
};

export const patchCuratedProductListAdmin = async (
  listId: string,
  body: { title?: string },
): Promise<CuratedListAdminRow> => {
  try {
    const { data } = await apiClient.patch(`/product/admin/curated-lists/${listId}`, body);
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedListAdminRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось обновить список"));
  }
};

export const deleteCuratedProductListAdmin = async (listId: string) => {
  try {
    const { data } = await apiClient.delete(`/product/admin/curated-lists/${listId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось удалить список"));
  }
};

export const reorderCuratedProductListsAdmin = async (
  orderedListIds: string[],
): Promise<CuratedListAdminRow[]> => {
  try {
    const { data } = await apiClient.patch("/product/admin/curated-lists/reorder", {
      orderedListIds,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists as CuratedListAdminRow[];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось изменить порядок списков"));
  }
};

export const addCuratedProductListItemAdmin = async (
  listId: string,
  productId: string,
): Promise<CuratedListAdminRow> => {
  try {
    const { data } = await apiClient.post(`/product/admin/curated-lists/${listId}/products`, {
      productId,
    });
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedListAdminRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось добавить товар"));
  }
};

export const removeCuratedProductListItemAdmin = async (
  listId: string,
  productId: string,
): Promise<CuratedListAdminRow> => {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/curated-lists/${listId}/products/${productId}`,
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list as CuratedListAdminRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось удалить товар"));
  }
};
