/**
 * Перенос `productImageUrl` → `productImageUrls: [url]` и удаление legacy-поля.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");
  const filter = {
    productImageUrl: { $exists: true, $nin: [null, ""] },
    $or: [{ productImageUrls: { $exists: false } }, { productImageUrls: { $eq: [] } }],
  };

  const matched = await products.countDocuments(filter);

  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  const result = await products.updateMany(filter, [
    { $set: { productImageUrls: ["$productImageUrl"] } },
    { $unset: "productImageUrl" },
  ]);

  return { matched, modified: result.modifiedCount };
}
