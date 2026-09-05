import mongoose from "mongoose";

import {
  PRODUCT_DESCRIPTION_MAX_CHARS,
  PRODUCT_IMAGE_URLS_MAX,
} from "../constants/productConstants.js";
import { PRODUCT_SALE_CITY_MAX_LENGTH } from "../constants/addressStructuredConstants.js";
import {
  PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
  PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
} from "../constants/productCharacteristicsConstants.js";
import {
  PRODUCT_RETURN_TERM_KEY_MAX_CHARS,
  PRODUCT_RETURN_TERM_VALUE_MAX_CHARS,
} from "../constants/productReturnConstants.js";
import { PRODUCT_LISTING_ORIGIN_VALUES } from "../constants/productListingOriginConstants.js";
import {
  PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
  PRODUCT_PRICE_MARKET_STATUS_VALUES,
} from "../constants/productPriceMarketStatusConstants.js";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_STATUSES,
} from "../constants/productModerationConstants.js";
import {
  ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
  ONEC_EXTERNAL_ID_MAX_LENGTH,
} from "../constants/onecExchangeConstants.js";
import {
  PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
  PRODUCT_FULFILLMENT_SOURCES,
} from "@molha/api-contract";
import { ProductPromoCodeSchema } from "./ProductPromoCodeSubschema.js";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    productName: { type: String, required: true },
    productSearchBlob: {
      type: String,
      default: "",
      trim: true,
    },
    productDescription: {
      type: String,
      trim: true,
      maxlength: PRODUCT_DESCRIPTION_MAX_CHARS,
    },
    productCharacteristics: {
      type: [
        {
          key: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS,
          },
          value: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_CHARACTERISTIC_VALUE_MAX_CHARS,
          },
        },
      ],
      default: [],
    },
    productListingOrigin: {
      type: String,
      enum: PRODUCT_LISTING_ORIGIN_VALUES,
      required: false,
    },
    productPriceMarketStatus: {
      type: String,
      enum: PRODUCT_PRICE_MARKET_STATUS_VALUES,
      default: PRODUCT_PRICE_MARKET_STATUS_DEFAULT,
    },
    productIsOriginal: {
      type: Boolean,
      default: false,
    },
    productOutOfStock: {
      type: Boolean,
      default: false,
    },
    productOutOfStockLabel: {
      type: String,
      enum: ["out_of_stock", "coming_soon"],
      default: "out_of_stock",
    },
    productReturnEnabled: {
      type: Boolean,
      default: false,
    },
    productReturnTerms: {
      type: [
        {
          key: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_RETURN_TERM_KEY_MAX_CHARS,
          },
          value: {
            type: String,
            required: true,
            trim: true,
            maxlength: PRODUCT_RETURN_TERM_VALUE_MAX_CHARS,
          },
        },
      ],
      default: [],
    },
    productImageUrls: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length <= PRODUCT_IMAGE_URLS_MAX;
        },
        message: `Не более ${PRODUCT_IMAGE_URLS_MAX} изображений`,
      },
    },
    productPreviewVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    productInstagramPostUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    productPrice: { type: Number, required: true },
    productOldPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    productFlashSaleEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    productFlashSaleEndsAt: {
      type: Date,
      default: null,
      index: true,
    },
    /** Исходная длительность горящей скидки в минутах — для UI-прогресса. */
    productFlashSaleDurationMinutes: {
      type: Number,
      default: null,
      min: 1,
    },
    /** Базовая цена до горящей скидки — для восстановления по истечении. */
    productFlashSaleBasePrice: {
      type: Number,
      default: null,
      min: 0,
    },
    productLastApprovedDiscountPercent: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    productSeller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /**
     * Ид номенклатуры в 1С (источник истины при интеграции).
     * У торговых предложений CommerceML это `ИдТовара#ИдХарактеристики` — два
     * GUID'а через `#`, поэтому лимит выше длины одного GUID.
     */
    product1cGuid: {
      type: String,
      default: null,
      trim: true,
      maxlength: ONEC_EXTERNAL_ID_MAX_LENGTH,
    },
    /**
     * Ид группы номенклатуры 1С, в которой лежит товар. Нужен, чтобы после
     * правки сопоставления категорий в кабинете перевесить уже импортированные
     * карточки, не дожидаясь следующего обмена.
     */
    product1cGroupId: {
      type: String,
      default: null,
      trim: true,
      maxlength: ONEC_CATEGORY_EXTERNAL_ID_MAX_LENGTH,
    },
    /** Артикул / код номенклатуры (опционально). */
    productArticle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 64,
    },
    /** Товар создан/ведётся из обмена с 1С. */
    productFromOneC: {
      type: Boolean,
      default: false,
      index: true,
    },
    /**
     * Когда карточку последний раз видели в выгрузке 1С.
     *
     * После полной выгрузки каталога снимаем с витрины всё, чья метка старше
     * начала обмена. Список из десятков тысяч `$nin`-GUID'ов Mongo не осилит,
     * а метка времени укладывается в обычный индексный запрос.
     */
    product1cSeenAt: {
      type: Date,
      default: null,
    },
    /**
     * MD5 исходников картинок, уже залитых из 1С, в порядке `productImageUrls`.
     * 1С кладёт в каждый архив весь `import_files/` заново — без сверки хэшей
     * S3 копил бы дубликат каталога на каждый обмен.
     */
    product1cImageHashes: {
      type: [String],
      default: [],
    },
    productSaleCity: {
      type: String,
      trim: true,
      default: "",
      maxlength: PRODUCT_SALE_CITY_MAX_LENGTH,
      index: true,
    },
    productSaleCityNormalized: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    productRegionCode: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    /** Адрес точки самовывоза (текст). Sync из default в productPickupLocations. */
    productPickupAddress: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    productPickupLat: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    productPickupLon: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
    /** GeoJSON Point [lon, lat] — для каталога «Рядом» ($geoNear / 2dsphere). Default-точка. */
    productPickupLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    /**
     * Точки самовывоза / отправления (покупатель выбирает при checkout).
     * Legacy scalars синхронизируются с isDefault.
     */
    productPickupLocations: {
      type: [
        {
          id: { type: String, required: true, trim: true, maxlength: 64 },
          label: { type: String, trim: true, default: "", maxlength: 30 },
          address: { type: String, required: true, trim: true, maxlength: 100 },
          lat: { type: Number, required: true, min: -90, max: 90 },
          lon: { type: Number, required: true, min: -180, max: 180 },
          isDefault: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    /** Доставка продавцом. */
    productDeliveryEnabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Доставку выполняют свободные курьеры Gitorg.
     *
     * Взаимоисключающе с `productDeliveryEnabled`: либо продавец везёт сам,
     * либо отдаёт курьеру. Дефолт `false` намеренно — у существующих товаров
     * с доставкой продавец возит сам, и отдавать их чужим людям без его
     * ведома нельзя.
     */
    productCourierDeliveryEnabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Кто везёт товар: продавец, курьеры Gitorg или служба вроде ЛОБО.
     *
     * Источник правды с появлением третьего перевозчика; два флага выше
     * остаются производными для существующего кода. Пусто — доставки нет.
     */
    productDeliveryCarrier: {
      type: String,
      trim: true,
      default: "",
    },
    /** Самовывоз доступен покупателю (по умолчанию да). */
    productPickupEnabled: {
      type: Boolean,
      default: true,
    },
    /**
     * Откуда взяты адрес продажи и перевозчик: из профиля продавца или свои.
     *
     * Поля выше при этом заполнены в обоих случаях — по ним ищет каталог
     * (`productPickupLocation` 2dsphere, `productRegionCode`). Флаг решает
     * только одно: перепишет ли их пересинк, когда продавец поменяет профиль.
     *
     * Дефолт `custom` намеренно: старый клиент, приславший адрес и ничего не
     * знающий про профиль, не должен получить товар, который завтра молча
     * переедет в другой город.
     */
    productFulfillmentSource: {
      type: String,
      enum: PRODUCT_FULFILLMENT_SOURCES,
      default: PRODUCT_FULFILLMENT_SOURCE_CUSTOM,
    },
    /** Тумблер «Вопросы и ответы» на карточке товара. */
    productQaEnabled: {
      type: Boolean,
      default: false,
    },
    /** Кол-во активных (pending+answered) вопросов; страж лимита на товар. */
    productQuestionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    productCategory: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    productCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
      index: true,
    },
    sellerPersonalCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SellerPersonalCategory",
      default: null,
      index: true,
    },
    /** Полка витрины продавца (свои разделы на /seller/:id). */
    sellerShelfId: {
      type: Schema.Types.ObjectId,
      ref: "SellerShelf",
      default: null,
      index: true,
    },
    categoryPathIds: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    categoryBreadcrumbRu: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    productIsAvailable: {
      type: Boolean,
      default: true,
    },
    productStockQuantity: {
      type: Number,
      default: 0,
      min: 0,
      max: 9999,
    },
    // Точка сериализации параллельных заказов по одному товару: инкрементируется
    // внутри транзакции создания заказа, чтобы конкурентные транзакции конфликтовали
    // (write-conflict) и перепроверяли доступный остаток на свежем снапшоте. Так
    // закрывается TOCTOU-гонка оверселла (два заказа на последнюю единицу).
    stockReserveGuardTick: {
      type: Number,
      default: 0,
    },
    productAuctionEnabled: {
      type: Boolean,
      default: false,
    },
    productAuctionCompletedOnce: {
      type: Boolean,
      default: false,
    },
    productModerationStatus: {
      type: String,
      enum: PRODUCT_MODERATION_STATUSES,
      default: PRODUCT_MODERATION_APPROVED,
    },
    productModerationComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    uniqueViewerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    productWishlistCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    catalogPromotionTier: {
      type: Number,
      default: null,
      min: 1,
      max: 3,
    },
    catalogPromotionActivatedAt: {
      type: Date,
      default: null,
    },
    catalogPromotionExpiresAt: {
      type: Date,
      default: null,
    },
    activeRaffleId: {
      type: Schema.Types.ObjectId,
      ref: "Raffle",
      default: null,
      index: true,
    },
    raffleParticipationEnabledAt: {
      type: Date,
      default: null,
    },
    productInstallmentEnabled: {
      type: Boolean,
      default: false,
    },
    productWholesaleEnabled: {
      type: Boolean,
      default: false,
    },
    productWholesaleMinQty: {
      type: Number,
      default: null,
      min: 2,
      max: 9999,
    },
    productWholesalePrice: {
      type: Number,
      default: null,
      min: 1,
    },
    /** «Бесплатно от N»: N завершённых платных заказов → 1 шт. бесплатно. */
    productBuyNFreeEnabled: {
      type: Boolean,
      default: false,
    },
    productBuyNFreeThreshold: {
      type: Number,
      default: null,
      min: 2,
      max: 10,
    },
    /** Аренда / прокат: тумблер в управлении (продажа не блокируется). */
    productRentalEnabled: {
      type: Boolean,
      default: false,
    },
    productRentalPriceRub: {
      type: Number,
      default: null,
      min: 1,
    },
    productRentalPriceUnit: {
      type: String,
      enum: ["hour", "day"],
      default: "day",
    },
    loyaltyPointsPerUnit: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** Партнёрская услуга на объявлении: % шареру с продажи. */
    affiliateEnabled: {
      type: Boolean,
      default: false,
    },
    affiliatePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },
    /** Промокоды продавца на товар (коды не отдаём в публичный API). */
    productPromoCodes: {
      type: [ProductPromoCodeSchema],
      default: [],
    },
    productHasActivePromoCodes: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

