import { normalizeUploadUrlForStorage } from "@izibuy/shared-lib";

import { AppError } from "../../errors/AppError.js";
import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { deleteUploadFileByUrl } from "../upload/deleteUploadFileByUrl.js";
import {
  resolveProductCategoryDisplayPatchTarget,
  upsertProductCategoryDisplay,
} from "./productCategoryDisplayPatch.js";
import {
  getCategoryTileImagesEnabled,
  setCategoryTileImagesEnabled,
} from "./productCategoryDisplaySettings.js";

/**
 * @param {import('mongoose').Document | Record<string, unknown> | null | undefined} row
 */
const toCategoryDisplayPayload = (row) => ({
  categorySlug:
    typeof row?.categorySlug === "string" && row.categorySlug.trim()
      ? row.categorySlug.trim()
      : null,
  categoryId: row?.categoryId ? String(row.categoryId) : null,
  customLabel:
    typeof row?.customLabel === "string" && row.customLabel.trim()
      ? row.customLabel.trim()
      : null,
  imageUrl:
    typeof row?.imageUrl === "string" && row.imageUrl.trim()
      ? row.imageUrl.trim()
      : null,
  updatedAt: row?.updatedAt ?? null,
});

/**
 * @param {Record<string, unknown> | null | undefined} existing
 * @param {Record<string, unknown>} body
 * @param {string} userId
 */
const buildCategoryDisplayUpdate = async (existing, body, userId) => {
  const { customLabel, imageUrl, resetCustomLabel, resetImageUrl } = body ?? {};

  /** @type {Record<string, unknown>} */
  const update = {
    updatedBy: userId,
  };

  if (resetCustomLabel === true) {
    update.customLabel = null;
  } else if (customLabel !== undefined) {
    const nextLabel =
      customLabel == null || String(customLabel).trim() === ""
        ? null
        : String(customLabel).trim();
    update.customLabel = nextLabel;
  }

  if (resetImageUrl === true) {
    if (existing?.imageUrl) {
      await deleteUploadFileByUrl(existing.imageUrl);
    }
    update.imageUrl = null;
  } else if (imageUrl !== undefined) {
    const raw =
      imageUrl == null || String(imageUrl).trim() === ""
        ? null
        : String(imageUrl).trim();
    const nextUrl = raw ? normalizeUploadUrlForStorage(raw) || null : null;
    if (existing?.imageUrl && nextUrl && existing.imageUrl !== nextUrl) {
      await deleteUploadFileByUrl(existing.imageUrl);
    }
    if (!nextUrl && existing?.imageUrl) {
      await deleteUploadFileByUrl(existing.imageUrl);
    }
    update.imageUrl = nextUrl;
  }

  return update;
};

export async function listProductCategoryDisplays() {
  const [rows, tileImagesEnabled] = await Promise.all([
    ProductCategoryDisplayModel.find().lean(),
    getCategoryTileImagesEnabled(),
  ]);
  return {
    displays: rows.map(toCategoryDisplayPayload),
    tileImagesEnabled,
  };
}

/**
 * @param {{ tileImagesEnabled: unknown; adminId: string }} args
 */
export async function patchProductCategoryDisplaySettings({
  tileImagesEnabled,
  adminId,
}) {
  const enabled = await setCategoryTileImagesEnabled({
    tileImagesEnabled,
    adminId,
  });
  return { tileImagesEnabled: enabled };
}

/**
 * @param {{
 *   categorySlug: string;
 *   body: Record<string, unknown>;
 *   adminId: string;
 * }} args
 */
export async function patchProductCategoryDisplayBySlug({
  categorySlug,
  body,
  adminId,
}) {
  const target = await resolveProductCategoryDisplayPatchTarget({ categorySlug });
  const update = await buildCategoryDisplayUpdate(target.existing, body, adminId);
  const saved = await upsertProductCategoryDisplay({
    categorySlug,
    categoryId: target.categoryId,
    update,
  });
  return { display: toCategoryDisplayPayload(saved) };
}

/**
 * @param {{
 *   categoryId: string;
 *   body: Record<string, unknown>;
 *   adminId: string;
 * }} args
 */
export async function patchProductCategoryDisplayById({ categoryId, body, adminId }) {
  const categoryExists = await ProductCategoryModel.exists({ _id: categoryId });
  if (!categoryExists) {
    throw new AppError(404, "Категория не найдена");
  }

  const target = await resolveProductCategoryDisplayPatchTarget({ categoryId });
  const update = await buildCategoryDisplayUpdate(target.existing, body, adminId);
  const saved = await upsertProductCategoryDisplay({
    categoryId,
    update,
  });
  return { display: toCategoryDisplayPayload(saved) };
}
