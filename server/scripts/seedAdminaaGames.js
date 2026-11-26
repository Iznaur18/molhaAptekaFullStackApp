/**
 * Dev-сид: у adminaa
 *  - 6 витринных товаров + «Колесо» / «Коробка»
 *  - те же тумблеры продвижений, что у demovitrina
 *    (рассрочка, аукцион, горящая скидка, +1, опт, аренда, …)
 *
 *   MONGO_URI=... node scripts/seedAdminaaGames.js
 *   npm run seed:adminaa-games
 */
import "dotenv/config";
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
  SellerFortuneWheelConfigModel,
  SellerLuckyBoxConfigModel,
  UserModel,
} from "../models/index.js";
import { buildProductSearchBlobFromFields } from "../utils/buildProductSearchBlob.js";

const SELLER_USERNAME = "adminaa";
const REGION = "RU-MOW";
const GAMES_PREFIX = "Adminaa · Игры —";
const PROMO_PREFIX = "Adminaa ·";
const DAY_MS = 24 * 60 * 60 * 1000;

const PICKUP = {
  id: "adminaa-pickup",
  label: "Склад",
  address: "Москва, Арбат, д. 10",
  lat: 55.752,
  lon: 37.593,
  isDefault: true,
};

const img = (seed) => `https://picsum.photos/seed/${seed}/800/800`;

const GAMES_PRODUCTS = [
  {
    key: "wheel-mug",
    productName: `${GAMES_PREFIX} кружка (приз колеса)`,
    productDescription: "Товар-приз для секции колеса фортуны.",
    productPrice: 790,
    productCategory: "home",
    imageSeed: "adminaa-wheel-mug",
  },
  {
    key: "wheel-powerbank",
    productName: `${GAMES_PREFIX} пауэрбанк (приз колеса)`,
    productDescription: "Товар-приз для секции колеса фортуны.",
    productPrice: 1490,
    productCategory: "electronics",
    imageSeed: "adminaa-wheel-powerbank",
  },
  {
    key: "box-sticker",
    productName: `${GAMES_PREFIX} стикерпак (приз коробки)`,
    productDescription: "Товар-приз для коробок удачи.",
    productPrice: 390,
    productCategory: "fashion",
    imageSeed: "adminaa-box-sticker",
  },
  {
    key: "box-lamp",
    productName: `${GAMES_PREFIX} лампа (приз коробки)`,
    productDescription: "Товар-приз для коробок удачи.",
    productPrice: 2190,
    productCategory: "home",
    imageSeed: "adminaa-box-lamp",
  },
  {
    key: "shop-tee",
    productName: `${GAMES_PREFIX} футболка (витрина)`,
    productDescription: "Обычный товар витрины — на нём тестируй скидку из игр.",
    productPrice: 1590,
    productOldPrice: 1990,
    productCategory: "fashion",
    imageSeed: "adminaa-shop-tee",
  },
  {
    key: "shop-headphones",
    productName: `${GAMES_PREFIX} наушники (витрина)`,
    productDescription: "Обычный товар витрины — на нём тестируй скидку из игр.",
    productPrice: 4990,
    productOldPrice: 6490,
    productCategory: "electronics",
    imageSeed: "adminaa-shop-headphones",
  },
];

/**
 * Взаимоисключающие режимы (flash↔auction, points↔остальные) — на разных товарах.
 * Паритет с seedDemoShowcase / demovitrina.
 */
