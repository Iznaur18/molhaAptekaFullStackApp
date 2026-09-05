import {
  FREE_SELLER_DELIVERY_TARIFF,
  PRODUCT_DELIVERY_CARRIER_LOBO,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
  SELLER_FULFILLMENT_DEFAULTS_NOT_SET_MESSAGE,
  SELLER_PAYMENT_METHODS_DEFAULT,
  buildLegacyDeliveryFlags,
  resolveSellerFulfillmentDefaults,
  normalizeSellerDeliveryTariff,
  resolveSellerPaymentMethods,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { ProductModel, UserModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { resolveProductPickupWriteFields } from "../product/productPickupLocations.js";
import { isLoboConfigured } from "../shipping/lobo/loboClient.js";
import { isCarrierAvailable } from "../shipping/shippingCarrierSettings.js";
import {
  LOBO_NOT_CONFIGURED_MESSAGE,
  SHIPPING_CARRIER_DISABLED_MESSAGE,
} from "../../constants/loboConstants.js";

/** Поля профиля, которых хватает и для чтения настроек, и для пересинка. */
export const SELLER_COMMERCE_DEFAULTS_SELECT =
  "sellerFulfillmentDefaults sellerPaymentMethods userRegionCode";

/**
 * Стабильный id точки: он попадает в `pickupLocationIdAtOrder` заказа, и
 * пересоздавать его на каждом сохранении нельзя — покупатель, выбравший точку
 * в корзине, получил бы «Выберите корректную точку самовывоза».
 *
 * @param {number} index
 */
const buildSellerPickupLocationId = (index) => `profile-${index + 1}`;

/**
 * @param {{ sellerFulfillmentDefaults?: unknown; sellerPaymentMethods?: unknown } | null} user
 * @param {number | null} followingProductCount
 */
export function projectSellerCommerceDefaults(user, followingProductCount = null) {
  const fulfillment = resolveSellerFulfillmentDefaults(user);
  return {
    fulfillmentConfigured: fulfillment != null,
    pickupEnabled: fulfillment?.pickupEnabled ?? true,
    deliveryCarrier: fulfillment?.deliveryCarrier ?? "",
    pickupLocations: fulfillment?.pickupLocations ?? [],
    regionCode: fulfillment?.regionCode ?? null,
    deliveryTariff: fulfillment?.deliveryTariff ?? { ...FREE_SELLER_DELIVERY_TARIFF },
    paymentMethods: resolveSellerPaymentMethods(user),
    followingProductCount,
  };
}

/**
 * @param {string} userId
 */
export async function getSellerCommerceDefaults(userId) {
  const user = await UserModel.findById(userId)
    .select(SELLER_COMMERCE_DEFAULTS_SELECT)
    .lean();
  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const followingProductCount = await countProductsFollowingSellerProfile(userId);
  return projectSellerCommerceDefaults(user, followingProductCount);
}

/**
 * @param {string} userId
 */
export function countProductsFollowingSellerProfile(userId) {
  return ProductModel.countDocuments({
    productSeller: userId,
    productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
  });
}

/**
 * Поля товара, вытекающие из настроек профиля.
 *
 * Товар продолжает хранить их у себя: по `productPickupLocation` работает
 * 2dsphere-поиск «рядом», по `productRegionCode` — региональный буст. Чтение
 * из профиля на лету лишило бы Mongo возможности искать.
 *
 * @param {NonNullable<ReturnType<typeof resolveSellerFulfillmentDefaults>>} defaults
 */
export function buildProductFieldsFromSellerDefaults(defaults) {
  const legacyFlags = buildLegacyDeliveryFlags(defaults.deliveryCarrier);
  return {
    productPickupLocations: defaults.pickupLocations,
    productPickupAddress: defaults.productPickupAddress,
    productPickupLat: defaults.productPickupLat,
    productPickupLon: defaults.productPickupLon,
    productPickupLocation: defaults.productPickupLocation,
    productRegionCode: defaults.regionCode,
    productPickupEnabled: defaults.pickupEnabled,
    productDeliveryCarrier: defaults.deliveryCarrier,
    ...legacyFlags,
  };
}

/**
 * Настройки профиля в виде, готовом лечь на товар.
 *
 * Отдельно от `resolveSellerFulfillmentDefaults` из контракта: тот знает
 * только про хранимые поля, а здесь нужны ещё производные — GeoJSON-точка и
 * легаси-скаляры адреса. Ходить за ними в DaData не нужно: точки уже
 * проверены при сохранении профиля.
 *
 * @param {{ sellerFulfillmentDefaults?: unknown } | null} user
 */
export async function resolveSellerDefaultsForProductWrite(user) {
  const defaults = resolveSellerFulfillmentDefaults(user);
  if (!defaults) {
    return null;
  }

  const salePickup = await resolveProductPickupWriteFields(
    { productPickupLocations: defaults.pickupLocations },
    { fallbackRegionCode: defaults.regionCode },
  );

  return {
    ...defaults,
    pickupLocations: salePickup.productPickupLocations,
    productPickupAddress: salePickup.productPickupAddress,
    productPickupLat: salePickup.productPickupLat,
    productPickupLon: salePickup.productPickupLon,
    productPickupLocation: salePickup.productPickupLocation,
    regionCode: salePickup.productRegionCode ?? defaults.regionCode,
  };
}

/**
 * @param {string} userId
 * @returns {Promise<NonNullable<Awaited<ReturnType<typeof resolveSellerDefaultsForProductWrite>>>>}
 */
export async function requireSellerDefaultsForProductWrite(userId) {
  const user = await UserModel.findById(userId)
    .select(SELLER_COMMERCE_DEFAULTS_SELECT)
    .lean();
  const resolved = await resolveSellerDefaultsForProductWrite(user);
  if (!resolved) {
    throw new AppError(400, SELLER_FULFILLMENT_DEFAULTS_NOT_SET_MESSAGE);
  }
  return resolved;
}

/**
 * Один `updateMany` на всё, что следует профилю.
 *
 * Намеренно мимо `patchProduct`: тот при смене `productRegionCode` отправляет
 * товар на повторную модерацию (`CONTENT_PATCH_KEYS`), и переезд продавца на
 * соседнюю улицу снял бы с витрины всю его тысячу карточек.
 *
 * @param {string} userId
 * @param {NonNullable<Awaited<ReturnType<typeof resolveSellerDefaultsForProductWrite>>>} defaults
 */
export async function syncSellerDefaultsToProducts(userId, defaults) {
  const $set = buildProductFieldsFromSellerDefaults(defaults);
  const update = { $set };

  // Точки без координат быть не может (профиль их не принимает), но если
  // GeoJSON всё же пустой — поле надо снять, иначе 2dsphere отвергнет запись.
  if (!$set.productPickupLocation) {
    delete $set.productPickupLocation;
    update.$unset = { productPickupLocation: 1 };
  }

  const result = await ProductModel.updateMany(
    {
      productSeller: userId,
      productFulfillmentSource: PRODUCT_FULFILLMENT_SOURCE_PROFILE,
    },
    update,
  );

  logServerEvent("info", {
    event: "seller_fulfillment_defaults_sync",
    sellerId: String(userId),
    matched: result.matchedCount ?? 0,
    modified: result.modifiedCount ?? 0,
  });

  return {
    matched: result.matchedCount ?? 0,
    modified: result.modifiedCount ?? 0,
  };
}

/**
 * @param {string} carrier
 */
async function assertCarrierUsable(carrier) {
  if (!carrier) {
    return;
  }
  if (carrier === PRODUCT_DELIVERY_CARRIER_LOBO && !isLoboConfigured()) {
    throw new AppError(503, LOBO_NOT_CONFIGURED_MESSAGE);
  }
  if (!(await isCarrierAvailable(carrier))) {
    throw new AppError(409, SHIPPING_CARRIER_DISABLED_MESSAGE);
  }
}

/**
 * Сохранить настройки продавца и разослать их по товарам.
 *
 * @param {{
 *   userId: string;
 *   pickupLocations: Array<{ id?: string; label?: string; address: string; lat: number; lon: number; isDefault?: boolean }>;
 *   pickupEnabled: boolean;
 *   deliveryCarrier: string;
 *   paymentMethods: string[];
 *   regionCode?: string | null;
 *   deliveryTariff?: unknown;
 * }} input
 */
export async function saveSellerCommerceDefaults({
  userId,
  pickupLocations,
  pickupEnabled,
  deliveryCarrier,
  paymentMethods,
  regionCode = null,
  deliveryTariff = null,
}) {
  const carrier = String(deliveryCarrier ?? "").trim();
  // Схема ручки это уже проверила, но сервис зовут и мимо неё (миграции,
  // скрипты), а настройка без способа получения делает товары незаказуемыми.
  if (pickupEnabled === false && !carrier) {
    throw new AppError(400, PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE);
  }
  await assertCarrierUsable(carrier);

  const before = await UserModel.findById(userId)
    .select(SELLER_COMMERCE_DEFAULTS_SELECT)
    .lean();
  if (!before) {
    throw new AppError(404, "Пользователь не найден");
  }

  // Адреса проверяем здесь один раз — при пересинке DaData уже не нужна.
  const salePickup = await resolveProductPickupWriteFields(
    {
      productPickupLocations: pickupLocations.map((item, index) => ({
        id: String(item?.id ?? "").trim() || buildSellerPickupLocationId(index),
        label: item?.label ?? "",
        address: item?.address,
        lat: item?.lat,
        lon: item?.lon,
        isDefault:
          item?.isDefault === true ||
          (pickupLocations.every((row) => row?.isDefault !== true) && index === 0),
      })),
    },
    // Регион с клиента, затем регион профиля — последняя опора, если DaData
    // не отвечает: без региона товар выпадает из регионального буста.
    { fallbackRegionCode: regionCode || before.userRegionCode },
  );

  const storedDefaults = {
    pickupLocations: salePickup.productPickupLocations,
    pickupEnabled: pickupEnabled !== false,
    deliveryCarrier: carrier,
    regionCode: salePickup.productRegionCode ?? "",
    // Тариф хранится только у собственной доставки. Продавец, переключивший
    // перевозчика на курьеров, не должен обнаружить, что его цены ожили
    // при возврате обратно.
    deliveryTariff:
      carrier === PRODUCT_DELIVERY_CARRIER_SELLER
        ? normalizeSellerDeliveryTariff(deliveryTariff)
        : { ...FREE_SELLER_DELIVERY_TARIFF },
    updatedAt: new Date(),
  };

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        sellerFulfillmentDefaults: storedDefaults,
        sellerPaymentMethods:
          Array.isArray(paymentMethods) && paymentMethods.length > 0
            ? paymentMethods
            : [...SELLER_PAYMENT_METHODS_DEFAULT],
      },
    },
    { returnDocument: "after", runValidators: true },
  )
    .select(SELLER_COMMERCE_DEFAULTS_SELECT)
    .lean();

  if (!user) {
    throw new AppError(404, "Пользователь не найден");
  }

  const forProducts = await resolveSellerDefaultsForProductWrite(user);
  const sync = forProducts
    ? await syncSellerDefaultsToProducts(userId, forProducts)
    : { matched: 0, modified: 0 };

  return {
    ...projectSellerCommerceDefaults(user, sync.matched),
    syncedProductCount: sync.modified,
  };
}
