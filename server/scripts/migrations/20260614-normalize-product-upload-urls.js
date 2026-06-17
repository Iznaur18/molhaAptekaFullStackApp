import { normalizeStoredUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";

const UPLOAD_PATH_IN_ARRAY_RE = /\/uploads\//i;

/**
 * `http://192.168.x.x:5173/uploads/...` → `/uploads/...` (или CDN из PUBLIC_UPLOAD_BASE_URL).
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");
  const cursor = products.find({
    productImageUrls: { $elemMatch: { $regex: UPLOAD_PATH_IN_ARRAY_RE } },
  });
  const toFix = [];

  for await (const doc of cursor) {
    const urls = Array.isArray(doc.productImageUrls) ? doc.productImageUrls : [];
    const normalized = urls.map((raw) => normalizeStoredUploadUrl(String(raw ?? "").trim()));
    const changed = normalized.some((url, i) => url !== String(urls[i] ?? "").trim());
    if (changed) {
      toFix.push({ _id: doc._id, productImageUrls: normalized });
    }
  }

  if (!isApply) {
    return { matched: toFix.length, wouldMigrate: toFix.length };
  }

  let modified = 0;
  for (const item of toFix) {
    const result = await products.updateOne(
      { _id: item._id },
      { $set: { productImageUrls: item.productImageUrls } },
    );
    if (result.modifiedCount > 0) {
      modified += 1;
    }
  }

  return { matched: toFix.length, modified };
}
