/**
 * Backfill productPickupLocation (GeoJSON Point) from productPickupLat/Lon
 * and ensure sparse 2dsphere index.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");

  const needsBackfill = {
    productPickupLat: { $type: "number" },
    productPickupLon: { $type: "number" },
    $or: [
      { productPickupLocation: { $exists: false } },
      { productPickupLocation: null },
      { "productPickupLocation.type": { $ne: "Point" } },
    ],
  };

  const matched = await products.countDocuments(needsBackfill);

  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  const cursor = products.find(needsBackfill).project({
    productPickupLat: 1,
    productPickupLon: 1,
  });

  let modified = 0;
  for await (const doc of cursor) {
    const lat = Number(doc.productPickupLat);
    const lon = Number(doc.productPickupLon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      continue;
    }
    const result = await products.updateOne(
      { _id: doc._id },
      {
        $set: {
          productPickupLocation: {
            type: "Point",
            coordinates: [lon, lat],
          },
        },
      },
    );
    modified += result.modifiedCount;
  }

  await products.createIndex(
    { productPickupLocation: "2dsphere" },
    { name: "product_pickup_location_2dsphere", sparse: true },
  );

  return { matched, modified };
}
