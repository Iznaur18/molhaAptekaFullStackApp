import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { PRICE_OFFER_STATUS_PENDING } from "../constants/productPriceOfferConstants.js";
import { ProductModel, ProductPriceOfferModel, UserModel } from "../models/index.js";
import { computeAuctionActive } from "../services/product/productAuction.js";

const DEFAULT_BID_COUNT = 20;
const MAX_BID_COUNT = 1000;
const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = "SeedAuctionPass12!";
const SEED_EMAIL_DOMAIN = "seed.local";
const SEED_USER_PREFIX = "seedauction";
const HOUR_MS = 60 * 60 * 1000;
const MIN_OFFER_PRICE = 1;
const DEFAULT_START_PRICE_RATIO = 0.45;
const LOG_EVERY = 25;

const USAGE = `Использование:
  npm run seed:auction-bids -- --productId=<id> [--count=20] [--offset=0] [--dry-run]`;

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  let productId = "";
  let count = DEFAULT_BID_COUNT;
  let offset = 0;

  for (const arg of argv) {
    if (arg.startsWith("--productId=")) {
      productId = arg.slice("--productId=".length).trim();
    }
    if (arg.startsWith("--count=")) {
      count = Number(arg.slice("--count=".length));
    }
    if (arg.startsWith("--offset=")) {
      offset = Number(arg.slice("--offset=".length));
    }
  }

  return { productId, count, offset, dryRun };
}

/**
 * @param {string} productId
 * @param {number} count
 * @param {number} offset
 */
function assertArgs(productId, count, offset) {
  if (!productId || !mongoose.isValidObjectId(productId)) {
    throw new Error("Нужен валидный --productId=<ObjectId>");
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_BID_COUNT) {
    throw new Error(`--count от 1 до ${MAX_BID_COUNT}`);
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("--offset должен быть целым >= 0");
  }
}

/**
 * @param {string} productId
 */
async function loadAuctionProduct(productId) {
  const product = await ProductModel.findById(productId)
    .select(
      "productName productSeller productPrice productModerationStatus productIsAvailable productAuctionEnabled",
    )
    .lean();

  if (!product) {
    throw new Error("Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new Error("Товар не одобрен");
  }
  if (!computeAuctionActive(product)) {
    throw new Error(
      "Аукцион неактивен (нужны productAuctionEnabled=true и товар в продаже)",
    );
  }
  return product;
}

/**
 * Absolute ladder index → price (may go above catalog).
 * @param {number} catalogPrice
 * @param {number} absoluteIndex
 */
function offerPriceAtIndex(catalogPrice, absoluteIndex) {
  const base = Math.max(
    MIN_OFFER_PRICE,
    Math.floor(Number(catalogPrice)) || MIN_OFFER_PRICE,
  );
  const start = Math.max(MIN_OFFER_PRICE, Math.floor(base * DEFAULT_START_PRICE_RATIO));
  return start + absoluteIndex;
}

/**
 * @param {number} index
 * @param {number} padWidth
 */
function buildSeedBidderIdentity(index, padWidth) {
  const n = String(index + 1).padStart(padWidth, "0");
  return {
    email: `${SEED_USER_PREFIX}${n}@${SEED_EMAIL_DOMAIN}`,
    userName: `${SEED_USER_PREFIX}${n}`,
  };
}

/**
 * @param {number} index
 * @param {number} padWidth
 * @param {string} passwordHash
 */
async function upsertSeedBidder(index, padWidth, passwordHash) {
  const { email, userName } = buildSeedBidderIdentity(index, padWidth);

  return UserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        userName,
        passwordHash,
        isEmailVerified: true,
        isActiveUser: true,
        isUserDataConfirmed: true,
        userRole: "user",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).select("_id email userName");
}

/**
 * @param {import("mongoose").Types.ObjectId} buyerUserId
 * @param {string} productId
 * @param {number} offerPrice
 * @param {number} index
 */
async function insertPendingBidIfMissing(buyerUserId, productId, offerPrice, index) {
  const existing = await ProductPriceOfferModel.findOne({
    productId,
    buyerUserId,
    status: PRICE_OFFER_STATUS_PENDING,
  })
    .select("_id offerPrice")
    .lean();

  if (existing) {
    return { skipped: true, offerPrice: existing.offerPrice };
  }

  const createdAt = new Date(Date.now() - (index + 1) * HOUR_MS);
  await ProductPriceOfferModel.create({
    productId,
    buyerUserId,
    offerPrice,
    status: PRICE_OFFER_STATUS_PENDING,
    createdAt,
    updatedAt: createdAt,
  });

  return { skipped: false, offerPrice };
}

/**
 * @param {{
 *   productId: string;
 *   sellerId: string;
 *   catalogPrice: number;
 *   count: number;
 *   offset: number;
 *   dryRun: boolean;
 * }} input
 */
async function seedBids({ productId, sellerId, catalogPrice, count, offset, dryRun }) {
  const padWidth = Math.max(2, String(offset + count).length);
  const passwordHash = dryRun ? "" : await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < count; i += 1) {
    const index = offset + i;
    const offerPrice = offerPriceAtIndex(catalogPrice, index);
    const identity = buildSeedBidderIdentity(index, padWidth);

    if (dryRun) {
      created += 1;
      if (i % LOG_EVERY === 0 || i === count - 1) {
        console.log(`[dry-run] …${identity.userName}: ${offerPrice} ₽`);
      }
      continue;
    }

    const user = await upsertSeedBidder(index, padWidth, passwordHash);
    if (String(user._id) === String(sellerId)) {
      skipped += 1;
      continue;
    }

    const result = await insertPendingBidIfMissing(
      user._id,
      productId,
      offerPrice,
      index,
    );
    if (result.skipped) {
      skipped += 1;
    } else {
      created += 1;
    }

    if (i % LOG_EVERY === 0 || i === count - 1) {
      console.log(`Прогресс ${i + 1}/${count}: +${created} / skip ${skipped}`);
    }
  }

  return { created, skipped };
}

async function main() {
  const { productId, count, offset, dryRun } = parseArgs(process.argv.slice(2));

  try {
    assertArgs(productId, count, offset);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    console.error(USAGE);
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI не задан в server/.env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const product = await loadAuctionProduct(productId);
    console.log(`Товар: ${product.productName} (${productId})`);
    console.log(`Цена каталога: ${product.productPrice} ₽`);
    console.log(`count=${count} offset=${offset}`);
    console.log(dryRun ? "Режим: dry-run" : "Режим: apply");

    const { created, skipped } = await seedBids({
      productId,
      sellerId: String(product.productSeller),
      catalogPrice: product.productPrice,
      count,
      offset,
      dryRun,
    });

    const pendingCount = dryRun
      ? null
      : await ProductPriceOfferModel.countDocuments({
          productId,
          status: PRICE_OFFER_STATUS_PENDING,
        });

    console.log(
      dryRun
        ? `\n[dry-run] было бы создано ≈ ${created} ставок`
        : `\nГотово: создано ${created}, пропущено ${skipped}. Pending всего: ${pendingCount}`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