ProductSchema.index({ productSearchBlob: 1 });
ProductSchema.index({ categoryPathIds: 1 });
ProductSchema.index(
  { productPickupLocation: "2dsphere" },
  { name: "product_pickup_location_2dsphere", sparse: true },
);

/** GET /product — одобренные, в наличии, сортировка по дате / бусту. */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productIsAvailable: 1,
    productStockQuantity: 1,
    catalogPromotionActivatedAt: -1,
    catalogPromotionExpiresAt: -1,
    createdAt: -1,
  },
  { name: "catalog_approved_list" },
);

/** Каталог по подкатегории (`productCategoryId` $in). */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productCategoryId: 1,
    productIsAvailable: 1,
    createdAt: -1,
  },
  { name: "catalog_approved_category" },
);

/** GET /product/moderation/pending — FIFO. */
ProductSchema.index(
  { productModerationStatus: 1, createdAt: 1 },
  { name: "moderation_status_created_asc" },
);

/** GET /product/my — товары продавца. */
ProductSchema.index(
  { productSeller: 1, productModerationStatus: 1, createdAt: -1 },
  { name: "seller_moderation_created" },
);

/**
 * Пересинк настроек доставки из профиля: один updateMany на все товары
 * продавца, следующие профилю. Без индекса это был бы COLLSCAN на каждое
 * сохранение профиля.
 */
