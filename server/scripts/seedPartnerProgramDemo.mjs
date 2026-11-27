/**
 * Dev-сид: рефералы + кэшбэк + affiliate earnings + «Продажи через партнёров»
 * для adminaa / demovitrina.
 *
 *   npm run seed:partner-program
 *
 * Идемпотентно: фиксированные userName / sourceId / productName.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import {
  AFFILIATE_LINE_STATUS_PAID,
  AFFILIATE_LINE_STATUS_PENDING,
} from "../constants/affiliateConstants.js";
import { ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY } from "../constants/orderConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { REFERRAL_SOURCE_KIND_PREMIUM } from "../constants/referralConstants.js";
import {
  AffiliateLedgerEntryModel,
  OrderModel,
  ProductModel,
  UserModel,
} from "../models/index.js";
import { settleAffiliatePayoutForOrderItem } from "../services/affiliate/settleAffiliatePayoutForOrderItem.js";
import { attachReferralAttribution } from "../services/referral/attachReferralAttribution.js";
import { creditReferralCashbackFromSpend } from "../services/referral/creditReferralCashbackFromSpend.js";
import { ensureUserReferralCode } from "../services/referral/ensureUserReferralCode.js";
import { buildOrderLineLoyaltySnapshot } from "../services/order/orderLoyaltyPoints.js";
import { reserveLoyaltyPointsForNewOrder } from "../services/order/orderLoyaltyPoints.js";
import { ORDER_ITEMS_POPULATE } from "../services/order/orderQueries.js";
import { confirmOrderItemByBuyer } from "../services/order/updateOrderItemStatus.js";
import {
  createAffiliatePendingOrder,
  markAffiliateOrderItemDelivered,
} from "../tests/helpers/affiliateSettleTestHelpers.js";
import { runInTransaction, withMongoSession } from "../utils/mongoTransaction.js";

const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = "SeedPartner12!";
const REFERRER_USERNAMES = ["adminaa", "demovitrina"];
const BOTS_PER_REFERRER = 3;
const SALES_PER_REFERRER = 2;
const POINTS_SPENT_PER_BOT = 1000;
const AFFILIATE_PERCENT = 12;
const PRODUCT_PRICE = 1000;
const SELLER_POINTS_FLOOR = 10_000;
const SEED_TAG = "seed_partner_program_v1";

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI не задан");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

/**
 * @param {string} userName
 * @param {string} email
 * @param {Record<string, unknown>} [extra]
 */
async function upsertBotUser(userName, email, extra = {}) {
  const existing = await UserModel.findOne({ userName }).exec();
  if (existing) {
    await UserModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          email,
          passwordHash,
          isEmailVerified: true,
          isActiveUser: true,
          isBlockedUser: false,
          isUserDataConfirmed: true,
          ...extra,
        },
      },
    );
    return UserModel.findById(existing._id).exec();
  }
  return UserModel.create({
    userName,
    email,
    passwordHash,
    isEmailVerified: true,
    isActiveUser: true,
    isBlockedUser: false,
    isUserDataConfirmed: true,
    userLoyaltyPoints: 0,
    userLoyaltyPointsReserved: 0,
    ...extra,
  });
}

/**
 * @param {import("mongoose").Document} referrer
 * @param {number} botIndex
 */
async function seedReferralBot(referrer, botIndex) {
  const slug = String(referrer.userName).toLowerCase();
  const userName = `seed_ref_${slug}_${botIndex}`;
  const email = `${userName}@${SEED_TAG}.local`;
  const bot = await upsertBotUser(userName, email);

  const code = await ensureUserReferralCode(String(referrer._id));
  await attachReferralAttribution({
    userId: String(bot._id),
    referralCode: code,
  });

  const sourceId = `${SEED_TAG}:premium:${slug}:bot${botIndex}`;
  const credit = await creditReferralCashbackFromSpend({
    spenderUserId: String(bot._id),
    pointsSpent: POINTS_SPENT_PER_BOT,
    sourceKind: REFERRAL_SOURCE_KIND_PREMIUM,
    sourceId,
  });

  return {
    userName,
    userId: String(bot._id),
    cashback: credit,
  };
}

