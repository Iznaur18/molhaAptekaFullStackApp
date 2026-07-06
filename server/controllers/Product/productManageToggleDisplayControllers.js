import ProductManageToggleDisplayModel from "../../models/ProductManageToggleDisplayModel.js";
import { deleteUploadFileByUrl } from "../../services/upload/deleteUploadFileByUrl.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {import('mongoose').Document | Record<string, unknown> | null | undefined} row
 */
const toManageToggleDisplayPayload = (row) => ({
  toggleKey: String(row?.toggleKey ?? ""),
  imageUrl:
    typeof row?.imageUrl === "string" && row.imageUrl.trim()
      ? row.imageUrl.trim()
      : null,
  updatedAt: row?.updatedAt ?? null,
});

/** GET /product/manage-toggle-displays */
export async function getProductManageToggleDisplaysController(_req, res) {
  const rows = await ProductManageToggleDisplayModel.find().lean();
  successRes(res, {
    displays: rows.map(toManageToggleDisplayPayload),
  });
}

/** PATCH /product/manage-toggle-displays/:toggleKey — только admin. */
export async function patchProductManageToggleDisplayController(req, res) {
  const toggleKey = String(req.params.toggleKey ?? "").trim();
  const { imageUrl, resetImageUrl } = req.body ?? {};

  const existing = await ProductManageToggleDisplayModel.findOne({
    toggleKey,
  }).lean();

  /** @type {Record<string, unknown>} */
  const update = {
    updatedBy: req.userId,
  };

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

  const saved = await ProductManageToggleDisplayModel.findOneAndUpdate(
    { toggleKey },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  successRes(res, {
    display: toManageToggleDisplayPayload(saved),
  });
}
