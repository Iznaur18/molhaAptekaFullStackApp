import {
  PRODUCT_PROMO_CODES_MAX_ACTIVE,
  normalizeProductPromoCode,
} from "@molha/api-contract";

import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  ProductModel,
  ProductPromoActivationModel,
} from "../../models/index.js";
import { isUserStaff } from "../access/adminUserGuard.js";
import { runInTransaction, withMongoSession } from "../../utils/mongoTransaction.js";

/**
 * @param {unknown} row
 */
export const toPromoCodePublic = (row) => ({
  code: String(row?.code ?? ""),
  discountPercent: Math.floor(Number(row?.discountPercent)) || 0,
  enabled: row?.enabled === true,
  maxActivations: Math.floor(Number(row?.maxActivations)) || 0,
  activationsUsed: Math.max(0, Math.floor(Number(row?.activationsUsed)) || 0),
  _id: row?._id != null ? String(row._id) : undefined,
});

/**
 * @param {unknown[]} codes
 */
export const computeProductHasActivePromoCodes = (codes) => {
  if (!Array.isArray(codes)) {
    return false;
  }
  return codes.some((row) => {
    if (row?.enabled !== true) {
      return false;
    }
    const used = Math.max(0, Math.floor(Number(row.activationsUsed)) || 0);
    const max = Math.floor(Number(row.maxActivations)) || 0;
    return max > 0 && used < max;
  });
};

/**
 * @param {Record<string, unknown>} product
 */
export const enrichProductWithPromoCodeFields = (product) => {
  if (!product || typeof product !== "object") {
    return product;
  }
  const codes = Array.isArray(product.productPromoCodes)
    ? product.productPromoCodes
    : [];
  const hasActive =
    product.productHasActivePromoCodes === true ||
    computeProductHasActivePromoCodes(codes);
  const { productPromoCodes: _omit, ...rest } = product;
  return {
    ...rest,
    productHasActivePromoCodes: hasActive,
  };
};

/**
 * @param {Array<{
 *   code: string;
 *   discountPercent: number;
 *   enabled: boolean;
 *   maxActivations: number;
 *   activationsUsed?: number;
 * }>} incoming
 * @param {Array<Record<string, unknown>>} existing
 */
export const mergePromoCodesForReplace = (incoming, existing) => {
  const existingByCode = new Map(
    (Array.isArray(existing) ? existing : []).map((row) => [
      normalizeProductPromoCode(row.code),
      row,
    ]),
  );

  const seen = new Set();
  /** @type {Array<Record<string, unknown>>} */
  const next = [];
  let activeCount = 0;

  for (const item of incoming) {
    const code = normalizeProductPromoCode(item.code);
    if (seen.has(code)) {
      throw new AppError(400, `Промокод «${code}» указан дважды`);
    }
    seen.add(code);

    const prev = existingByCode.get(code);
    const activationsUsed = Math.max(
      0,
      Math.floor(Number(prev?.activationsUsed)) || 0,
    );
    const maxActivations = Math.floor(Number(item.maxActivations));
    let enabled = item.enabled === true;
    if (enabled && activationsUsed >= maxActivations) {
      enabled = false;
    }
    if (enabled) {
      activeCount += 1;
    }
    next.push({
      ...(prev?._id ? { _id: prev._id } : {}),
      code,
      discountPercent: Math.floor(Number(item.discountPercent)),
      enabled,
      maxActivations,
      activationsUsed,
    });
  }

  if (activeCount > PRODUCT_PROMO_CODES_MAX_ACTIVE) {
    throw new AppError(
      400,
      `Не больше ${PRODUCT_PROMO_CODES_MAX_ACTIVE} активных промокодов на товар`,
    );
  }

  return next;
};

/**
 * @param {{ userId: string; productId: string }} input
 */
export async function listProductPromoCodesForOwner({ userId, productId }) {
  const isStaff = await isUserStaff(userId);
  const filter = isStaff
    ? { _id: productId }
    : { _id: productId, productSeller: userId };
  const product = await ProductModel.findOne(filter)
    .select("productPromoCodes productHasActivePromoCodes productSeller")
    .lean();
  if (!product) {
    throw new AppError(404, "Товар не найден или нет прав");
  }
  const promoCodes = (product.productPromoCodes ?? []).map(toPromoCodePublic);
  return {
    promoCodes,
    productHasActivePromoCodes: computeProductHasActivePromoCodes(
      product.productPromoCodes,
    ),
  };
}

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   promoCodes: Array<{
 *     code: string;
 *     discountPercent: number;
 *     enabled: boolean;
 *     maxActivations: number;
 *   }>;
 * }} input
 */
