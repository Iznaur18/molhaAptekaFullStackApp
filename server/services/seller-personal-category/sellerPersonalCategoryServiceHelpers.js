import { isRuRegionCode } from "@molha/api-contract";

import { findSellerPersonalCategoryDuration } from "../../constants/sellerPersonalCategoryConstants.js";
import { AppError } from "../../errors/AppError.js";
import { assertSellerPersonalCategoryImageUrlIsUploadedAsset } from "./validateSellerPersonalCategoryImageUrl.js";

/**
 * @param {Record<string, unknown>} body
 */
export const parseSellerPersonalCategorySubmitBody = (body) => {
  const labelRu = String(body?.labelRu ?? "").trim();
  const imageUrl = String(body?.imageUrl ?? "").trim();
  const tariffCode = String(body?.tariffCode ?? "").trim();
  const regionCode = String(body?.regionCode ?? "").trim();

  if (!labelRu) {
    throw new AppError(400, "Укажите название категории");
  }
  if (!tariffCode) {
    throw new AppError(400, "Выберите срок");
  }
  if (!isRuRegionCode(regionCode)) {
    throw new AppError(400, "Укажите регион из списка");
  }

  try {
    assertSellerPersonalCategoryImageUrlIsUploadedAsset(imageUrl);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "SELLER_PERSONAL_CATEGORY_IMAGE_REQUIRED"
    ) {
      throw new AppError(400, "Загрузите картинку категории");
    }
    if (
      error instanceof Error &&
      error.message === "SELLER_PERSONAL_CATEGORY_IMAGE_URL_INVALID"
    ) {
      throw new AppError(400, "Используйте файл, загруженный через сайт");
    }
    throw error;
  }

  const duration = findSellerPersonalCategoryDuration(tariffCode);
  if (!duration) {
    throw new AppError(400, "Срок не найден");
  }

  return {
    labelRu,
    imageUrl,
    tariffCode,
    regionCode,
    durationHours: duration.durationHours,
    amountPoints: duration.pricePoints,
  };
};