/**
 * @param {import("mongoose").Document} referrer
 * @param {number} saleIndex
 */
async function seedAffiliateSale(referrer, saleIndex) {
  const slug = String(referrer.userName).toLowerCase();
  const sellerName = `seed_aff_seller_${slug}_${saleIndex}`;
  const buyerName = `seed_aff_buyer_${slug}_${saleIndex}`;
  const productName = `[${SEED_TAG}] Aff ${slug} #${saleIndex}`;

  const seller = await upsertBotUser(
    `${sellerName}`,
    `${sellerName}@${SEED_TAG}.local`,
    {
      userLoyaltyPoints: SELLER_POINTS_FLOOR,
      userLoyaltyPointsReserved: 0,
    },
  );
  // Гарантируем пул баллов продавца перед settle (повторный запуск мог списать).
  await UserModel.updateOne(
    { _id: seller._id },
    {
      $max: { userLoyaltyPoints: SELLER_POINTS_FLOOR },
      $set: { userLoyaltyPointsReserved: 0 },
    },
  );

  const buyer = await upsertBotUser(`${buyerName}`, `${buyerName}@${SEED_TAG}.local`);

  let product = await ProductModel.findOne({
    productSeller: seller._id,
    productName,
  }).exec();
  if (!product) {
    product = await ProductModel.create({
      productName,
      productDescription: `Seed affiliate product for ${slug}`,
      productPrice: PRODUCT_PRICE,
      productSeller: seller._id,
      productCategory: "grocery",
      productStockQuantity: 50,
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      loyaltyPointsPerUnit: 0,
      affiliateEnabled: true,
      affiliatePercent: AFFILIATE_PERCENT,
      productPickupAddress: "Москва, Тверская улица, д 1",
      productPickupLat: 55.757,
      productPickupLon: 37.615,
      productDeliveryEnabled: false,
    });
  } else {
    await ProductModel.updateOne(
      { _id: product._id },
      {
        $set: {
          affiliateEnabled: true,
          affiliatePercent: AFFILIATE_PERCENT,
          productPrice: PRODUCT_PRICE,
          productStockQuantity: 50,
          productModerationStatus: PRODUCT_MODERATION_APPROVED,
        },
      },
    );
    product = await ProductModel.findById(product._id).exec();
  }

  const existingPaid = await OrderModel.findOne({
    "items.productId": product._id,
    "items.affiliateReferrerUserId": referrer._id,
    "items.affiliateStatus": AFFILIATE_LINE_STATUS_PAID,
  })
    .select("_id items.affiliateAmount items.affiliateStatus")
    .lean();

  if (existingPaid) {
    return {
      skipped: true,
      reason: "already_paid",
      orderId: String(existingPaid._id),
      amount: existingPaid.items?.[0]?.affiliateAmount ?? null,
    };
  }

  let order = await OrderModel.findOne({
    "items.productId": product._id,
    "items.affiliateReferrerUserId": referrer._id,
    "items.affiliateStatus": { $ne: AFFILIATE_LINE_STATUS_PAID },
  }).exec();

  if (!order) {
    order = await createAffiliatePendingOrder({
      buyer,
      seller,
      product,
      referrerUserId: referrer._id,
    });
  }

  const line = order.items[0];
  if (String(line.affiliateStatus) === AFFILIATE_LINE_STATUS_PAID) {
    return {
      skipped: true,
      reason: "already_paid",
      orderId: String(order._id),
      amount: line.affiliateAmount,
    };
  }

  // Если confirm уже частично прошёл через txn settle — добьём через прямой settle.
  const ledgerExists = await AffiliateLedgerEntryModel.exists({
    entryType: "payout",
    orderId: order._id,
    affiliateUserId: referrer._id,
  });
  if (ledgerExists) {
    return {
      skipped: true,
      reason: "ledger_exists",
      orderId: String(order._id),
    };
  }

  await markAffiliateOrderItemDelivered(order._id, 0);

  try {
    await confirmOrderItemByBuyer({
      orderId: String(order._id),
      itemIndex: 0,
      buyerId: String(buyer._id),
      userId: String(buyer._id),
    });
  } catch (err) {
    // Фолбэк: settle напрямую в txn (если confirm упёрся в доп. гейты).
    await runInTransaction(async (session) => {
      const live = await OrderModel.findById(order._id)
        .populate(ORDER_ITEMS_POPULATE)
        .session(session);
      if (!live) {
        throw err;
      }
      await settleAffiliatePayoutForOrderItem({
        order: live,
        targetItem: live.items[0],
        buyerId: String(buyer._id),
        session,
      });
      await live.save({ session });
    });
  }

  const refreshed = await OrderModel.findById(order._id).lean();
  return {
    skipped: false,
    orderId: String(order._id),
    amount: refreshed?.items?.[0]?.affiliateAmount ?? null,
    status: refreshed?.items?.[0]?.affiliateStatus ?? null,
  };
}

