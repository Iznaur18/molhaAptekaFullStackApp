import {
  createSellerShelfBodySchema,
  patchSellerShelfBodySchema,
  reorderSellerShelvesBodySchema,
  sellerShelfListDataSchema,
  sellerShelfSchema,
  setSellerShelfProductsBodySchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { formatApiErrorMessage } from "@/shared/lib";

export async function fetchMySellerShelves() {
  try {
    const { data } = await apiClient.get("/seller-shelf/me");
    return parseApiContractData(data, sellerShelfListDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить полки"));
  }
}

export async function fetchPublicSellerShelves(sellerId: string) {
  try {
    const { data } = await apiClient.get(
      `/seller-shelf/seller/${encodeURIComponent(sellerId)}`,
    );
    return parseApiContractData(data, sellerShelfListDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить полки продавца"));
  }
}

export async function createSellerShelf(name: string) {
  const body = createSellerShelfBodySchema.parse({ name });
  try {
    const { data } = await apiClient.post("/seller-shelf", body);
    return parseApiContractData(data, sellerShelfSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось создать полку"));
  }
}

export async function patchSellerShelf(
  shelfId: string,
  patch: { name?: string; sortOrder?: number },
) {
  const body = patchSellerShelfBodySchema.parse(patch);
  try {
    const { data } = await apiClient.patch(
      `/seller-shelf/${encodeURIComponent(shelfId)}`,
      body,
    );
    return parseApiContractData(data, sellerShelfSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось обновить полку"));
  }
}

export async function reorderSellerShelves(orderedShelfIds: string[]) {
  const body = reorderSellerShelvesBodySchema.parse({ orderedShelfIds });
  try {
    const { data } = await apiClient.post("/seller-shelf/me/reorder", body);
    return parseApiContractData(data, sellerShelfListDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось изменить порядок полок"));
  }
}

export async function deleteSellerShelf(shelfId: string) {
  try {
    await apiClient.delete(`/seller-shelf/${encodeURIComponent(shelfId)}`);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось удалить полку"));
  }
}

export async function setSellerShelfProducts(shelfId: string, productIds: string[]) {
  const body = setSellerShelfProductsBodySchema.parse({ productIds });
  try {
    const { data } = await apiClient.put(
      `/seller-shelf/${encodeURIComponent(shelfId)}/products`,
      body,
    );
    return parseApiContractData(data, sellerShelfSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось сохранить товары полки"));
  }
}
