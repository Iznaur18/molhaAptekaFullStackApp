import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { PRODUCT_REVIEW_STATUS_PUBLISHED } from "../constants/productReviewConstants.js";
import { ProductModel, ProductReviewModel, UserModel } from "../models/index.js";
import { recalculateProductReviewAggregates } from "../services/product/productReviewHelpers.js";

const DEFAULT_REVIEW_COUNT = 20;
const MAX_REVIEW_COUNT = 1000;
const BCRYPT_ROUNDS = 10;
const SEED_PASSWORD = "SeedReviewPass12!";
const SEED_EMAIL_DOMAIN = "seed.local";
const SEED_USER_PREFIX = "seedreviewer";
const DAY_MS = 24 * 60 * 60 * 1000;
const LOG_EVERY = 50;

const REVIEW_TEMPLATES = [
  { rating: 5, text: "Отличный товар, всё как в описании. Доставка быстрая, упаковка аккуратная." },
  { rating: 5, text: "Беру уже не первый раз — качество стабильно хорошее. Рекомендую." },
  { rating: 4, text: "В целом доволен. Небольшие нюансы по комплектации, но на оценку почти не влияют." },
  { rating: 5, text: "Супер! Соответствует фото, без сюрпризов. Буду заказывать ещё." },
  { rating: 4, text: "Хорошее соотношение цена/качество. Пришло вовремя, товар рабочий." },
  { rating: 5, text: "Очень довольна покупкой. Упаковали надёжно, товар без повреждений." },
  { rating: 3, text: "Нормально, но ожидал чуть лучше. Для своих денег ок." },
  { rating: 5, text: "Всё отлично: и товар, и общение с продавцом. Спасибо!" },
  { rating: 4, text: "Качество на уровне. Мелкие косяки есть, но в целом рекомендую." },
  { rating: 5, text: "Идеально. Быстро пришло, описание честное, претензий ноль." },
  { rating: 4, text: "Товар хороший. Один момент по инструкции — разобрались сами." },
  { rating: 5, text: "Покупкой доволен на все сто. Буду советовать знакомым." },
  { rating: 5, text: "Крутая вещь. Уже пользуюсь неделю — без нареканий." },
  { rating: 3, text: "Среднячок. Не плохо и не вау — как ожидал по цене." },
  { rating: 4, text: "Достойный вариант. Доставка без задержек, товар целый." },
  { rating: 5, text: "Лучшая покупка за последнее время. Спасибо продавцу!" },
  { rating: 4, text: "Всё работает как надо. Чуть дольше ждал доставку, но ок." },
  { rating: 5, text: "Качество выше ожиданий. Упаковка — огонь." },
  { rating: 4, text: "Хороший товар, адекватная цена. Берутся без сомнений." },
  { rating: 5, text: "Пять звёзд заслуженно. Описание совпало с реальностью." },
];

const USAGE = `Использование:
  npm run seed:product-reviews -- --productId=<id> [--count=20] [--offset=0] [--dry-run]`;

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  let productId = "";
  let count = DEFAULT_REVIEW_COUNT;
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
  if (!Number.isInteger(count) || count < 1 || count > MAX_REVIEW_COUNT) {
    throw new Error(`--count от 1 до ${MAX_REVIEW_COUNT}`);
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("--offset должен быть целым >= 0");
  }
}

/**
 * @param {number} index
 * @param {number} padWidth
 */
function buildSeedUserIdentity(index, padWidth) {
  const n = String(index + 1).padStart(padWidth, "0");
  return {
    email: `${SEED_USER_PREFIX}${n}@${SEED_EMAIL_DOMAIN}`,
    userName: `${SEED_USER_PREFIX}${n}`,
  };
}

/**
 * @param {number} index
 */
function buildReviewPayload(index) {
  const template = REVIEW_TEMPLATES[index % REVIEW_TEMPLATES.length];
  const variant = Math.floor(index / REVIEW_TEMPLATES.length);
  if (variant === 0) {
    return template;
  }
  return {
    rating: template.rating,
    text: `${template.text} (#${index + 1})`,
  };
}

/**
 * @param {string} productId
 */
async function loadApprovedProduct(productId) {
  const product = await ProductModel.findById(productId)
    .select("productName productSeller productModerationStatus")
    .lean();

  if (!product) {
    throw new Error("Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new Error("Товар не одобрен — отзывы не покажутся в каталоге");
  }
  return product;
}

/**
 * @param {number} index
 * @param {number} padWidth
 * @param {string} passwordHash
 */
async function upsertSeedReviewer(index, padWidth, passwordHash) {
  const { email, userName } = buildSeedUserIdentity(index, padWidth);

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
 * @param {import("mongoose").Types.ObjectId} authorUserId
 * @param {string} productId
 * @param {{ rating: number; text: string }} review
 * @param {number} index
 */
async function insertReviewIfMissing(authorUserId, productId, review, index) {
  const existing = await ProductReviewModel.findOne({
    productId,
    authorUserId,
  })
    .select("_id")
    .lean();

  if (existing) {
    return { skipped: true };
  }

  const createdAt = new Date(Date.now() - (index + 1) * DAY_MS);
  await ProductReviewModel.create({
    productId,
    authorUserId,
    rating: review.rating,
    text: review.text,
    status: PRODUCT_REVIEW_STATUS_PUBLISHED,
    createdAt,
    updatedAt: createdAt,
  });

  return { skipped: false };
}

/**
 * @param {{
 *   productId: string;
 *   sellerId: string;
 *   count: number;
 *   offset: number;
 *   dryRun: boolean;
 * }} input
 */
async function seedReviews({ productId, sellerId, count, offset, dryRun }) {
  const padWidth = Math.max(2, String(offset + count).length);
  const passwordHash = dryRun ? "" : await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < count; i += 1) {
    const index = offset + i;
    const payload = buildReviewPayload(index);
    const identity = buildSeedUserIdentity(index, padWidth);

    if (dryRun) {
      created += 1;
      if (i % LOG_EVERY === 0 || i === count - 1) {
        console.log(`[dry-run] …${identity.userName}: ${payload.rating}★`);
      }
      continue;
    }

    const user = await upsertSeedReviewer(index, padWidth, passwordHash);
    if (String(user._id) === String(sellerId)) {
      skipped += 1;
      continue;
    }

    const result = await insertReviewIfMissing(user._id, productId, payload, index);
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
    const product = await loadApprovedProduct(productId);
    console.log(`Товар: ${product.productName} (${productId})`);
    console.log(`count=${count} offset=${offset}`);
    console.log(dryRun ? "Режим: dry-run" : "Режим: apply");

    const { created, skipped } = await seedReviews({
      productId,
      sellerId: String(product.productSeller),
      count,
      offset,
      dryRun,
    });

    if (!dryRun) {
      const aggregates = await recalculateProductReviewAggregates(productId);
      console.log(
        `\nГотово: создано ${created}, пропущено ${skipped}. ` +
          `Сводка: ${aggregates.reviewCount} отзывов, avg ${aggregates.averageRating}`,
      );
    } else {
      console.log(`\n[dry-run] было бы создано ≈ ${created} отзывов`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
