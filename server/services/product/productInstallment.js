import {
  INSTALLMENT_HAS_CONTRACTS_BLOCK_MESSAGE,
  INSTALLMENT_MODERATION_APPROVED,
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
  const isEnabled = Boolean(body.isEnabled);

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
    existing.isEnabled = isEnabled;
    existing.plans = plans;
    existing.moderationStatus = INSTALLMENT_MODERATION_APPROVED;
    existing.moderationComment = "";
    if (isEnabled) {
      existing.wasEverApproved = true;
    }
    await existing.save();
    await syncProductInstallmentEnabledFlag(productId);

    return {
      message: isEnabled
        ? "Программа рассрочки активирована"
        : "Программа рассрочки обновлена",
      program: toInstallmentProgramPayload(existing.toObject()),
    };
  }

  const created = await ProductInstallmentProgramModel.create({
    productId,
    sellerId: userId,
    isEnabled,
    moderationStatus: INSTALLMENT_MODERATION_APPROVED,
    moderationComment: "",
    wasEverApproved: isEnabled,
    plans,
  });

  await syncProductInstallmentEnabledFlag(productId);

  return {
    message: isEnabled
      ? "Программа рассрочки активирована"
      : "Программа рассрочки сохранена",
    program: toInstallmentProgramPayload(created.toObject()),
  };
}
