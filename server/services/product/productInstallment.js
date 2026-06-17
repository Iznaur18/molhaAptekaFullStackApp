import {
  INSTALLMENT_HAS_CONTRACTS_BLOCK_MESSAGE,
  INSTALLMENT_MODERATION_APPROVED,
  INSTALLMENT_MODERATION_PENDING,
  INSTALLMENT_MODERATION_REJECTED,
} from "../../constants/installmentConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductInstallmentProgramModel, ProductModel } from "../../models/index.js";
import { AppError } from "../../errors/AppError.js";
import { isUserStaff } from "../access/adminUserGuard.js";
import { assertUserCanManageInstallmentAsSeller } from "../installment/installmentAccess.js";
import {
  countActiveInstallmentContractsForProduct,
  normalizeInstallmentPlansInput,
  syncProductInstallmentEnabledFlag,
  toInstallmentProgramPayload,
} from "../installment/installmentHelpers.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @param {Record<string, unknown>} query
 */
const parsePagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
};

const throwFieldError = (error, fallback) => {
  throw new AppError(400, error instanceof Error ? error.message : fallback);
};

/**
 * @param {{
 *   productId: string;
 *   userId?: string;
 * }} input
 */
export async function getProductInstallmentProgram({ productId, userId }) {
  const program = await ProductInstallmentProgramModel.findOne({ productId }).lean();

  if (!program) {
    return { program: null };
  }

  const product = await ProductModel.findById(productId)
    .select("productSeller")
    .lean();
  const isOwner = userId != null && String(product?.productSeller) === String(userId);
  const isStaff = await isUserStaff(userId);

  if (
    !isOwner &&
    !isStaff &&
    (program.moderationStatus !== INSTALLMENT_MODERATION_APPROVED || !program.isEnabled)
  ) {
    return { program: null };
  }

  return { program: toInstallmentProgramPayload(program) };
}

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   body: Record<string, unknown>;
 * }} input
 */
export async function upsertProductInstallmentProgram({ userId, productId, body }) {
  const { isEnabled } = body;

  try {
    await assertUserCanManageInstallmentAsSeller(userId);
  } catch (error) {
    throw new AppError(403, error instanceof Error ? error.message : "Нет прав");
  }

  const product = await ProductModel.findOne({
    _id: productId,
    productSeller: userId,
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
  }).lean();

  if (!product) {
    throw new AppError(404, "Товар не найден или недоступен");
  }

  const activeContracts = await countActiveInstallmentContractsForProduct(productId);
  if (activeContracts > 0) {
    throw new AppError(409, INSTALLMENT_HAS_CONTRACTS_BLOCK_MESSAGE);
  }

  let plans;
  try {
    plans = normalizeInstallmentPlansInput(body.plans);
  } catch (error) {
    throwFieldError(error, "Некорректные планы");
  }

  const existing = await ProductInstallmentProgramModel.findOne({ productId });

  if (existing) {
    existing.isEnabled = Boolean(isEnabled);
    existing.plans = plans;
    if (isEnabled && existing.wasEverApproved !== true) {
      existing.moderationStatus = INSTALLMENT_MODERATION_PENDING;
    }
    await existing.save();
    await syncProductInstallmentEnabledFlag(productId);

    return {
      message:
        isEnabled && existing.wasEverApproved !== true
          ? "Программа рассрочки отправлена на модерацию"
          : "Программа рассрочки обновлена",
      program: toInstallmentProgramPayload(existing.toObject()),
    };
  }

  const created = await ProductInstallmentProgramModel.create({
    productId,
    sellerId: userId,
    isEnabled: Boolean(isEnabled),
    moderationStatus: isEnabled
      ? INSTALLMENT_MODERATION_PENDING
      : INSTALLMENT_MODERATION_REJECTED,
    plans,
  });

  await syncProductInstallmentEnabledFlag(productId);

  return {
    message: isEnabled
      ? "Программа рассрочки отправлена на модерацию"
      : "Программа рассрочки сохранена",
    program: toInstallmentProgramPayload(created.toObject()),
  };
}

/**
 * @param {{ query: Record<string, unknown> }} input
 */
export async function getPendingInstallmentModeration({ query }) {
  const { page, limit, skip } = parsePagination(query);
  const filter = {
    isEnabled: true,
    moderationStatus: INSTALLMENT_MODERATION_PENDING,
  };

  const [rows, total] = await Promise.all([
    ProductInstallmentProgramModel.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ProductInstallmentProgramModel.countDocuments(filter),
  ]);

  const productIds = rows.map((row) => row.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select("productName productSeller")
    .lean();
  const productById = Object.fromEntries(
    products.map((product) => [String(product._id), product]),
  );

  return {
    programs: rows.map((row) => ({
      ...toInstallmentProgramPayload(row),
      productName: productById[String(row.productId)]?.productName ?? null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function countPendingInstallmentModeration() {
  const count = await ProductInstallmentProgramModel.countDocuments({
    isEnabled: true,
    moderationStatus: INSTALLMENT_MODERATION_PENDING,
  });

  return { count };
}

/**
 * @param {{
 *   productId: string;
 *   staffId: string;
 * }} input
 */
export async function approveInstallmentModeration({ productId, staffId }) {
  const program = await ProductInstallmentProgramModel.findOne({ productId });
  if (!program) {
    throw new AppError(404, "Программа не найдена");
  }
  if (program.moderationStatus !== INSTALLMENT_MODERATION_PENDING) {
    throw new AppError(409, "Программа не на модерации");
  }

  program.moderationStatus = INSTALLMENT_MODERATION_APPROVED;
  program.moderationComment = "";
  program.reviewedBy = staffId;
  program.reviewedAt = new Date();
  program.wasEverApproved = true;
  await program.save();
  await syncProductInstallmentEnabledFlag(productId);

  return {
    message: "Рассрочка одобрена",
    program: toInstallmentProgramPayload(program.toObject()),
  };
}

/**
 * @param {{
 *   productId: string;
 *   staffId: string;
 *   moderationComment: unknown;
 * }} input
 */
export async function rejectInstallmentModeration({
  productId,
  staffId,
  moderationComment,
}) {
  const comment = String(moderationComment ?? "").trim();
  const program = await ProductInstallmentProgramModel.findOne({ productId });
  if (!program) {
    throw new AppError(404, "Программа не найдена");
  }
  if (program.moderationStatus !== INSTALLMENT_MODERATION_PENDING) {
    throw new AppError(409, "Программа не на модерации");
  }

  program.moderationStatus = INSTALLMENT_MODERATION_REJECTED;
  program.moderationComment = comment;
  program.reviewedBy = staffId;
  program.reviewedAt = new Date();
  await program.save();
  await syncProductInstallmentEnabledFlag(productId);

  return {
    message: "Рассрочка отклонена",
    program: toInstallmentProgramPayload(program.toObject()),
  };
}