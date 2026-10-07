import { z } from "zod";

import { ORDER_PAYMENT_METHODS } from "./order.js";
import { optionalRuRegionCodeFieldSchema } from "./ruRegions.js";
import {
  FREE_SELLER_DELIVERY_TARIFF,
  SELLER_DELIVERY_TARIFF_CARRIER_MESSAGE,
  normalizeSellerDeliveryTariff,
  sellerDeliveryTariffSchema,
} from "./sellerDeliveryTariff.js";
import {
  PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
  productPickupAddressFieldSchema,
  productPickupLatFieldSchema,
  productPickupLonFieldSchema,
} from "./productPickup.js";
import {
  PRODUCT_PICKUP_LOCATIONS_MAX,
  PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE,
  ensureSingleDefaultProductPickupLocation,
  productPickupLocationDuplicateKey,
  productPickupLocationsFromProduct,
} from "./productPickupLocations.js";
import {
  PRODUCT_DELIVERY_CARRIERS,
  PRODUCT_DELIVERY_CARRIER_GITORG,
  PRODUCT_DELIVERY_CARRIER_SELLER,
  productDeliveryCarrierWriteSchema,
  resolveProductDeliveryCarrier,
} from "./productDeliveryCarrier.js";
import {
  SHIPPING_BUYER_REGION_BLOCK_UNKNOWN,
  SHIPPING_BUYER_REGION_UNKNOWN_MESSAGE,
} from "./shippingProvider.js";

/**
 * Откуда товар берёт адрес продажи и перевозчика.
 *
 * `profile` — из настроек продавца: сменил адрес в профиле, и все такие
 * товары переехали одним запросом. `custom` — товар живёт своей жизнью и
 * пересинк его не трогает.
 *
 * Поля адреса при этом остаются НА ТОВАРЕ в обоих случаях: по
 * `productPickupLocation` работает 2dsphere-поиск «рядом со мной», а по
 * `productRegionCode` — региональный буст каталога. Чтение из профиля на лету
 * лишило бы Mongo возможности искать.
 */
export const PRODUCT_FULFILLMENT_SOURCE_PROFILE = "profile";
export const PRODUCT_FULFILLMENT_SOURCE_CUSTOM = "custom";

/** @type {readonly ["profile", "custom"]} */
export const PRODUCT_FULFILLMENT_SOURCES = [
  PRODUCT_FULFILLMENT_SOURCE_PROFILE,
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
];

export const productFulfillmentSourceSchema = z.enum(PRODUCT_FULFILLMENT_SOURCES);

export const SELLER_FULFILLMENT_DEFAULTS_NOT_SET_MESSAGE =
  "Сначала укажите адрес и доставку в профиле продавца — или задайте их для этого товара";

export const SELLER_FULFILLMENT_LOCATIONS_REQUIRED_MESSAGE =
  PRODUCT_PICKUP_LOCATIONS_REQUIRED_MESSAGE;

export const SELLER_PAYMENT_METHODS_REQUIRED_MESSAGE =
  "Выберите хотя бы один способ оплаты, который вы принимаете";

export const SELLER_PAYMENT_METHOD_NOT_ACCEPTED_MESSAGE =
  "Продавец не принимает такой способ оплаты";

export const PRODUCT_FULFILLMENT_SOURCE_PROFILE_CONFLICT_MESSAGE =
  "Товар следует настройкам профиля — свой адрес и доставку для него задавать нельзя";

export const SELLER_DELIVERY_OUT_OF_REGION_MESSAGE =
  "Продавец не доставляет в ваш регион. Выберите самовывоз или другой адрес.";

/** Адрес покупателя в другом регионе, а продавец туда не возит. */
export const SELLER_DELIVERY_REGION_BLOCK_OUT_OF_REGION = "seller_region";

/**
 * Перевозчики, на которых действует «не возить в другие регионы»: своя
 * доставка и курьеры Gitorg. У ЛОБО зона жёсткая и от продавца не зависит,
 * СДЭК и Яндекс везут по стране по договору продавца.
 */
export const SELLER_DELIVERY_REGION_LIMITED_CARRIERS = [
  PRODUCT_DELIVERY_CARRIER_SELLER,
  PRODUCT_DELIVERY_CARRIER_GITORG,
];

