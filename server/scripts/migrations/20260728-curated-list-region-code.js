import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

/**
 * Backfill CuratedProductList.regionCode → Москва.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const code = DEFAULT_VIEWER_REGION_CODE;
  const curatedLists = db.collection("curatedproductlists");
  const missingRegion = {
    $or: [{ regionCode: { $exists: false } }, { regionCode: null }, { regionCode: "" }],
  };

  const matched = await curatedLists.countDocuments(missingRegion);
  if (!isApply) {
    return {
      matched: { curatedLists: matched },
      wouldMigrate: { curatedLists: matched },
    };
  }

  const result = await curatedLists.updateMany(missingRegion, {
    $set: { regionCode: code },
  });

  return { curatedLists: result.modifiedCount };
}