ProductSchema.index(
  { productSeller: 1, productFulfillmentSource: 1 },
  { name: "seller_fulfillment_source" },
);

/** Маппинг номенклатуры 1С ↔ Product (уникален в рамках продавца). */
ProductSchema.index(
  { productSeller: 1, product1cGuid: 1 },
  {
    unique: true,
    name: "seller_onec_guid_unique",
    partialFilterExpression: {
      product1cGuid: { $type: "string" },
    },
  },
);

/** Снятие с витрины того, что исчезло из полной выгрузки 1С. */
ProductSchema.index(
  { productSeller: 1, productFromOneC: 1, product1cSeenAt: 1 },
  { name: "seller_onec_seen_at" },
);

/** Перевешивание карточек при правке сопоставления категорий 1С. */
ProductSchema.index(
  { productSeller: 1, product1cGroupId: 1 },
  {
    name: "seller_onec_group",
    partialFilterExpression: {
      product1cGroupId: { $type: "string" },
    },
  },
);

/** Каталог sort=purchases — без $lookup orders. */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productIsAvailable: 1,
    productStockQuantity: 1,
    soldQuantity: -1,
    createdAt: -1,
  },
  { name: "catalog_approved_sold_quantity" },
);

/** Каталог sort=reviews — товары с отзывами по рейтингу. */
ProductSchema.index(
  {
    productModerationStatus: 1,
    productIsAvailable: 1,
    productStockQuantity: 1,
    averageRating: -1,
    reviewCount: -1,
    createdAt: -1,
  },
  { name: "catalog_approved_reviews" },
);

export { ProductSchema };

export default mongoose.model("Product", ProductSchema);
