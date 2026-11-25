import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { INSTALLMENT_MODERATION_APPROVED } from "../constants/installmentConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import {
  PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_TIER_BANNER,
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
} from "../constants/productPromotionConstants.js";
import { RAFFLE_STATUS_ACTIVE } from "../constants/raffleConstants.js";
import {
  ProductInstallmentProgramModel,
  ProductModel,
  ProductPromotionModel,
  RaffleModel,
  UserModel,
} from "../models/index.js";
import { buildProductSearchBlobFromFields } from "../utils/buildProductSearchBlob.js";
import { seedHardcodedProductCategoryTree } from "../utils/seedProductCategoryTree.js";

const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = "DemoSeedPass12!";
const SELLER_EMAIL = "demo-showcase-seller@seed.local";
const SELLER_USERNAME = "demovitrina";
const REGION = "RU-MOW";
const DAY_MS = 24 * 60 * 60 * 1000;

const PICKUP = {
  id: "demo-pickup",
  label: "Склад",
  address: "Москва, Тверская улица, д. 7",
  lat: 55.757,
  lon: 37.615,
  isDefault: true,
};

/** @param {string} seed */
const img = (seed) => `https://picsum.photos/seed/${seed}/800/800`;

/**
 * Каждый key — отдельный демо-тумблер/продвижение.
 * Взаимоисключающие режимы (flash↔auction, points↔остальные) — на разных товарах.
 */
