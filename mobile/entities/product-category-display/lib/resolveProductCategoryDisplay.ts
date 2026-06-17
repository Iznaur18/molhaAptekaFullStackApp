import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "@/entities/product/lib/productCategoryLabels";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

import type { ProductCategoryRootNode } from "../model/types";

/** SVG data-uri — нейтральная иконка категории до кастома admin (sync web). */
export const PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='12' fill='%23eef2ff'/%3E%3Cpath d='M20 42V26l12-8 12 8v16' stroke='%236366f1' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export type ProductCategoryDisplayFromApi = {
  categorySlug?: string | null;
  categoryId?: string | null;
  customLabel?: string | null;
  imageUrl?: string | null;
};

export type ResolvedProductCategoryDisplay = {
  categoryId: string | null;
  categorySlug: string;
  label: string;
  imageUrl: string | null;
  isCustomLabel: boolean;
  isCustomImage: boolean;
};

const mapCategoryDisplaysBySlug = (
  displays: ProductCategoryDisplayFromApi[],
): Map<string, ProductCategoryDisplayFromApi> =>
  new Map(
    displays
      .filter((row) => typeof row.categorySlug === "string" && row.categorySlug.trim())
      .map((row) => [String(row.categorySlug).trim(), row]),
  );

const resolveCatalogCategoryDisplayFields = (
  categorySlug: string,
  overridesBySlug: Map<string, ProductCategoryDisplayFromApi>,
  fallbackLabel: string,
) => {
  const override = overridesBySlug.get(categorySlug);
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    label: customLabel ?? fallbackLabel,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
};

const findRootForLegacySlug = (
  roots: ProductCategoryRootNode[],
  legacySlug: string,
): ProductCategoryRootNode | null =>
  roots.find(
    (root) => root.legacyProductCategory === legacySlug || root.slug === legacySlug,
  ) ?? null;

export const buildResolvedProductCategoryDisplaysFromRoots = (
  roots: ProductCategoryRootNode[],
  displays: ProductCategoryDisplayFromApi[],
): ResolvedProductCategoryDisplay[] => {
  const overridesBySlug = mapCategoryDisplaysBySlug(displays);
  const matchedRootIds = new Set<string>();
  const items: ResolvedProductCategoryDisplay[] = [];

  for (const legacySlug of PRODUCT_CATEGORIES) {
    const root = findRootForLegacySlug(roots, legacySlug);
    if (root) {
      matchedRootIds.add(root.id);
    }

    const displaySlug = root?.slug ?? legacySlug;
    const fields = resolveCatalogCategoryDisplayFields(
      displaySlug,
      overridesBySlug,
      root?.labelRu ?? PRODUCT_CATEGORY_LABEL_RU[legacySlug] ?? legacySlug,
    );

    items.push({
      categoryId: root?.id ?? null,
      categorySlug: legacySlug,
      ...fields,
    });
  }

  for (const root of roots) {
    if (matchedRootIds.has(root.id)) {
      continue;
    }

    const fields = resolveCatalogCategoryDisplayFields(
      root.slug,
      overridesBySlug,
      root.labelRu || root.slug,
    );

    items.push({
      categoryId: root.id,
      categorySlug: root.slug,
      ...fields,
    });
  }

  return items;
};

export const resolveCategoryDisplayTileImageUri = (
  imageUrl: string | null | undefined,
  placeholderImageUrl: string = PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
): string => {
  const trimmed = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!trimmed) {
    return placeholderImageUrl;
  }
  return resolveUploadedMediaUrl(trimmed);
};
