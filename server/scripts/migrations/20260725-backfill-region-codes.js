import { DEFAULT_VIEWER_REGION_CODE } from "@molha/api-contract";

/**
 * Backfill regionCode / productRegionCode / userRegionCode → Москва.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const code = DEFAULT_VIEWER_REGION_CODE;
  const missingRegion = {
    $or: [{ regionCode: { $exists: false } }, { regionCode: null }, { regionCode: "" }],
  };
  const missingProductRegion = {
    $or: [
      { productRegionCode: { $exists: false } },
      { productRegionCode: null },
      { productRegionCode: "" },
    ],
  };
  const missingUserRegion = {
    $or: [
      { userRegionCode: { $exists: false } },
      { userRegionCode: null },
      { userRegionCode: "" },
    ],
  };

  const products = db.collection("products");
  const raffles = db.collection("raffles");
  const bannerCampaigns = db.collection("siteheaderbannercampaigns");
  const personalCategories = db.collection("sellerpersonalcategories");
  const personalCampaigns = db.collection("sellerpersonalcategorycampaigns");
  const users = db.collection("users");

  const counts = {
    products: await products.countDocuments(missingProductRegion),
    raffles: await raffles.countDocuments(missingRegion),
    bannerCampaigns: await bannerCampaigns.countDocuments(missingRegion),
    personalCategories: await personalCategories.countDocuments(missingRegion),
    personalCampaigns: await personalCampaigns.countDocuments(missingRegion),
    users: await users.countDocuments(missingUserRegion),
  };

  if (!isApply) {
    return { matched: counts, wouldMigrate: counts };
  }

  const [productsRes, rafflesRes, bannersRes, tilesRes, campaignsRes, usersRes] =
    await Promise.all([
      products.updateMany(missingProductRegion, {
        $set: { productRegionCode: code },
      }),
      raffles.updateMany(missingRegion, { $set: { regionCode: code } }),
      bannerCampaigns.updateMany(missingRegion, { $set: { regionCode: code } }),
      personalCategories.updateMany(missingRegion, { $set: { regionCode: code } }),
      personalCampaigns.updateMany(missingRegion, { $set: { regionCode: code } }),
      users.updateMany(missingUserRegion, { $set: { userRegionCode: code } }),
    ]);

  return {
    products: productsRes.modifiedCount,
    raffles: rafflesRes.modifiedCount,
    bannerCampaigns: bannersRes.modifiedCount,
    personalCategories: tilesRes.modifiedCount,
    personalCampaigns: campaignsRes.modifiedCount,
    users: usersRes.modifiedCount,
  };
}