const PRODUCTS = [
  {
    key: "gold",
    productName: "Demo · Золотое продвижение — наушники",
    productDescription:
      "Беспроводные наушники с шумодавом. На карточке стоит продвижение «Золото» (регион).",
    productPrice: 8990,
    productOldPrice: 11990,
    productCategory: "electronics",
    imageSeed: "demo-gold-headphones",
    promotionTier: PRODUCT_PROMOTION_TIER_GOLD,
  },
  {
    key: "top",
    productName: "Demo · ТОП продвижение — смартфон",
    productDescription:
      "Флагманский смартфон. Продвижение «ТОП» — поднимает карточку глобально.",
    productPrice: 74990,
    productOldPrice: 89990,
    productCategory: "electronics",
    imageSeed: "demo-top-phone",
    promotionTier: PRODUCT_PROMOTION_TIER_TOP,
  },
  {
    key: "banner",
    productName: "Demo · Баннер продвижение — кроссовки",
    productDescription:
      "Кроссовки на широкой баннер-карточке. Продвижение «Баннер» в регионе.",
    productPrice: 12990,
    productOldPrice: 16990,
    productCategory: "fashion",
    imageSeed: "demo-banner-shoes",
    promotionTier: PRODUCT_PROMOTION_TIER_BANNER,
  },
  {
    key: "raffle-a",
    productName: "Demo · Розыгрыш — термокружка",
    productDescription: "Участвует в активном розыгрыше. Купи — получи билет.",
    productPrice: 1290,
    productCategory: "home",
    imageSeed: "demo-raffle-mug",
    joinRaffle: true,
  },
  {
    key: "raffle-b",
    productName: "Demo · Розыгрыш — пауэрбанк",
    productDescription: "Второй товар розыгрыша. Участие по покупке.",
    productPrice: 2490,
    productCategory: "electronics",
    imageSeed: "demo-raffle-powerbank",
    joinRaffle: true,
  },
  {
    key: "flash",
    productName: "Demo · Горящая скидка — лампа",
    productDescription: "Настольная лампа со скидкой на время (горящая скидка).",
    productPrice: 1990,
    productCategory: "home",
    imageSeed: "demo-flash-lamp",
    flashSale: true,
    flashBasePrice: 3990,
  },
  {
    key: "buy-n-free",
    productName: "Demo · Акция +1 — футболка",
    productDescription: "Бесплатно от N (N+1 в подарок): порог 3 покупки.",
    productPrice: 1490,
    productCategory: "fashion",
    imageSeed: "demo-buynfree-tee",
    buyNFree: { threshold: 3 },
  },
  {
    key: "installment",
    productName: "Demo · Рассрочка — планшет",
    productDescription: "Рассрочка включена: одобренная программа с планами 3/6 мес.",
    productPrice: 24990,
    productCategory: "electronics",
    imageSeed: "demo-installment-tablet",
    installment: true,
  },
  {
    key: "auction",
    productName: "Demo · Аукцион — винтажные часы",
    productDescription: "Аукцион включён: покупатели делают ставки (price offers).",
    productPrice: 15990,
    productCategory: "fashion",
    imageSeed: "demo-auction-watch",
    auction: true,
  },
  {
    key: "wholesale",
    productName: "Demo · Опт — блок тетрадей",
    productDescription: "Оптовая цена от 10 шт.",
    productPrice: 890,
    productCategory: "home",
    imageSeed: "demo-wholesale-notebooks",
    wholesale: { minQty: 10, price: 690 },
  },
  {
    key: "rental",
    productName: "Demo · Аренда — проектор",
    productDescription: "Аренда / прокат: 990 ₽/день (продажа тоже доступна).",
    productPrice: 45990,
    productCategory: "electronics",
    imageSeed: "demo-rental-projector",
    rental: { priceRub: 990, unit: "day" },
  },
  {
    key: "affiliate",
    productName: "Demo · Партнёрка — колонка",
    productDescription: "Партнёрская программа: 12% с продажи.",
    productPrice: 5990,
    productOldPrice: 7490,
    productCategory: "electronics",
    imageSeed: "demo-affiliate-speaker",
    affiliate: { percent: 12 },
    loyaltyPointsPerUnit: 50,
  },
  {
    key: "points-sale",
    productName: "Demo · За баллы — стикерпак",
    productDescription:
      "Продажа только за баллы (остальные промо выключены — взаимное исключение).",
    productPrice: 490,
    productCategory: "home",
    imageSeed: "demo-points-stickers",
    pointsSale: { price: 490, perBuyerLimit: 2 },
  },
  {
    key: "qa-return",
    productName: "Demo · Q&A + возврат — коврик",
    productDescription:
      "Включены вопросы к товару и возврат; баллы лояльности с продажи.",
    productPrice: 2190,
    productCategory: "home",
    imageSeed: "demo-qa-mat",
    productQaEnabled: true,
    productReturnEnabled: true,
    loyaltyPointsPerUnit: 30,
  },
  {
    key: "out-of-stock",
    productName: "Demo · Нет в наличии — рюкзак",
    productDescription: "Карточка «нет в наличии» (coming soon).",
    productPrice: 4590,
    productCategory: "fashion",
    imageSeed: "demo-oos-backpack",
    outOfStock: { label: "coming_soon" },
  },
];

const TIER_TITLE = {
  [PRODUCT_PROMOTION_TIER_GOLD]: "Золото",
  [PRODUCT_PROMOTION_TIER_TOP]: "ТОП",
  [PRODUCT_PROMOTION_TIER_BANNER]: "Баннер",
};

/**
 * @param {object} item
 * @param {Date} now
 * @param {Date} flashEnds
 * @param {Date} promoUntil
 */