/**
 * Вкладка «Продажи через партнёров»: seller = adminaa/demovitrina,
 * партнёр и покупатель — боты.
 *
 * @param {import("mongoose").Document} seller
 * @param {number} saleIndex
 */
async function seedSellerPartnerSale(seller, saleIndex) {
  const slug = String(seller.userName).toLowerCase();
  const partnerName = `seed_aff_partner_${slug}_${saleIndex}`;
  const buyerName = `seed_aff_sbuyer_${slug}_${saleIndex}`;
  const productName = `[${SEED_TAG}] Seller sales ${slug} #${saleIndex}`;

  await UserModel.updateOne(
    { _id: seller._id },
    {
      $max: { userLoyaltyPoints: SELLER_POINTS_FLOOR },
      $set: { userLoyaltyPointsReserved: 0 },
    },
  );

  const partner = await upsertBotUser(partnerName, `${partnerName}@${SEED_TAG}.local`);
  await ensureUserReferralCode(String(partner._id));
  const buyer = await upsertBotUser(buyerName, `${buyerName}@${SEED_TAG}.local`);

  let product = await ProductModel.findOne({
    productSeller: seller._id,
    productName,
  }).exec();
  if (!product) {
    product = await ProductModel.create({
      productName,
      productDescription: `Seed seller-side affiliate sale for ${slug}`,
      productPrice: PRODUCT_PRICE,
      productSeller: seller._id,
      productCategory: "grocery",
      productStockQuantity: 50,
      productModerationStatus: PRODUCT_MODERATION_APPROVED,
      loyaltyPointsPerUnit: 0,
      affiliateEnabled: true,
      affiliatePercent: AFFILIATE_PERCENT,
      productPickupAddress: "Москва, Тверская улица, д 1",
      productPickupLat: 55.757,
      productPickupLon: 37.615,
      productDeliveryEnabled: false,
    });
  } else {
    await ProductModel.updateOne(
      { _id: product._id },
      {
        $set: {
          affiliateEnabled: true,
          affiliatePercent: AFFILIATE_PERCENT,
          productPrice: PRODUCT_PRICE,
          productStockQuantity: 50,
          productModerationStatus: PRODUCT_MODERATION_APPROVED,
        },
      },
    );
    product = await ProductModel.findById(product._id).exec();
  }

  const existingPaid = await OrderModel.findOne({
    "items.productId": product._id,
    "items.sellerIdAtOrder": seller._id,
    "items.affiliateReferrerUserId": partner._id,
    "items.affiliateStatus": AFFILIATE_LINE_STATUS_PAID,
  })
    .select("_id items.affiliateAmount")
    .lean();
  if (existingPaid) {
    return {
      skipped: true,
      reason: "already_paid",
      orderId: String(existingPaid._id),
      amount: existingPaid.items?.[0]?.affiliateAmount ?? null,
    };
  }

  let order = await OrderModel.findOne({
    "items.productId": product._id,
    "items.sellerIdAtOrder": seller._id,
    "items.affiliateReferrerUserId": partner._id,
    "items.affiliateStatus": { $ne: AFFILIATE_LINE_STATUS_PAID },
  }).exec();

  if (!order) {
    const loyaltyLine = buildOrderLineLoyaltySnapshot({
      loyaltyPointsPerUnit: product.loyaltyPointsPerUnit,
      quantity: 1,
    });
    const orderItems = [
      {
        productId: product._id,
        sellerIdAtOrder: seller._id,
        quantity: 1,
        unitPriceAtOrder: product.productPrice,
        productNameAtOrder: product.productName,
        ...loyaltyLine,
        affiliateReferrerUserId: partner._id,
        affiliateStatus: AFFILIATE_LINE_STATUS_PENDING,
      },
    ];
    order = await runInTransaction(async (session) => {
      await reserveLoyaltyPointsForNewOrder(
        [
          {
            ...orderItems[0],
            productId: { productSeller: seller._id },
          },
        ],
        session,
      );
      const [created] = await OrderModel.create(
        [
          {
            userBuyerId: buyer._id,
            items: orderItems,
            totalAmount: product.productPrice,
            deliveryAddress: "Test delivery address",
            deliveryAddressFlat: "1",
            paymentMethod: ORDER_PAYMENT_METHOD_CASH_ON_DELIVERY,
          },
        ],
        withMongoSession({}, session),
      );
      return created;
    });
  }

  const ledgerExists = await AffiliateLedgerEntryModel.exists({
    entryType: "payout",
    orderId: order._id,
    sellerUserId: seller._id,
    affiliateUserId: partner._id,
  });
  if (ledgerExists) {
    return {
      skipped: true,
      reason: "ledger_exists",
      orderId: String(order._id),
    };
  }

  await markAffiliateOrderItemDelivered(order._id, 0);

  try {
    await confirmOrderItemByBuyer({
      orderId: String(order._id),
      itemIndex: 0,
      buyerId: String(buyer._id),
      userId: String(buyer._id),
    });
  } catch (err) {
    await runInTransaction(async (session) => {
      const live = await OrderModel.findById(order._id)
        .populate(ORDER_ITEMS_POPULATE)
        .session(session);
      if (!live) {
        throw err;
      }
      await settleAffiliatePayoutForOrderItem({
        order: live,
        targetItem: live.items[0],
        buyerId: String(buyer._id),
        session,
      });
      await live.save({ session });
    });
  }

  const refreshed = await OrderModel.findById(order._id).lean();
  return {
    skipped: false,
    orderId: String(order._id),
    amount: refreshed?.items?.[0]?.affiliateAmount ?? null,
    status: refreshed?.items?.[0]?.affiliateStatus ?? null,
    partner: partnerName,
    buyer: buyerName,
  };
}

