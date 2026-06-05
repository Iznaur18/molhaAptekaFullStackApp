import {
  IN_APP_NOTIFICATION_KIND_REPORTER_RESOLVED,
  IN_APP_NOTIFICATION_KIND_SELLER_REPORT,
  IN_APP_NOTIFICATION_MESSAGE_REPORTER_RESOLVED,
  IN_APP_NOTIFICATION_MESSAGE_SELLER,
  PRODUCT_REPORT_RESOLUTION_DISMISS,
  PRODUCT_REPORT_RESOLUTION_HIDE,
  PRODUCT_REPORT_RESOLUTION_REJECT,
  PRODUCT_REPORT_STATUS_DISMISSED,
  PRODUCT_REPORT_STATUS_PENDING,
  PRODUCT_REPORT_STATUS_RESOLVED,
} from "../constants/productReportConstants.js";
import { PRODUCT_MODERATION_REJECTED } from "../constants/productModerationConstants.js";
import { ProductModel, ProductReportModel, UserModel } from "../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../constants/productSellerPublicFields.js";
import { attachProductSellerSnapshots } from "./attachProductSellerSnapshots.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";

const REPORTER_PUBLIC_SELECT = "_id userName";

/**
 * @param {string} productId
 */
export const dismissPendingReportsForProduct = async (productId) => {
  await ProductReportModel.updateMany(
    {
      productId,
      status: PRODUCT_REPORT_STATUS_PENDING,
    },
    {
      $set: {
        status: PRODUCT_REPORT_STATUS_DISMISSED,
        reviewedAt: new Date(),
      },
    },
  );
};

/**
 * @param {string} productId
 * @param {import('mongoose').Types.ObjectId | string} staffUserId
 * @param {string} staffNote
 * @param {'dismiss' | 'hide' | 'reject'} resolution
 */
export const resolvePendingReportsForProduct = async (
  productId,
  staffUserId,
  staffNote,
  resolution,
) => {
  const allowed = new Set([
    PRODUCT_REPORT_RESOLUTION_DISMISS,
    PRODUCT_REPORT_RESOLUTION_HIDE,
    PRODUCT_REPORT_RESOLUTION_REJECT,
  ]);
  if (!allowed.has(resolution)) {
    throw new Error("INVALID_RESOLUTION");
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const pendingReports = await ProductReportModel.find({
    productId,
    status: PRODUCT_REPORT_STATUS_PENDING,
  }).lean();

  if (pendingReports.length === 0) {
    throw new Error("NO_PENDING_REPORTS");
  }

  const now = new Date();
  const nextStatus =
    resolution === PRODUCT_REPORT_RESOLUTION_DISMISS
      ? PRODUCT_REPORT_STATUS_DISMISSED
      : PRODUCT_REPORT_STATUS_RESOLVED;

  if (resolution === PRODUCT_REPORT_RESOLUTION_HIDE) {
    product.productIsAvailable = false;
    await product.save();
  }

  if (resolution === PRODUCT_REPORT_RESOLUTION_REJECT) {
    product.productModerationStatus = PRODUCT_MODERATION_REJECTED;
    product.productModerationComment = staffNote;
    product.productIsAvailable = false;
    await product.save();
  }

  await ProductReportModel.updateMany(
    { productId, status: PRODUCT_REPORT_STATUS_PENDING },
    {
      $set: {
        status: nextStatus,
        staffNote,
        reviewedBy: staffUserId,
        reviewedAt: now,
      },
    },
  );

  const reporterIds = [
    ...new Set(pendingReports.map((row) => String(row.reporterUserId))),
  ];

  for (const reporterId of reporterIds) {
    await createUserInAppNotification({
      userId: reporterId,
      kind: IN_APP_NOTIFICATION_KIND_REPORTER_RESOLVED,
      message: IN_APP_NOTIFICATION_MESSAGE_REPORTER_RESOLVED,
      productId,
    });
  }

  return { resolvedCount: pendingReports.length };
};

/**
 * @param {import('mongoose').Types.ObjectId | string} sellerId
 * @param {import('mongoose').Types.ObjectId | string} productId
 */
export const notifySellerAboutProductReport = async (sellerId, productId) => {
  await createUserInAppNotification({
    userId: sellerId,
    kind: IN_APP_NOTIFICATION_KIND_SELLER_REPORT,
    message: IN_APP_NOTIFICATION_MESSAGE_SELLER,
    productId,
  });
};

/**
 * @returns {Promise<{
 *   groups: Array<{
 *     product: Record<string, unknown>;
 *     reportCount: number;
 *     reports: Array<Record<string, unknown>>;
 *   }>;
 *   totalReports: number;
 * }>}
 */
export const getPendingProductReportGroups = async () => {
  const rows = await ProductReportModel.aggregate([
    { $match: { status: PRODUCT_REPORT_STATUS_PENDING } },
    {
      $group: {
        _id: "$productId",
        reportCount: { $sum: 1 },
        reports: {
          $push: {
            _id: "$_id",
            reportText: "$reportText",
            createdAt: "$createdAt",
            reporterUserId: "$reporterUserId",
          },
        },
      },
    },
    { $sort: { reportCount: -1 } },
  ]);

  if (rows.length === 0) {
    return { groups: [], totalReports: 0 };
  }

  const productIds = rows.map((row) => row._id);
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
    .lean();
  const productsById = Object.fromEntries(
    (await attachProductSellerSnapshots(products)).map((product) => [
      String(product._id),
      product,
    ]),
  );

  const reporterIds = [
    ...new Set(
      rows.flatMap((row) => row.reports.map((report) => String(report.reporterUserId))),
    ),
  ];
  const reporters = await UserModel.find({ _id: { $in: reporterIds } })
    .select(REPORTER_PUBLIC_SELECT)
    .lean();
  const reportersById = Object.fromEntries(
    reporters.map((user) => [String(user._id), user]),
  );

  let totalReports = 0;
  const groups = rows
    .map((row) => {
      const product = productsById[String(row._id)];
      if (!product) return null;

      totalReports += row.reportCount;
      const reports = row.reports
        .map((report) => ({
          _id: String(report._id),
          reportText: report.reportText,
          createdAt: report.createdAt,
          reporter: reportersById[String(report.reporterUserId)] ?? {
            _id: String(report.reporterUserId),
          },
        }))
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      return {
        product,
        reportCount: row.reportCount,
        reports,
      };
    })
    .filter(Boolean);

  return { groups, totalReports };
};
