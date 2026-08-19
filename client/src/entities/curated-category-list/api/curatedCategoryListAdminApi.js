import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {string} listId
 * @param {{ title: string; regionCode: string }} body
 */
export async function createCuratedCategoryListAdmin(body) {
  try {
    const { data } = await apiClient.post("/product/admin/curated-category-lists", body);
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось создать список";
    throw new Error(message);
  }
}

/**
 * @param {string} listId
 * @param {{ title?: string; regionCode?: string }} body
 */
export async function patchCuratedCategoryListAdmin(listId, body) {
  try {
    const { data } = await apiClient.patch(
      `/product/admin/curated-category-lists/${listId}`,
      body,
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось сохранить список";
    throw new Error(message);
  }
}

/**
 * @param {string} listId
 */
export async function deleteCuratedCategoryListAdmin(listId) {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/curated-category-lists/${listId}`,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data?.deletedId ?? listId;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить список";
    throw new Error(message);
  }
}

/**
 * @param {string[]} orderedListIds
 */
export async function reorderCuratedCategoryListsAdmin(orderedListIds) {
  try {
    const { data } = await apiClient.patch("/product/admin/curated-category-lists/reorder", {
      orderedListIds,
    });
    if (!data?.success || !Array.isArray(data.data?.lists)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.lists;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось изменить порядок";
    throw new Error(message);
  }
}

/**
 * @param {string} listId
 * @param {"tree" | "personal"} kind
 * @param {string} refId
 */
export async function addCuratedCategoryListItemAdmin(listId, kind, refId) {
  try {
    const { data } = await apiClient.post(
      `/product/admin/curated-category-lists/${listId}/items`,
      { kind, refId },
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось добавить категорию";
    throw new Error(message);
  }
}

/**
 * @param {string} listId
 * @param {string} itemKey
 */
export async function removeCuratedCategoryListItemAdmin(listId, itemKey) {
  try {
    const { data } = await apiClient.delete(
      `/product/admin/curated-category-lists/${listId}/items/${encodeURIComponent(itemKey)}`,
    );
    if (!data?.success || !data.data?.list) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.list;
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? "Не удалось удалить категорию";
    throw new Error(message);
  }
}
