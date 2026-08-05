import { mapCategoryDisplaysById } from "@/entities/product-category-display/lib/mapCategoryDisplaysById";
import { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import type { ProductCategoryDisplayFromApi } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "@/shared/config";

export type CatalogSubcategoryPickerTileKind = "view-all" | "category";

export type CatalogSubcategoryPickerTile = {
  key: string;
  kind: CatalogSubcategoryPickerTileKind;
  categoryId: string;
  label: string;
  imageUrl: string | null;
  isCustomLabel: boolean;
  isCustomImage: boolean;
  isEditable: boolean;
};

type ProductCategoryChildNode = {
  id: string;
  labelRu: string;
};

type BuildCatalogSubcategoryPickerTilesParams = {
  parent: { id: string; labelRu: string };
  categories: ProductCategoryChildNode[];
  displays: ProductCategoryDisplayFromApi[];
  includeViewAll?: boolean;
};

export const buildCatalogSubcategoryPickerTiles = ({
  parent,
  categories,
  displays,
  includeViewAll = true,
}: BuildCatalogSubcategoryPickerTilesParams): CatalogSubcategoryPickerTile[] => {
  const overridesById = mapCategoryDisplaysById(displays);

  const tiles: CatalogSubcategoryPickerTile[] = [];

  if (includeViewAll) {
    tiles.push({
      key: `view-all:${parent.id}`,
      kind: "view-all",
      categoryId: parent.id,
      label: PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_VIEW_ALL,
      imageUrl: PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
      isCustomLabel: false,
      isCustomImage: false,
      isEditable: false,
    });
  }

  for (const node of categories) {
    const override = overridesById.get(node.id);
    const customLabel =
      typeof override?.customLabel === "string" && override.customLabel.trim()
        ? override.customLabel.trim()
        : null;
    const customImage =
      typeof override?.imageUrl === "string" && override.imageUrl.trim()
        ? override.imageUrl.trim()
        : null;

    tiles.push({
      key: node.id,
      kind: "category",
      categoryId: node.id,
      label: customLabel ?? node.labelRu,
      imageUrl: customImage,
      isCustomLabel: customLabel != null,
      isCustomImage: customImage != null,
      isEditable: true,
    });
  }

  return tiles;
};
