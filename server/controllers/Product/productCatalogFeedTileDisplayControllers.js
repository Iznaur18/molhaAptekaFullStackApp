import ProductCatalogFeedTileDisplayModel from "../../models/ProductCatalogFeedTileDisplayModel.js";
import { deleteUploadFileByUrl } from "../../services/upload/deleteUploadFileByUrl.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {import('mongoose').Document | Record<string, unknown> | null | undefined} row
 */
const toFeedTileDisplayPayload = (row) => ({
  tileKey: String(row?.tileKey ?? ""),
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

/** GET /product/catalog-feed-displays */
export async function getProductCatalogFeedTileDisplaysController(_req, res) {
  const rows = await ProductCatalogFeedTileDisplayModel.find().lean();
  successRes(res, {
    displays: rows.map(toFeedTileDisplayPayload),
  });
}

/** PATCH /product/catalog-feed-displays/:tileKey — только admin. */
export async function patchProductCatalogFeedTileDisplayController(req, res) {
  const tileKey = String(req.params.tileKey ?? "").trim();
  const { customLabel, imageUrl, resetCustomLabel, resetImageUrl } = req.body ?? {};

  const existing = await ProductCatalogFeedTileDisplayModel.findOne({
    tileKey,
  }).lean();

  /** @type {Record<string, unknown>} */
  const update = {
    updatedBy: req.userId,
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

  const saved = await ProductCatalogFeedTileDisplayModel.findOneAndUpdate(
    { tileKey },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  successRes(res, {
    display: toFeedTileDisplayPayload(saved),
  });
}
