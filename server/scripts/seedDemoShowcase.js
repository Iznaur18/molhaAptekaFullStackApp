import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

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
    productDescription: "Настольная лампа со скидкой на время.",
    productPrice: 1990,
    productOldPrice: 3990,
    productCategory: "home",
    imageSeed: "demo-flash-lamp",
    flashSale: true,
  },
  {
    key: "plain-1",
    productName: "Demo · Обычный — рюкзак",
    productDescription: "Городской рюкзак без продвижения.",
    productPrice: 4590,
    productCategory: "fashion",
    imageSeed: "demo-plain-backpack",
  },
  {
    key: "plain-2",
    productName: "Demo · Обычный — чайник",
    productDescription: "Электрочайник 1.7 л.",
    productPrice: 3290,
    productOldPrice: 3990,
    productCategory: "home",
    imageSeed: "demo-plain-kettle",
  },
  {
    key: "plain-3",
    productName: "Demo · Обычный — мышь",
    productDescription: "Беспроводная мышь.",
    productPrice: 1490,
    productCategory: "electronics",
    imageSeed: "demo-plain-mouse",
  },
  {
    key: "plain-4",
    productName: "Demo · Обычный — плед",
    productDescription: "Мягкий плед 150×200.",
    productPrice: 2790,
    productCategory: "home",
    imageSeed: "demo-plain-blanket",
  },
  {
    key: "plain-5",
    productName: "Demo · Обычный — бутылка",
    productDescription: "Спортивная бутылка 750 мл.",
    productPrice: 890,
    productCategory: "sport",
    imageSeed: "demo-plain-bottle",
  },
  {
    key: "plain-6",
    productName: "Demo · Обычный — клавиатура",
    productDescription: "Механическая клавиатура.",
    productPrice: 6990,
    productOldPrice: 8490,
    productCategory: "electronics",
    imageSeed: "demo-plain-keyboard",
  },
];

const TIER_TITLE = {
  [PRODUCT_PROMOTION_TIER_GOLD]: "Золото",
  [PRODUCT_PROMOTION_TIER_TOP]: "ТОП",
  [PRODUCT_PROMOTION_TIER_BANNER]: "Баннер",
};

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

  await ProductPromotionModel.deleteMany({ sellerId: seller._id });
  await RaffleModel.deleteMany({ sellerId: seller._id });
  await ProductModel.deleteMany({ productSeller: seller._id });

  const now = new Date();
  const promoUntil = new Date(now.getTime() + 7 * DAY_MS);
  const flashEnds = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  /** @type {Map<string, import("mongoose").Document>} */
  const createdByKey = new Map();

  for (const item of PRODUCTS) {
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
      productSeller: seller._id,
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
    };

    if (item.flashSale) {
      payload.productFlashSaleEnabled = true;
      payload.productFlashSaleEndsAt = flashEnds;
      payload.productFlashSaleDurationMinutes = 360;
      payload.productFlashSaleBasePrice = item.productOldPrice ?? item.productPrice * 2;
    }

    if (item.promotionTier) {
      payload.catalogPromotionTier = item.promotionTier;
      payload.catalogPromotionActivatedAt = now;
      payload.catalogPromotionExpiresAt = promoUntil;
    }

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

  const summary = {
    sellerEmail: SELLER_EMAIL,
    sellerPassword: SEED_PASSWORD,
    products: PRODUCTS.length,
    raffleId: String(raffle._id),
    promotions: PRODUCTS.filter((p) => p.promotionTier).map((p) => ({
      key: p.key,
      tier: p.promotionTier,
      title: TIER_TITLE[p.promotionTier],
    })),
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
