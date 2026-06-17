import { PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS } from "../../constants/productPromotionConstants.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * @param {Record<string, unknown>} query
 */
export const parsePromotionPagination = (query) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPromotionPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

/**
 * @param {Record<string, unknown>} row
 */
export const toPromotionPayload = (row) => ({
  _id: String(row._id),
  productId: String(row.productId),
  sellerId: String(row.sellerId),
  status: row.status,
  tier: row.tier ?? null,
  tariffCode: row.tariffCode,
  tariffTitle: row.tariffTitle,
  durationHours: row.durationHours,
  amountRub: row.amountRub,
  paymentMethod: row.paymentMethod ?? PRODUCT_PROMOTION_PAYMENT_METHOD_POINTS,
  amountPoints: row.amountPoints ?? null,
  pointsChargedAt: row.pointsChargedAt ?? null,
  pointsRefundedAt: row.pointsRefundedAt ?? null,
  rubChargedAt: row.rubChargedAt ?? null,
  rubRefundedAt: row.rubRefundedAt ?? null,
  productName: row.productName ?? null,
  activatedAt: row.activatedAt,
  activeUntil: row.activeUntil,
  cancelledAt: row.cancelledAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

/**
 * @param {Record<string, unknown>} row
 * @param {{ product?: Record<string, unknown> | null; seller?: Record<string, unknown> | null }} context
 */
export const toStaffPromotionPayload = (row, { product, seller }) => ({
  ...toPromotionPayload(row),
  productName: product?.productName ?? row.productName ?? null,
  seller: seller
    ? {
        _id: String(seller._id),
        userName: seller.userName ?? null,
      }
    : null,
});