export async function replaceProductPromoCodes({
  userId,
  productId,
  promoCodes,
}) {
  const isStaff = await isUserStaff(userId);
  const filter = isStaff
    ? { _id: productId }
    : { _id: productId, productSeller: userId };
  const product = await ProductModel.findOne(filter);
  if (!product) {
    throw new AppError(404, "Товар не найден или нет прав");
  }

  const nextCodes = mergePromoCodesForReplace(
    promoCodes,
    product.productPromoCodes ?? [],
  );
  product.productPromoCodes = nextCodes;
  product.productHasActivePromoCodes = computeProductHasActivePromoCodes(nextCodes);
  await product.save();

  return {
    promoCodes: nextCodes.map(toPromoCodePublic),
    productHasActivePromoCodes: product.productHasActivePromoCodes === true,
  };
}

/**
 * @param {{ userId: string; productId: string; code: string }} input
 */
export async function activateProductPromoCode({ userId, productId, code }) {
  const normalizedCode = normalizeProductPromoCode(code);

  const existingActivation = await ProductPromoActivationModel.findOne({
    userId,
    productId,
  }).lean();
  if (existingActivation) {
    throw new AppError(409, "На этот товар уже применён промокод");
  }

  const product = await ProductModel.findById(productId)
    .select(
      "productPromoCodes productHasActivePromoCodes productModerationStatus productIsAvailable productSeller",
    )
    .lean();
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new AppError(409, "Товар недоступен для промокода");
  }
  if (product.productIsAvailable === false) {
    throw new AppError(409, "Товар скрыт");
  }
  if (String(product.productSeller) === String(userId)) {
    throw new AppError(400, "Нельзя активировать промокод на свой товар");
  }

  const match = (product.productPromoCodes ?? []).find(
    (row) => normalizeProductPromoCode(row.code) === normalizedCode,
  );
  if (!match) {
    throw new AppError(400, "Промокод не найден");
  }
  if (match.enabled !== true) {
    throw new AppError(400, "Промокод выключен");
  }
  const used = Math.max(0, Math.floor(Number(match.activationsUsed)) || 0);
  const max = Math.floor(Number(match.maxActivations)) || 0;
  if (used >= max) {
    throw new AppError(400, "Лимит активаций промокода исчерпан");
  }

  const discountPercent = Math.floor(Number(match.discountPercent));

  try {
    return await runInTransaction(async (session) => {
      const updated = await ProductModel.findOneAndUpdate(
        { _id: productId },
        {
          $inc: { "productPromoCodes.$[p].activationsUsed": 1 },
        },
        withMongoSession(
          {
            returnDocument: "after",
            arrayFilters: [
              {
                "p._id": match._id,
                "p.enabled": true,
                "p.activationsUsed": { $lt: max },
              },
            ],
          },
          session,
        ),
      );

      if (!updated) {
        throw new AppError(
          409,
          "Не удалось активировать промокод. Попробуйте снова",
        );
      }

      const nextCodes = updated.productPromoCodes ?? [];
      const nextMatch = nextCodes.find(
        (row) => String(row._id) === String(match._id),
      );
      const nextUsed = Math.floor(Number(nextMatch?.activationsUsed)) || 0;
      if (!nextMatch || nextUsed !== used + 1) {
        throw new AppError(
          409,
          "Не удалось активировать промокод. Попробуйте снова",
        );
      }
      if (nextUsed >= Math.floor(Number(nextMatch.maxActivations))) {
        nextMatch.enabled = false;
      }
      updated.productHasActivePromoCodes =
        computeProductHasActivePromoCodes(nextCodes);
      await updated.save(withMongoSession({}, session));

      await ProductPromoActivationModel.create(
        [
          {
            userId,
            productId,
            code: normalizedCode,
            discountPercent,
            promoCodeId: match._id,
          },
        ],
        withMongoSession({}, session),
      );

      return {
        productId: String(productId),
        code: normalizedCode,
        discountPercent,
        message: `Промокод применён: −${discountPercent}%`,
      };
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, "На этот товар уже применён промокод");
    }
    throw error;
  }
}

/**
 * @param {{ userId: string; productIds?: string[] }} input
 */
export async function listAppliedProductPromosForUser({ userId, productIds }) {
  const filter = {
    userId,
    ...(Array.isArray(productIds) && productIds.length > 0
      ? { productId: { $in: productIds } }
      : {}),
  };
  const rows = await ProductPromoActivationModel.find(filter).lean();
  return rows.map((row) => ({
    productId: String(row.productId),
    code: String(row.code),
    discountPercent: Math.floor(Number(row.discountPercent)) || 0,
  }));
}