/**
 * Возит ли продавец за пределы своего региона.
 *
 * Поля нет у всех, кто настроил профиль раньше, и у тех, кто его не
 * настраивал вовсе, — для них всё остаётся как было: возит.
 *
 * @param {{ sellerFulfillmentDefaults?: { deliveryOutsideRegionEnabled?: boolean | null } | null } | null | undefined} user
 * @returns {boolean}
 */
export function isSellerDeliveryOutsideRegionEnabled(user) {
  return user?.sellerFulfillmentDefaults?.deliveryOutsideRegionEnabled !== false;
}

/**
 * Довезёт ли продавец до адреса покупателя. `null` — довезёт.
 *
 * Регион продажи неизвестен — не режем: запретить доставку из-за дыры в
 * наших данных хуже, чем пропустить заказ, который продавец всё равно видит.
 * А вот неизвестный регион покупателя при включённом ограничении — отказ:
 * иначе ограничение обходится адресом, набранным мимо подсказок.
 *
 * @param {{
 *   deliveryOutsideRegionEnabled: boolean;
 *   carrier: string | null | undefined;
 *   sellerRegionCode: string | null | undefined;
 *   buyerRegionCode: string | null | undefined;
 * }} input
 * @returns {"seller_region" | "buyer_region_unknown" | null}
 */
export function resolveSellerDeliveryRegionBlock({
  deliveryOutsideRegionEnabled,
  carrier,
  sellerRegionCode,
  buyerRegionCode,
}) {
  if (deliveryOutsideRegionEnabled !== false) return null;
  if (!SELLER_DELIVERY_REGION_LIMITED_CARRIERS.includes(String(carrier ?? ""))) {
    return null;
  }
  const zone = String(sellerRegionCode ?? "")
    .trim()
    .toUpperCase();
  if (!zone) return null;
  const buyer = String(buyerRegionCode ?? "")
    .trim()
    .toUpperCase();
  if (!buyer) return SHIPPING_BUYER_REGION_BLOCK_UNKNOWN;
  return zone === buyer ? null : SELLER_DELIVERY_REGION_BLOCK_OUT_OF_REGION;
}

/**
 * @param {string | null | undefined} block — причина из `resolveSellerDeliveryRegionBlock`
 * @returns {string}
 */
export function buildSellerDeliveryRegionBlockMessage(block) {
  return block === SHIPPING_BUYER_REGION_BLOCK_UNKNOWN
    ? SHIPPING_BUYER_REGION_UNKNOWN_MESSAGE
    : SELLER_DELIVERY_OUT_OF_REGION_MESSAGE;
}

/**
 * Продавец, который ничего не выбирал, принимает всё.
 *
 * Пустой массив как «по умолчанию» сломал бы оформление у всех, кто завёлся
 * до появления настройки: заказ падал бы с «не принимает такой способ».
 */
export const SELLER_PAYMENT_METHODS_DEFAULT = [...ORDER_PAYMENT_METHODS];

export const sellerPaymentMethodsFieldSchema = z
  .array(z.enum(ORDER_PAYMENT_METHODS))
  .min(1, SELLER_PAYMENT_METHODS_REQUIRED_MESSAGE)
  .max(ORDER_PAYMENT_METHODS.length)
  .transform((methods) => [
    // Порядок канонический: карточки оплаты на чекауте не должны прыгать
    // от того, в каком порядке продавец натыкал галочки.
    ...ORDER_PAYMENT_METHODS.filter((method) => methods.includes(method)),
  ]);

/**
 * Точка продажи в профиле: тот же формат, что и на товаре, но без `id` —
 * идентификаторы раздаёт сервер, чтобы они были стабильны между пересинками.
 */
export const sellerFulfillmentLocationInputSchema = z.object({
  id: z.string().trim().max(64).optional(),
  label: z
    .union([z.string(), z.null(), z.literal("")])
    .optional()
    .transform((value) =>
      value === undefined || value === null ? "" : String(value).trim().slice(0, 30),
    ),
  address: productPickupAddressFieldSchema,
  lat: productPickupLatFieldSchema,
  lon: productPickupLonFieldSchema,
  isDefault: z.coerce.boolean().optional(),
});

