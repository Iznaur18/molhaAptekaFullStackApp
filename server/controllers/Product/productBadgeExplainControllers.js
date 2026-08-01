import ProductBadgeExplainModel from "../../models/ProductBadgeExplainModel.js";
import { deleteUploadFileByUrl } from "../../services/upload/deleteUploadFileByUrl.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {import('mongoose').Document | Record<string, unknown> | null | undefined} row
 */
const toProductBadgeExplainPayload = (row) => ({
  badgeKey: String(row?.badgeKey ?? ""),
  imageUrl:
    typeof row?.imageUrl === "string" && row.imageUrl.trim()
      ? row.imageUrl.trim()
      : null,
  description:
    typeof row?.description === "string" && row.description.trim()
      ? row.description.trim()
      : null,
  updatedAt: row?.updatedAt ?? null,
});

/** GET /product/badge-explains — публично (детали товара). */
export async function getProductBadgeExplainsController(_req, res) {
  const rows = await ProductBadgeExplainModel.find().lean();
  successRes(res, {
    displays: rows.map(toProductBadgeExplainPayload),
  });
}

/** PATCH /product/badge-explains/:badgeKey — moderator+. */
export async function patchProductBadgeExplainController(req, res) {
  const badgeKey = String(req.params.badgeKey ?? "").trim();
  const { imageUrl, description, resetImageUrl, resetDescription } = req.body ?? {};

  const existing = await ProductBadgeExplainModel.findOne({ badgeKey }).lean();

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

  if (resetDescription === true) {
    update.description = null;
  } else if (description !== undefined) {
    const nextDescription =
      description == null || String(description).trim() === ""
        ? null
        : String(description).trim();
    update.description = nextDescription;
  }

  const saved = await ProductBadgeExplainModel.findOneAndUpdate(
    { badgeKey },
    { $set: update },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();

  successRes(res, {
    display: toProductBadgeExplainPayload(saved),
  });
}
