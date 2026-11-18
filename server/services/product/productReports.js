import { ProductModel, ProductReportModel } from "../../models/index.js";
import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import {
  PRODUCT_REPORT_ALREADY_MESSAGE,
  PRODUCT_REPORT_STATUS_PENDING,
  PRODUCT_REPORT_TEXT_MAX_CHARS,
} from "../../constants/productReportConstants.js";
import { AppError } from "../../errors/AppError.js";
import {
  getPendingProductReportGroups,
  notifySellerAboutProductReport,
  resolvePendingReportsForProduct,
} from "./productReportHelpers.js";

/**
 * @param {{ reporterId: string, productId: string, reportText: unknown }} args
 */
export async function submitProductReport({ reporterId, productId, reportText }) {
  const text = String(reportText ?? "").trim();

  if (text.length === 0) {
    throw new AppError(400, "Укажите текст жалобы");
  }
  if (text.length > PRODUCT_REPORT_TEXT_MAX_CHARS) {
    throw new AppError(
      400,
      `Текст жалобы: не больше ${PRODUCT_REPORT_TEXT_MAX_CHARS} символов`,
    );
  }

  const product = await ProductModel.findById(productId)
    .select("productSeller productModerationStatus")
    .lean();

  if (!product) {
    throw new AppError(404, "Товар не найден");
  }
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    throw new AppError(400, "Жалоба доступна только на одобренные товары");
  }

  const sellerId = String(product.productSeller);
  if (sellerId === String(reporterId)) {
    throw new AppError(400, "Нельзя пожаловаться на свой товар");
  }

  const existingPending = await ProductReportModel.findOne({
    productId,
    reporterUserId: reporterId,
    status: PRODUCT_REPORT_STATUS_PENDING,
  }).lean();

  if (existingPending) {
    throw new AppError(409, PRODUCT_REPORT_ALREADY_MESSAGE);
  }

  try {
    await ProductReportModel.create({
      productId,
      reporterUserId: reporterId,
      reportText: text,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new AppError(409, PRODUCT_REPORT_ALREADY_MESSAGE);
    }
    throw error;
  }

  await notifySellerAboutProductReport(sellerId, productId);
  return { message: "Жалоба принята" };
}

/**
 * @param {{ reporterId: string, productId: string }} args
 */
export async function getMyProductReportStatus({ reporterId, productId }) {
  const pending = await ProductReportModel.findOne({
    productId,
    reporterUserId: reporterId,
    status: PRODUCT_REPORT_STATUS_PENDING,
  })
    .select("_id")
    .lean();

  return { hasPendingReport: Boolean(pending) };
}

export async function listPendingProductReports() {
  const { groups, totalReports } = await getPendingProductReportGroups();
  return {
    groups,
    totalReports,
    totalGroups: groups.length,
  };
}

export async function countPendingProductReports() {
  const totalReports = await ProductReportModel.countDocuments({
    status: PRODUCT_REPORT_STATUS_PENDING,
  });
  return { totalReports };
}

/**
 * @param {{
 *   productId: string,
 *   staffUserId: string,
 *   staffNote: unknown,
 *   resolution: unknown,
 * }} args
 */
export async function resolveProductReportsForProduct({
  productId,
  staffUserId,
  staffNote,
  resolution,
}) {
  const note = String(staffNote ?? "").trim();
  if (note.length === 0) {
    throw new AppError(400, "Комментарий staff обязателен");
  }

  const result = await resolvePendingReportsForProduct(
    productId,
    staffUserId,
    note,
    String(resolution ?? "").trim(),
  );

  return {
    message: "Жалобы по товару обработаны",
    resolvedCount: result.resolvedCount,
  };
}