export const sellerFulfillmentLocationsFieldSchema = z
  .array(sellerFulfillmentLocationInputSchema)
  .min(1, SELLER_FULFILLMENT_LOCATIONS_REQUIRED_MESSAGE)
  .max(PRODUCT_PICKUP_LOCATIONS_MAX, `Не больше ${PRODUCT_PICKUP_LOCATIONS_MAX} точек`)
  .superRefine((items, ctx) => {
    const keys = new Set();
    for (const item of items) {
      const key = productPickupLocationDuplicateKey(item.address);
      if (keys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Такой адрес уже добавлен",
        });
      }
      keys.add(key);
    }
  });

/** Body `PUT /sellers/commerce-defaults`. */
export const sellerCommerceDefaultsBodySchema = z
  .object({
    pickupLocations: sellerFulfillmentLocationsFieldSchema,
    /** Покупатель может забрать сам. Адрес нужен всегда — это адрес продажи. */
    pickupEnabled: z.coerce.boolean(),
    /** Пустая строка — «не везём, только самовывоз». */
    deliveryCarrier: productDeliveryCarrierWriteSchema,
    paymentMethods: sellerPaymentMethodsFieldSchema,
    /**
     * Регион, который клиент уже вытащил из подсказки адреса.
     * Сервер пересчитает его сам, но без DaData это единственная опора:
     * товар без региона выпадает из регионального буста каталога.
     */
    regionCode: optionalRuRegionCodeFieldSchema,
    /** Тариф собственной доставки; у остальных перевозчиков не применяется. */
    deliveryTariff: sellerDeliveryTariffSchema.optional(),
    /**
     * Возить ли покупателям из других регионов. Не прислали (старый клиент,
     * мобилка) — сервер оставляет прежнее значение.
     */
    deliveryOutsideRegionEnabled: z.boolean().optional(),
  })
  .superRefine((body, ctx) => {
    // Платный тариф при чужом перевозчике не сработал бы никогда: сумму
    // там называет либо покупатель (курьеры), либо служба. Молча его
    // проглотить — значит пообещать продавцу доход, которого не будет.
    if (
      body.deliveryTariff?.paid === true &&
      body.deliveryCarrier !== PRODUCT_DELIVERY_CARRIER_SELLER
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryTariff"],
        message: SELLER_DELIVERY_TARIFF_CARRIER_MESSAGE,
      });
    }
    if (!body.pickupEnabled && !body.deliveryCarrier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pickupEnabled"],
        message: PRODUCT_FULFILLMENT_METHOD_REQUIRED_MESSAGE,
      });
    }
  });

/** Как настройки продавца приходят обратно клиенту. */
export const sellerCommerceDefaultsDataSchema = z.object({
  fulfillmentConfigured: z.boolean(),
  pickupEnabled: z.boolean(),
  deliveryCarrier: z.string(),
  pickupLocations: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      address: z.string(),
      lat: z.number().nullable(),
      lon: z.number().nullable(),
      isDefault: z.boolean(),
    }),
  ),
  regionCode: z.string().nullable(),
  deliveryTariff: z.object({
    paid: z.boolean(),
    baseFeeRub: z.number(),
    perKmRub: z.number(),
    freeFromRub: z.number(),
  }),
  deliveryOutsideRegionEnabled: z.boolean().default(true),
  paymentMethods: z.array(z.enum(ORDER_PAYMENT_METHODS)),
  /** Сколько товаров сейчас следуют профилю — показываем в предупреждении. */
  followingProductCount: z.number().int().min(0).nullable(),
});

/**
 * Настройки доставки из профиля в нормальном виде.
 *
 * Возвращает `null`, когда продавец их ещё не заводил: без адреса товару
 * нечего наследовать, и форма товара обязана спросить адрес сама.
 *
 * @param {{
 *   sellerFulfillmentDefaults?: {
 *     pickupEnabled?: boolean | null;
 *     deliveryCarrier?: string | null;
 *     pickupLocations?: unknown;
 *     regionCode?: string | null;
 *   } | null;
 * } | null | undefined} user
 */
