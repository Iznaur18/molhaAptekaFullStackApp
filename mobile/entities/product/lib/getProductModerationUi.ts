import { PRODUCT_MODERATION_PAGE_UI } from "@/shared/config";
import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
  PRODUCT_MODERATION_REJECTED,
} from "@/entities/product/model/productModerationConstants";

type ModerationProduct = {
  productModerationStatus?: string;
  productModerationComment?: string | null;
};

export const getProductModerationBadgeLabel = (product: ModerationProduct): string => {
  const status = product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED;
  if (status === PRODUCT_MODERATION_PENDING) {
    return PRODUCT_MODERATION_PAGE_UI.BADGE_PENDING;
  }
  if (status === PRODUCT_MODERATION_REJECTED) {
    return PRODUCT_MODERATION_PAGE_UI.BADGE_REJECTED;
  }
  return PRODUCT_MODERATION_PAGE_UI.BADGE_APPROVED;
};

export const getProductModerationBadgeVariant = (
  product: ModerationProduct,
): "pending" | "approved" | "rejected" => {
  const status = product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED;
  if (status === PRODUCT_MODERATION_PENDING) {
    return "pending";
  }
  if (status === PRODUCT_MODERATION_REJECTED) {
    return "rejected";
  }
  return "approved";
};

export const canSellerEditProduct = (product: ModerationProduct): boolean =>
  (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) !== PRODUCT_MODERATION_PENDING;

export const canSellerDeleteProduct = (product: ModerationProduct): boolean =>
  (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
  PRODUCT_MODERATION_APPROVED;

export const canSellerToggleCatalogVisibility = (product: ModerationProduct): boolean =>
  (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
  PRODUCT_MODERATION_APPROVED;

export const getProductModerationRejectionComment = (
  product: ModerationProduct,
  isMineMode: boolean,
): string | null => {
  if (
    !isMineMode ||
    product.productModerationStatus !== PRODUCT_MODERATION_REJECTED
  ) {
    return null;
  }
  const comment = String(product.productModerationComment ?? "").trim();
  return comment || null;
};

export const isProductModerationPending = (product: ModerationProduct): boolean =>
  (product.productModerationStatus ?? PRODUCT_MODERATION_APPROVED) ===
  PRODUCT_MODERATION_PENDING;

export const shouldShowProductModerationPendingOverlay = (
  product: ModerationProduct,
  {
    isMineMode = false,
    isModerationQueue = false,
  }: { isMineMode?: boolean; isModerationQueue?: boolean } = {},
): boolean =>
  isProductModerationPending(product) && (isMineMode || isModerationQueue);
