import { isRuRegionCode } from "@molha/api-contract";

import { mapProductCharacteristicsToRows } from "@/entities/product/lib/productCharacteristicRows";
import {
  createProductReturnTermRow,
  mapProductReturnTermsToRows,
  type ProductReturnTermRow,
} from "@/entities/product/lib/productReturnTermRows";
import {
  isProductListingOrigin,
  type ProductListingOrigin,
} from "@/entities/product/lib/productListingOrigin";
import { resolveProductImageUrls } from "@/entities/product/lib/resolveProductImageUrls";
import { resolveProductLoyaltyPointsPerUnit } from "@/entities/product/lib/resolveProductLoyaltyPointsPerUnit";
import { formatRubPriceInput } from "@/shared/lib/rubPriceInput";

export type CopiedProductWizardForm = {
  productName: string;
  productListingOrigin: ProductListingOrigin | null;
  productIsOriginal: boolean;
  productDescription: string;
  characteristicRows: Array<{ id: number; key: string; value: string }>;
  imageUrls: string[];
  productPreviewVideoUrl: string;
  productCategoryId: string | null;
  productCategoryLabel: string;
  productCategory: string;
  productRegionCode: string;
  productPickupAddress: string;
  productPickupLat: number | null;
  productPickupLon: number | null;
  productPickupSelectedFromSuggest: boolean;
  productPickupEnabled: boolean;
  productDeliveryEnabled: boolean;
  productPrice: string;
  productOldPrice: string;
  productIsAvailable: boolean;
  productStockQuantity: string;
  loyaltyPointsPerUnit: string;
  productReturnEnabled: boolean | null;
  returnTermRows: ProductReturnTermRow[];
};

const DEFAULT_PRODUCT_CATEGORY = "electronics";

const resolveReturnPolicyPrefill = (
  product: Record<string, unknown>,
): { enabled: boolean | null; rows: ProductReturnTermRow[] } => {
  if (product.productReturnEnabled !== true) {
    return {
      enabled: product.productReturnEnabled === false ? false : null,
      rows: [],
    };
  }
  const rows = mapProductReturnTermsToRows(product.productReturnTerms);
  return {
    enabled: true,
    rows: rows.length > 0 ? rows : [createProductReturnTermRow()],
  };
};

export const createProductWizardFormFromCopiedProduct = (
  product: Record<string, unknown>,
): CopiedProductWizardForm => {
  const categoryId =
    typeof product.productCategoryId === "string" && product.productCategoryId.trim()
      ? product.productCategoryId.trim()
      : null;
  const regionRaw =
    typeof product.productRegionCode === "string" ? product.productRegionCode.trim() : "";
  const stockRaw = Number.parseInt(String(product.productStockQuantity ?? ""), 10);
  const latRaw = product.productPickupLat;
  const lonRaw = product.productPickupLon;
  const oldPrice = product.productOldPrice;
  const returnPrefill = resolveReturnPolicyPrefill(product);

  return {
    productName: String(product.productName ?? "").trim(),
    productListingOrigin: isProductListingOrigin(product.productListingOrigin)
      ? product.productListingOrigin
      : null,
    productIsOriginal: product.productIsOriginal === true,
    productDescription: String(product.productDescription ?? "").trim(),
    characteristicRows: mapProductCharacteristicsToRows(product.productCharacteristics),
    imageUrls: resolveProductImageUrls(product),
    productPreviewVideoUrl: String(product.productPreviewVideoUrl ?? "").trim(),
    productCategoryId: categoryId,
    productCategoryLabel: String(
      product.categoryBreadcrumbRu ?? product.productCategoryLabelRu ?? "",
    ).trim(),
    productCategory: String(product.productCategory ?? DEFAULT_PRODUCT_CATEGORY),
    productRegionCode: isRuRegionCode(regionRaw) ? regionRaw : "",
    productPickupAddress: String(product.productPickupAddress ?? "").trim(),
    productPickupLat:
      latRaw != null && Number.isFinite(Number(latRaw)) ? Number(latRaw) : null,
    productPickupLon:
      lonRaw != null && Number.isFinite(Number(lonRaw)) ? Number(lonRaw) : null,
    productPickupSelectedFromSuggest:
      String(product.productPickupAddress ?? "").trim().length > 0,
    productPickupEnabled: product.productPickupEnabled !== false,
    productDeliveryEnabled: product.productDeliveryEnabled === true,
    productPrice: formatRubPriceInput(product.productPrice ?? ""),
    productOldPrice:
      oldPrice != null && Number.isFinite(Number(oldPrice))
        ? formatRubPriceInput(Math.floor(Number(oldPrice)))
        : "",
    productIsAvailable: true,
    productStockQuantity: Number.isFinite(stockRaw) && stockRaw > 0 ? String(stockRaw) : "1",
    loyaltyPointsPerUnit: String(resolveProductLoyaltyPointsPerUnit(product)),
    productReturnEnabled: returnPrefill.enabled,
    returnTermRows: returnPrefill.rows,
  };
};