const PROMO_PRODUCTS = [
  {
    key: "gold",
    productName: `${PROMO_PREFIX} Золотое продвижение — наушники`,
    productDescription: "Продвижение «Золото» (регион).",
    productPrice: 8990,
    productOldPrice: 11990,
    productCategory: "electronics",
    imageSeed: "adminaa-gold-headphones",
    promotionTier: PRODUCT_PROMOTION_TIER_GOLD,
  },
  {
    key: "top",
    productName: `${PROMO_PREFIX} ТОП продвижение — смартфон`,
    productDescription: "Продвижение «ТОП» — поднимает карточку глобально.",
    productPrice: 74990,
    productOldPrice: 89990,
    productCategory: "electronics",
    imageSeed: "adminaa-top-phone",
    promotionTier: PRODUCT_PROMOTION_TIER_TOP,
  },
  {
    key: "banner",
    productName: `${PROMO_PREFIX} Баннер продвижение — кроссовки`,
    productDescription: "Продвижение «Баннер» в регионе.",
    productPrice: 12990,
    productOldPrice: 16990,
    productCategory: "fashion",
    imageSeed: "adminaa-banner-shoes",
    promotionTier: PRODUCT_PROMOTION_TIER_BANNER,
  },
  {
    key: "raffle-a",
    productName: `${PROMO_PREFIX} Розыгрыш — термокружка`,
    productDescription: "Участвует в активном розыгрыше.",
    productPrice: 1290,
    productCategory: "home",
    imageSeed: "adminaa-raffle-mug",
    joinRaffle: true,
  },
  {
    key: "raffle-b",
    productName: `${PROMO_PREFIX} Розыгрыш — пауэрбанк`,
    productDescription: "Второй товар розыгрыша.",
    productPrice: 2490,
    productCategory: "electronics",
    imageSeed: "adminaa-raffle-powerbank",
    joinRaffle: true,
  },
  {
    key: "flash",
    productName: `${PROMO_PREFIX} Горящая скидка — лампа`,
    productDescription: "Горящая скидка на время.",
    productPrice: 1990,
    productCategory: "home",
    imageSeed: "adminaa-flash-lamp",
    flashSale: true,
    flashBasePrice: 3990,
  },
  {
    key: "buy-n-free",
    productName: `${PROMO_PREFIX} Акция +1 — футболка`,
    productDescription: "Бесплатно от N (порог 3).",
    productPrice: 1490,
    productCategory: "fashion",
    imageSeed: "adminaa-buynfree-tee",
    buyNFree: { threshold: 3 },
  },
  {
    key: "installment",
    productName: `${PROMO_PREFIX} Рассрочка — планшет`,
    productDescription: "Рассрочка: одобренная программа 3/6 мес.",
    productPrice: 24990,
    productCategory: "electronics",
    imageSeed: "adminaa-installment-tablet",
    installment: true,
  },
  {
    key: "auction",
    productName: `${PROMO_PREFIX} Аукцион — винтажные часы`,
    productDescription: "Аукцион: ставки / price offers.",
    productPrice: 15990,
    productCategory: "fashion",
    imageSeed: "adminaa-auction-watch",
    auction: true,
  },
  {
    key: "wholesale",
    productName: `${PROMO_PREFIX} Опт — блок тетрадей`,
    productDescription: "Оптовая цена от 10 шт.",
    productPrice: 890,
    productCategory: "home",
    imageSeed: "adminaa-wholesale-notebooks",
    wholesale: { minQty: 10, price: 690 },
  },
  {
    key: "rental",
    productName: `${PROMO_PREFIX} Аренда — проектор`,
    productDescription: "Аренда 990 ₽/день.",
    productPrice: 45990,
    productCategory: "electronics",
    imageSeed: "adminaa-rental-projector",
    rental: { priceRub: 990, unit: "day" },
  },
  {
    key: "affiliate",
    productName: `${PROMO_PREFIX} Партнёрка — колонка`,
    productDescription: "Партнёрка 12% + loyalty.",
    productPrice: 5990,
    productOldPrice: 7490,
    productCategory: "electronics",
    imageSeed: "adminaa-affiliate-speaker",
    affiliate: { percent: 12 },
    loyaltyPointsPerUnit: 50,
  },
  {
    key: "points-sale",
    productName: `${PROMO_PREFIX} За баллы — стикерпак`,
    productDescription: "Только за баллы.",
    productPrice: 490,
    productCategory: "home",
    imageSeed: "adminaa-points-stickers",
    pointsSale: { price: 490, perBuyerLimit: 2 },
  },
  {
    key: "qa-return",
    productName: `${PROMO_PREFIX} Q&A + возврат — коврик`,
    productDescription: "Q&A и возврат включены.",
    productPrice: 2190,
    productCategory: "home",
    imageSeed: "adminaa-qa-mat",
    productQaEnabled: true,
    productReturnEnabled: true,
    loyaltyPointsPerUnit: 30,
  },
  {
    key: "out-of-stock",
    productName: `${PROMO_PREFIX} Нет в наличии — рюкзак`,
    productDescription: "Карточка «нет в наличии».",
    productPrice: 4590,
    productCategory: "fashion",
    imageSeed: "adminaa-oos-backpack",
    outOfStock: { label: "coming_soon" },
  },
];

function buildBasePayload(item, sellerId) {
  return {
    productName: item.productName,
    productDescription: item.productDescription,
    productSearchBlob: buildProductSearchBlobFromFields({
      productName: item.productName,
      productDescription: item.productDescription,
      productCategory: item.productCategory,
    }),
    productImageUrls: [img(item.imageSeed)],
    productPrice: item.productPrice,
    productOldPrice: item.productOldPrice ?? null,
    productCategory: item.productCategory,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    productIsAvailable: true,
    productStockQuantity: 50,
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
    productSeller: sellerId,
    averageRating: 4.6,
    reviewCount: 12,
    uniqueViewerCount: 120,
    soldQuantity: 4,
    productQaEnabled: item.productQaEnabled === true,
    productReturnEnabled: item.productReturnEnabled === true,
    loyaltyPointsPerUnit: item.loyaltyPointsPerUnit ?? 0,
  };
}

