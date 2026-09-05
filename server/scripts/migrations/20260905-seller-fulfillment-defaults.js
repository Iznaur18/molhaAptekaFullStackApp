import {
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
  PRODUCT_PICKUP_LOCATIONS_MAX,
  productPickupLocationDuplicateKey,
  productPickupLocationsFromProduct,
  resolveProductDeliveryCarrier,
} from "@molha/api-contract";

/**
 * Посев настроек доставки в профиль продавца.
 *
 * Задача: у продавца с тысячей товаров смена адреса не должна означать тысячу
 * правок. Настройки переезжают в профиль, товары получают
 * `productFulfillmentSource`, и дальше их синхронизирует один `updateMany`.
 *
 * «Умный посев» вместо тотального: в профиль кладём САМУЮ ЧАСТУЮ комбинацию
 * (точки + перевозчик + самовывоз) продавца, а на профиль переводим только те
 * товары, у которых она уже такая. Ни один товар при этом не меняет своих
 * настроек — меняется лишь то, кто ими управляет дальше. У продавца со
 * складами в разных городах товары из «неглавного» города остаются
 * индивидуальными, а не переезжают молча.
 *
 * Товары без `productFulfillmentSource` читаются как `custom` (см.
 * `resolveProductFulfillmentSource`), поэтому явно проставляем поле только
 * победителям — иначе это была бы перезапись всей коллекции ради значения по
 * умолчанию.
 */

const PRODUCT_PROJECTION = {
  productSeller: 1,
  productPickupEnabled: 1,
  productDeliveryCarrier: 1,
  productDeliveryEnabled: 1,
  productCourierDeliveryEnabled: 1,
  productPickupLocations: 1,
  productPickupAddress: 1,
  productPickupLat: 1,
  productPickupLon: 1,
  productRegionCode: 1,
};

const BULK_BATCH_SIZE = 500;

/**
 * Комбинация настроек доставки товара одной строкой.
 *
 * `null` — товар нечего наследовать: без координат точка не пройдёт проверку
 * контракта, и пересинк на ней сломался бы.
 *
 * @param {Record<string, any>} product
 */
function fulfillmentSignature(product) {
  const locations = productPickupLocationsFromProduct(product);
  if (locations.length === 0) {
    return null;
  }
  if (locations.some((item) => item.lat == null || item.lon == null)) {
    return null;
  }
  if (locations.length > PRODUCT_PICKUP_LOCATIONS_MAX) {
    return null;
  }

  const pickupEnabled = product.productPickupEnabled !== false;
  const carrier = resolveProductDeliveryCarrier(product) ?? "";
  if (!pickupEnabled && !carrier) {
    return null;
  }

  const addressKeys = locations
    .map((item) => productPickupLocationDuplicateKey(item.address))
    .sort();

  return `${pickupEnabled ? "1" : "0"}|${carrier}|${addressKeys.join("~")}`;
}

/**
 * @param {Record<string, any>} product
 */
function sellerDefaultsFromProduct(product) {
  const locations = productPickupLocationsFromProduct(product);
  return {
    pickupLocations: locations.map((item, index) => ({
      id: `profile-${index + 1}`,
      label: item.label ?? "",
      address: item.address,
      lat: item.lat,
      lon: item.lon,
      isDefault: item.isDefault === true,
    })),
    pickupEnabled: product.productPickupEnabled !== false,
    deliveryCarrier: resolveProductDeliveryCarrier(product) ?? "",
    regionCode: String(product.productRegionCode ?? "").trim(),
    updatedAt: new Date(),
  };
}

/**
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");
  const users = db.collection("users");

  // Повторный прогон не должен переписывать то, что продавец уже настроил
  // руками: его выбор новее нашей догадки.
  const alreadyConfigured = new Set(
    (
      await users
        .find(
          { "sellerFulfillmentDefaults.pickupLocations.0": { $exists: true } },
          { projection: { _id: 1 } },
        )
        .toArray()
    ).map((row) => String(row._id)),
  );

  /** @type {Map<string, { counts: Map<string, number>; samples: Map<string, Record<string, any>> }>} */
  const bySeller = new Map();

  const scanCursor = products.find({}, { projection: PRODUCT_PROJECTION });
  let scanned = 0;
  for await (const product of scanCursor) {
    const sellerId = String(product.productSeller ?? "");
    if (!sellerId || alreadyConfigured.has(sellerId)) {
      continue;
    }
    const signature = fulfillmentSignature(product);
    if (!signature) {
      continue;
    }
    scanned += 1;

    let entry = bySeller.get(sellerId);
    if (!entry) {
      entry = { counts: new Map(), samples: new Map() };
      bySeller.set(sellerId, entry);
    }
    entry.counts.set(signature, (entry.counts.get(signature) ?? 0) + 1);
    if (!entry.samples.has(signature)) {
      entry.samples.set(signature, product);
    }
  }

  /** @type {Map<string, { signature: string; sample: Record<string, any>; count: number }>} */
  const winners = new Map();
  for (const [sellerId, entry] of bySeller) {
    let best = null;
    for (const [signature, count] of entry.counts) {
      // При равенстве побеждает лексикографически меньшая подпись: результат
      // миграции не должен зависеть от порядка обхода курсора.
      if (!best || count > best.count || (count === best.count && signature < best.signature)) {
        best = { signature, count, sample: entry.samples.get(signature) };
      }
    }
    if (best) {
      winners.set(sellerId, best);
    }
  }

  const wouldFollow = [...winners.values()].reduce((sum, row) => sum + row.count, 0);

  if (!isApply) {
    return {
      scanned,
      sellers: winners.size,
      wouldSeedProfiles: winners.size,
      wouldMigrate: wouldFollow,
      skippedAlreadyConfigured: alreadyConfigured.size,
    };
  }

  let seededProfiles = 0;
  const userOps = [];
  for (const [sellerId, winner] of winners) {
    userOps.push({
      updateOne: {
        filter: { _id: winner.sample.productSeller },
        update: { $set: { sellerFulfillmentDefaults: sellerDefaultsFromProduct(winner.sample) } },
      },
    });
    if (userOps.length >= BULK_BATCH_SIZE) {
      const result = await users.bulkWrite(userOps, { ordered: false });
      seededProfiles += result.modifiedCount ?? 0;
      userOps.length = 0;
    }
    void sellerId;
  }
  if (userOps.length > 0) {
    const result = await users.bulkWrite(userOps, { ordered: false });
    seededProfiles += result.modifiedCount ?? 0;
  }

  let followingProducts = 0;
  let productOps = [];
  const flushProducts = async () => {
    if (productOps.length === 0) {
      return;
    }
    const result = await products.bulkWrite(productOps, { ordered: false });
    followingProducts += result.modifiedCount ?? 0;
    productOps = [];
  };

  const markCursor = products.find({}, { projection: PRODUCT_PROJECTION });
  for await (const product of markCursor) {
    const sellerId = String(product.productSeller ?? "");
    const winner = winners.get(sellerId);
    if (!winner) {
      continue;
    }
    if (fulfillmentSignature(product) !== winner.signature) {
      continue;
    }
    productOps.push({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: { productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE },
        },
      },
    });
    if (productOps.length >= BULK_BATCH_SIZE) {
      await flushProducts();
    }
  }
  await flushProducts();

  return {
    scanned,
    sellers: winners.size,
    seededProfiles,
    followingProducts,
    skippedAlreadyConfigured: alreadyConfigured.size,
  };
}