await mongoose.connect(mongoUri);

const summary = [];

try {
  for (const userName of REFERRER_USERNAMES) {
    const referrer = await UserModel.findOne({ userName }).exec();
    if (!referrer) {
      throw new Error(`Пользователь ${userName} не найден — сначала seed demo/adminaa`);
    }

    const referralCode = await ensureUserReferralCode(String(referrer._id));
    const referrals = [];
    for (let i = 1; i <= BOTS_PER_REFERRER; i += 1) {
      referrals.push(await seedReferralBot(referrer, i));
    }

    const earningsSales = [];
    for (let i = 1; i <= SALES_PER_REFERRER; i += 1) {
      earningsSales.push(await seedAffiliateSale(referrer, i));
    }

    const sellerPartnerSales = [];
    for (let i = 1; i <= SALES_PER_REFERRER; i += 1) {
      sellerPartnerSales.push(await seedSellerPartnerSale(referrer, i));
    }

    const fresh = await UserModel.findById(referrer._id)
      .select("userName userLoyaltyPoints referralCode")
      .lean();

    summary.push({
      userName: fresh.userName,
      referralCode,
      userLoyaltyPoints: fresh.userLoyaltyPoints,
      referrals,
      earningsSales,
      sellerPartnerSales,
    });
  }

  console.log(JSON.stringify({ ok: true, summary }, null, 2));
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
