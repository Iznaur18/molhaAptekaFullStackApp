/**
 * Backfill product rental manage fields.
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");

  const filter = {
    $or: [
      { productRentalEnabled: { $exists: false } },
      { productRentalPriceRub: { $exists: false } },
      { productRentalPriceUnit: { $exists: false } },
    ],
  };

  const matched = await products.countDocuments(filter);
  if (!isApply) {
    return { matched, modified: 0 };
  }

  const result = await products.updateMany(filter, {
    $set: {
      productRentalEnabled: false,
      productRentalPriceRub: null,
      productRentalPriceUnit: "day",
    },
  });

  return {
    matched,
    modified: result.modifiedCount,
  };
}