function applyPromoFlags(payload, item, now, flashEnds, promoUntil) {
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

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI не задан");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const seller = await UserModel.findOne({ userName: SELLER_USERNAME }).select(
    "_id email userName userRole",
  );
  if (!seller) {
    console.error(`Пользователь ${SELLER_USERNAME} не найден`);
    process.exit(1);
  }

  const existingIds = await ProductModel.find({ productSeller: seller._id })
    .select("_id")
    .lean();
  const existingIdList = existingIds.map((p) => p._id);

  await ProductInstallmentProgramModel.deleteMany({
    $or: [{ sellerId: seller._id }, { productId: { $in: existingIdList } }],
  });
  await ProductPromotionModel.deleteMany({ sellerId: seller._id });
  await RaffleModel.deleteMany({ sellerId: seller._id });
  await ProductModel.deleteMany({ productSeller: seller._id });

  const now = new Date();
  const promoUntil = new Date(now.getTime() + 7 * DAY_MS);
  const flashEnds = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  /** @type {Map<string, import("mongoose").Types.ObjectId>} */
  const idsByKey = new Map();

  for (const item of GAMES_PRODUCTS) {
    const product = await ProductModel.create(buildBasePayload(item, seller._id));
    idsByKey.set(item.key, product._id);
  }

  for (const item of PROMO_PRODUCTS) {
    const payload = applyPromoFlags(
      buildBasePayload(item, seller._id),
      item,
      now,
      flashEnds,
      promoUntil,
    );
    const product = await ProductModel.create(payload);
    idsByKey.set(item.key, product._id);

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
    title: "Adminaa · Розыгрыш AirPods",
    description: "Купите участвующие товары — получите билеты.",
    prizeImageUrl: img("adminaa-raffle-prize"),
    targetSales: 100,
    salesProgress: 12,
    participantsCount: 5,
    winnersCount: 1,
    regionCode: REGION,
    status: RAFFLE_STATUS_ACTIVE,
    approvedAt: now,
    instagramUrl: "https://instagram.com/adminaa_demo",
  });

  for (const key of ["raffle-a", "raffle-b"]) {
    const productId = idsByKey.get(key);
    if (!productId) continue;
    await ProductModel.updateOne(
      { _id: productId },
      {
        $set: {
          activeRaffleId: raffle._id,
          raffleParticipationEnabledAt: now,
        },
      },
    );
  }

  await SellerFortuneWheelConfigModel.findOneAndUpdate(
    { sellerId: seller._id },
    {
      $set: {
        enabled: true,
        sectors: [
          {
            discountPercent: 10,
            durationHours: 24,
            chancePercent: 15,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 25,
            durationHours: 24,
            chancePercent: 20,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 40,
            durationHours: 12,
            chancePercent: 15,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 1,
            durationHours: 24,
            chancePercent: 20,
            enabled: true,
            prizeProductId: idsByKey.get("wheel-mug"),
          },
          {
            discountPercent: 1,
            durationHours: 24,
            chancePercent: 20,
            enabled: true,
            prizeProductId: idsByKey.get("wheel-powerbank"),
          },
          {
            discountPercent: 1,
            durationHours: 1,
            chancePercent: 10,
            enabled: false,
            prizeProductId: null,
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  await SellerLuckyBoxConfigModel.findOneAndUpdate(
    { sellerId: seller._id },
    {
      $set: {
        enabled: true,
        prizes: [
          {
            discountPercent: 15,
            durationHours: 24,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 30,
            durationHours: 24,
            enabled: true,
            prizeProductId: null,
          },
          {
            discountPercent: 1,
            durationHours: 24,
            enabled: true,
            prizeProductId: idsByKey.get("box-sticker"),
          },
          {
            discountPercent: 1,
            durationHours: 24,
            enabled: true,
            prizeProductId: idsByKey.get("box-lamp"),
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log(
    JSON.stringify(
      {
        seller: {
          id: String(seller._id),
          userName: seller.userName,
          email: seller.email,
        },
        gamesProducts: GAMES_PRODUCTS.length,
        promoProducts: PROMO_PRODUCTS.map((p) => p.key),
        raffleId: String(raffle._id),
        fortuneWheel: { enabled: true, sectors: 6 },
        luckyBox: { enabled: true, prizes: 4 },
        storefront: `/seller/${seller.userName}`,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect after failure
  }
  process.exit(1);
});