export function resolveSellerFulfillmentDefaults(user) {
  const raw = user?.sellerFulfillmentDefaults;
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const pickupLocations = ensureSingleDefaultProductPickupLocation(
    productPickupLocationsFromProduct({ productPickupLocations: raw.pickupLocations }),
  );
  if (pickupLocations.length === 0) {
    return null;
  }

  const deliveryCarrier = PRODUCT_DELIVERY_CARRIERS.includes(
    String(raw.deliveryCarrier ?? ""),
  )
    ? String(raw.deliveryCarrier)
    : "";
  const pickupEnabled = raw.pickupEnabled !== false;

  // Настройка без единого способа получения нежизнеспособна: товар по ней
  // нельзя было бы ни забрать, ни получить.
  if (!pickupEnabled && !deliveryCarrier) {
    return null;
  }

  return {
    pickupEnabled,
    deliveryCarrier,
    pickupLocations,
    regionCode: String(raw.regionCode ?? "").trim() || null,
    // Тариф живёт только у собственной доставки: у курьеров и служб он
    // ничего не значит, и хранить его «на всякий случай» — это ждать, что
    // однажды он применится не к тому перевозчику.
    deliveryTariff:
      deliveryCarrier === PRODUCT_DELIVERY_CARRIER_SELLER
        ? normalizeSellerDeliveryTariff(raw.deliveryTariff)
        : { ...FREE_SELLER_DELIVERY_TARIFF },
  };
}

/**
 * Способы оплаты, которые принимает продавец.
 *
 * @param {{ sellerPaymentMethods?: unknown } | null | undefined} user
 * @returns {string[]}
 */
export function resolveSellerPaymentMethods(user) {
  const raw = Array.isArray(user?.sellerPaymentMethods)
    ? user.sellerPaymentMethods
    : [];
  const picked = ORDER_PAYMENT_METHODS.filter((method) => raw.includes(method));
  return picked.length > 0 ? picked : [...SELLER_PAYMENT_METHODS_DEFAULT];
}

/**
 * @param {{ sellerPaymentMethods?: unknown } | null | undefined} user
 * @param {string | null | undefined} method
 */
export function isPaymentMethodAcceptedBySeller(user, method) {
  return resolveSellerPaymentMethods(user).includes(String(method ?? ""));
}

/**
 * @param {{ productFulfillmentSource?: string | null } | null | undefined} product
 * @returns {"profile" | "custom"}
 */
export function resolveProductFulfillmentSource(product) {
  return product?.productFulfillmentSource === PRODUCT_FULFILLMENT_SOURCE_PROFILE
    ? PRODUCT_FULFILLMENT_SOURCE_PROFILE
    : PRODUCT_FULFILLMENT_SOURCE_CUSTOM;
}

/**
 * @param {{ productFulfillmentSource?: string | null } | null | undefined} product
 */
export function productFollowsSellerProfile(product) {
  return (
    resolveProductFulfillmentSource(product) === PRODUCT_FULFILLMENT_SOURCE_PROFILE
  );
}

/**
 * Совпадают ли настройки товара с профильными.
 *
 * Нужно миграции («умный посев») и форме товара, которая показывает, что
 * переключение на профиль ничего не изменит.
 *
 * @param {{
 *   productPickupEnabled?: boolean | null;
 *   productDeliveryCarrier?: string | null;
 *   productDeliveryEnabled?: boolean | null;
 *   productCourierDeliveryEnabled?: boolean | null;
 *   productPickupLocations?: unknown;
 *   productPickupAddress?: unknown;
 *   productPickupLat?: unknown;
 *   productPickupLon?: unknown;
 * } | null | undefined} product
 * @param {ReturnType<typeof resolveSellerFulfillmentDefaults>} defaults
 */
export function productMatchesSellerFulfillmentDefaults(product, defaults) {
  if (!defaults) {
    return false;
  }
  if ((product?.productPickupEnabled !== false) !== defaults.pickupEnabled) {
    return false;
  }
  if ((resolveProductDeliveryCarrier(product) ?? "") !== defaults.deliveryCarrier) {
    return false;
  }

  const productLocations = productPickupLocationsFromProduct(product);
  if (productLocations.length !== defaults.pickupLocations.length) {
    return false;
  }

  const defaultKeys = new Set(
    defaults.pickupLocations.map((item) =>
      productPickupLocationDuplicateKey(item.address),
    ),
  );
  return productLocations.every((item) =>
    defaultKeys.has(productPickupLocationDuplicateKey(item.address)),
  );
}
