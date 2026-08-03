import {
  resolveRuRegionCodeFromDadataData,
} from "@molha/api-contract";

import {
  geolocateRuAddresses,
  isDadataSuggestConfigured,
} from "../../utils/dadata/dadataClient.js";

/**
 * Backfill productRegionCode from pickup lat/lon via DaData geolocate.
 * Products without coords are left untouched.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");

  const filter = {
    productPickupLat: { $type: "number" },
    productPickupLon: { $type: "number" },
  };

  const matched = await products.countDocuments(filter);

  if (!isDadataSuggestConfigured()) {
    return {
      matched,
      modified: 0,
      skipped: matched,
      reason: "DADATA_API_KEY missing — geolocate unavailable",
    };
  }

  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  const cursor = products.find(filter).project({
    productPickupLat: 1,
    productPickupLon: 1,
    productRegionCode: 1,
  });

  let modified = 0;
  let unresolved = 0;

  for await (const doc of cursor) {
    const lat = Number(doc.productPickupLat);
    const lon = Number(doc.productPickupLon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      unresolved += 1;
      continue;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      unresolved += 1;
      continue;
    }

    let regionCode = null;
    try {
      const suggestions = await geolocateRuAddresses(lat, lon);
      regionCode = resolveRuRegionCodeFromDadataData(suggestions[0]?.data ?? null);
    } catch {
      unresolved += 1;
      continue;
    }

    if (!regionCode) {
      unresolved += 1;
      continue;
    }

    if (String(doc.productRegionCode ?? "").trim() === regionCode) {
      continue;
    }

    const result = await products.updateOne(
      { _id: doc._id },
      { $set: { productRegionCode: regionCode } },
    );
    modified += result.modifiedCount;
  }

  return { matched, modified, unresolved };
}