function buildProductPayload(item, now, flashEnds, promoUntil) {
  const productDescription = item.productDescription;
  const payload = {
    productName: item.productName,
    productDescription,
    productSearchBlob: buildProductSearchBlobFromFields({
      productName: item.productName,
      productDescription,
      productCategory: item.productCategory,
    }),
    productImageUrls: [img(item.imageSeed)],
    productPrice: item.productPrice,
    productOldPrice: item.productOldPrice ?? null,
    productCategory: item.productCategory,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 25,
    productListingOrigin: "own",
    productIsOriginal: true,
    productRegionCode: REGION,
    productSaleCity: "Москва",
    productPickupEnabled: true,
    productDeliveryEnabled: false,
    productPickupLocations: [PICKUP],
    productPickupAddress: PICKUP.address,
    productPickupLat: PICKUP.lat,
    productPickupLon: PICKUP.lon,
    productPickupLocation: {
      type: "Point",
      coordinates: [PICKUP.lon, PICKUP.lat],
    },
    averageRating: 4.2 + Math.random() * 0.7,
    reviewCount: 3 + Math.floor(Math.random() * 40),
    uniqueViewerCount: 50 + Math.floor(Math.random() * 400),
    soldQuantity: Math.floor(Math.random() * 30),
    productQaEnabled: item.productQaEnabled === true,
    productReturnEnabled: item.productReturnEnabled === true,
    loyaltyPointsPerUnit: item.loyaltyPointsPerUnit ?? 0,
  };

  if (item.flashSale) {
    const base = item.flashBasePrice ?? item.productPrice * 2;
    payload.productFlashSaleEnabled = true;
    payload.productFlashSaleEndsAt = flashEnds;
    payload.productFlashSaleDurationMinutes = 360;
    payload.productFlashSaleBasePrice = base;
    payload.productOldPrice = base;
  }

  if (item.buyNFree) {
    payload.productBuyNFreeEnabled = true;
    payload.productBuyNFreeThreshold = item.buyNFree.threshold;
  }

  if (item.auction) {
    payload.productAuctionEnabled = true;
    payload.productAuctionCompletedOnce = false;
  }

  if (item.wholesale) {
    payload.productWholesaleEnabled = true;
    payload.productWholesaleMinQty = item.wholesale.minQty;
    payload.productWholesalePrice = item.wholesale.price;
  }

  if (item.rental) {
    payload.productRentalEnabled = true;
    payload.productRentalPriceRub = item.rental.priceRub;
    payload.productRentalPriceUnit = item.rental.unit;
  }

  if (item.affiliate) {
    payload.affiliateEnabled = true;
    payload.affiliatePercent = item.affiliate.percent;
  }

  if (item.pointsSale) {
    payload.productPointsSaleEnabled = true;
    payload.productPointsPrice = item.pointsSale.price;
    payload.productPointsPerBuyerLimit = item.pointsSale.perBuyerLimit;
  }

  if (item.outOfStock) {
    payload.productOutOfStock = true;
    payload.productOutOfStockLabel = item.outOfStock.label;
  }

  if (item.promotionTier) {
    payload.catalogPromotionTier = item.promotionTier;
    payload.catalogPromotionActivatedAt = now;
    payload.catalogPromotionExpiresAt = promoUntil;
  }

  return payload;
}

/**
 * @param {string} mongoUri
 */
