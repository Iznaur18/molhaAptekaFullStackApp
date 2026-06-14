import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import type {
  ProductCategoryAdminRow,
  ProductCategoryAdminWritePayload,
} from "../model/adminTypes";

export const createProductCategoryAdmin = async (
  payload: ProductCategoryAdminWritePayload,
): Promise<ProductCategoryAdminRow> => {
  try {
    const { data } = await apiClient.post("/product/admin/categories", payload);
    if (!data?.success || !data.data?.category) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.category as ProductCategoryAdminRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось создать категорию"));
  }
};

export const patchProductCategoryAdmin = async (
  categoryId: string,
  payload: Partial<ProductCategoryAdminWritePayload>,
): Promise<ProductCategoryAdminRow> => {
  try {
    const { data } = await apiClient.patch(
      `/product/admin/categories/${categoryId}`,
      payload,
    );
    if (!data?.success || !data.data?.category) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.category as ProductCategoryAdminRow;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось обновить категорию"));
  }
};

export type DeleteProductCategoryOptions = {
  reassignProductCategoryId?: string;
  detachProducts?: boolean;
};

export const deleteProductCategoryAdmin = async (
  categoryId: string,
  options: DeleteProductCategoryOptions = {},
) => {
  try {
    const reassignProductCategoryId = String(options.reassignProductCategoryId ?? "").trim();
    const detachProducts = options.detachProducts === true;
    const payload =
      reassignProductCategoryId || detachProducts
        ? {
            ...(reassignProductCategoryId ? { reassignProductCategoryId } : {}),
            ...(detachProducts ? { detachProducts: true } : {}),
          }
        : undefined;

    const { data } = await apiClient.delete(
      `/product/admin/categories/${categoryId}`,
      payload ? { data: payload } : undefined,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось удалить категорию"));
  }
};
