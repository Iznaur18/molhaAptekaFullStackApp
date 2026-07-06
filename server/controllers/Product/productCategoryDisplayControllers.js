import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { deleteUploadFileByUrl } from "../../services/upload/deleteUploadFileByUrl.js";
import {
  resolveProductCategoryDisplayPatchTarget,
  upsertProductCategoryDisplay,
} from "../../services/product/productCategoryDisplayPatch.js";
import { errorRes, successRes } from "../../services/http/index.js";
import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";

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
    const nextUrl =
      imageUrl == null || String(imageUrl).trim() === ""
        ? null
        : String(imageUrl).trim();
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

/** GET /product/category-displays — публичные переопределения подписи/картинки категорий. */
export async function getProductCategoryDisplaysController(_req, res) {
  const rows = await ProductCategoryDisplayModel.find().lean();
  successRes(res, {
    displays: rows.map(toCategoryDisplayPayload),
  });
}

/** PATCH /product/category-displays/:categorySlug — только admin. */
export async function patchProductCategoryDisplayController(req, res) {
  const categorySlug = String(req.params.categorySlug ?? "").trim();
  const target = await resolveProductCategoryDisplayPatchTarget({ categorySlug });
  const update = await buildCategoryDisplayUpdate(target.existing, req.body, req.userId);

  const saved = await upsertProductCategoryDisplay({
    categorySlug,
    categoryId: target.categoryId,
    update,
  });

  successRes(res, {
    display: toCategoryDisplayPayload(saved),
  });
}

/** PATCH /product/category-node-displays/:categoryId — только admin. */
export async function patchProductCategoryNodeDisplayController(req, res) {
  const categoryId = String(req.params.categoryId ?? "").trim();
  const categoryExists = await ProductCategoryModel.exists({ _id: categoryId });

  if (!categoryExists) {
    return errorRes(res, 404, "Категория не найдена");
  }

  const target = await resolveProductCategoryDisplayPatchTarget({ categoryId });
  const update = await buildCategoryDisplayUpdate(target.existing, req.body, req.userId);

  const saved = await upsertProductCategoryDisplay({
    categoryId,
    update,
  });

  successRes(res, {
    display: toCategoryDisplayPayload(saved),
  });
}