async function seed(mongoUri) {
  await mongoose.connect(mongoUri);
  await seedHardcodedProductCategoryTree();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
  const seller = await UserModel.findOneAndUpdate(
    { email: SELLER_EMAIL },
    {
      $set: {
        email: SELLER_EMAIL,
        passwordHash,
        userName: SELLER_USERNAME,
        userFullName: "Demo Витрина",
        isEmailVerified: true,
        isActiveUser: true,
        isUserDataConfirmed: true,
        userRole: "user",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const sellerProductIds = await ProductModel.find({ productSeller: seller._id })
    .select("_id")
    .lean();
  const productIdList = sellerProductIds.map((p) => p._id);

  await ProductInstallmentProgramModel.deleteMany({
    $or: [{ sellerId: seller._id }, { productId: { $in: productIdList } }],
  });
  await ProductPromotionModel.deleteMany({ sellerId: seller._id });
  await RaffleModel.deleteMany({ sellerId: seller._id });
  await ProductModel.deleteMany({ productSeller: seller._id });

  const now = new Date();
  const promoUntil = new Date(now.getTime() + 7 * DAY_MS);
  const flashEnds = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  /** @type {Map<string, import("mongoose").Document>} */
  const createdByKey = new Map();

  for (const item of PRODUCTS) {
    const payload = buildProductPayload(item, now, flashEnds, promoUntil);
    payload.productSeller = seller._id;

    const product = await ProductModel.create(payload);
    createdByKey.set(item.key, product);

    if (item.promotionTier) {
      await ProductPromotionModel.create({
        productId: product._id,
        sellerId: seller._id,
        status: PRODUCT_PROMOTION_STATUS_ACTIVE,
        tier: item.promotionTier,
        tariffCode: "7d",
        tariffTitle: "7 дней",
        durationHours: 24 * 7,
        amountRub: 199,
        paymentMethod: PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
        amountPoints: 199,
        pointsChargedAt: now,
        activatedAt: now,
        activeUntil: promoUntil,
      });
    }

    if (item.installment) {
      const monthly3 = Math.max(1, Math.ceil(item.productPrice / 3));
      const monthly6 = Math.max(1, Math.ceil(item.productPrice / 6));
      await ProductInstallmentProgramModel.create({
        productId: product._id,
        sellerId: seller._id,
        isEnabled: true,
        moderationStatus: INSTALLMENT_MODERATION_APPROVED,
        wasEverApproved: true,
        reviewedAt: now,
        plans: [
          {
            title: "3 месяца",
            monthsCount: 3,
            monthlyAmountRub: monthly3,
            firstPaymentRequiredNow: true,
          },
          {
            title: "6 месяцев",
            monthsCount: 6,
            monthlyAmountRub: monthly6,
            firstPaymentRequiredNow: true,
          },
        ],
      });
      await ProductModel.updateOne(
        { _id: product._id },
        { $set: { productInstallmentEnabled: true } },
      );
    }
  }

  const raffle = await RaffleModel.create({
    sellerId: seller._id,
    title: "Demo · Розыгрыш AirPods",
    description:
      "Купите участвующие товары — получите билеты. Приз: беспроводные наушники.",
    prizeImageUrl: img("demo-raffle-prize"),
    targetSales: 100,
    salesProgress: 34,
    participantsCount: 18,
    winnersCount: 1,
    regionCode: REGION,
    status: RAFFLE_STATUS_ACTIVE,
    approvedAt: now,
    instagramUrl: "https://instagram.com/demo_showcase",
  });

  const raffleNow = new Date();
  for (const key of ["raffle-a", "raffle-b"]) {
    const product = createdByKey.get(key);
    if (!product) continue;
    await ProductModel.updateOne(
      { _id: product._id },
      {
        $set: {
          activeRaffleId: raffle._id,
          raffleParticipationEnabledAt: raffleNow,
        },
      },
    );
  }

  const flags = PRODUCTS.map((p) => {
    const tags = [];
    if (p.promotionTier) tags.push(`promo:${TIER_TITLE[p.promotionTier]}`);
    if (p.joinRaffle) tags.push("розыгрыш");
    if (p.flashSale) tags.push("горящая скидка");
    if (p.buyNFree) tags.push(`акция +1 (N=${p.buyNFree.threshold})`);
    if (p.installment) tags.push("рассрочка");
    if (p.auction) tags.push("аукцион");
    if (p.wholesale) tags.push("опт");
    if (p.rental) tags.push("аренда");
    if (p.affiliate) tags.push("партнёрка");
    if (p.pointsSale) tags.push("за баллы");
    if (p.productQaEnabled) tags.push("Q&A");
    if (p.productReturnEnabled) tags.push("возврат");
    if (p.outOfStock) tags.push("нет в наличии");
    if (p.loyaltyPointsPerUnit) tags.push(`loyalty=${p.loyaltyPointsPerUnit}`);
    return { key: p.key, tags };
  });

  const summary = {
    sellerEmail: SELLER_EMAIL,
    sellerUsername: SELLER_USERNAME,
    sellerPassword: SEED_PASSWORD,
    products: PRODUCTS.length,
    raffleId: String(raffle._id),
    flags,
  };

  console.log("DEMO_SHOWCASE_READY", JSON.stringify(summary, null, 2));
  await mongoose.disconnect();
}

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI не задан");
  process.exit(1);
}

seed(mongoUri).catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore disconnect errors on crash */
  }
  process.exit(1);
});
