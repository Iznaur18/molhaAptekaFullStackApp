import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import {
  sellerShelfListDataSchema,
  sellerShelfSchema,
} from "@molha/api-contract";

/**
 * @param {unknown} error
 * @param {string} fallback
 */
function readApiError(error, fallback) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallback
  );
}

export async function fetchMySellerShelves() {
  try {
    const { data } = await apiClient.get("/seller-shelf/me");
    return parseApiContractData(data, sellerShelfListDataSchema);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить полки"));
  }
}

/**
 * @param {string} sellerId
 */
export async function fetchPublicSellerShelves(sellerId) {
  try {
    const { data } = await apiClient.get(
      `/seller-shelf/seller/${encodeURIComponent(sellerId)}`,
    );
    return parseApiContractData(data, sellerShelfListDataSchema);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось загрузить полки продавца"));
  }
}

/**
 * @param {{ name: string }} body
 */
export async function createSellerShelf(body) {
  try {
    const { data } = await apiClient.post("/seller-shelf", body);
    return parseApiContractData(data, sellerShelfSchema);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось создать полку"));
  }
}

/**
 * @param {string} shelfId
 * @param {{ name?: string; sortOrder?: number }} body
 */
export async function patchSellerShelf(shelfId, body) {
  try {
    const { data } = await apiClient.patch(
      `/seller-shelf/${encodeURIComponent(shelfId)}`,
      body,
    );
    return parseApiContractData(data, sellerShelfSchema);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось обновить полку"));
  }
}

/**
 * @param {string[]} orderedShelfIds
 */
export async function reorderSellerShelves(orderedShelfIds) {
  try {
    const { data } = await apiClient.post("/seller-shelf/me/reorder", {
      orderedShelfIds,
    });
    return parseApiContractData(data, sellerShelfListDataSchema);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось изменить порядок полок"));
  }
}

/**
 * @param {string} shelfId
 */
export async function deleteSellerShelf(shelfId) {
  try {
    await apiClient.delete(`/seller-shelf/${encodeURIComponent(shelfId)}`);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось удалить полку"));
  }
}

/**
 * @param {string} shelfId
 * @param {string[]} productIds
 */
export async function setSellerShelfProducts(shelfId, productIds) {
  try {
    const { data } = await apiClient.put(
      `/seller-shelf/${encodeURIComponent(shelfId)}/products`,
      { productIds },
    );
    return parseApiContractData(data, sellerShelfSchema);
  } catch (error) {
    throw new Error(readApiError(error, "Не удалось сохранить товары полки"));
  }
}
