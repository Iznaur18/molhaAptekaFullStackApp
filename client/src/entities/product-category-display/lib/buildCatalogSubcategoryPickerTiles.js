import {
  PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
  mapCategoryDisplaysById,
} from "./resolveProductCategoryNodeDisplay.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";

/** @typedef {'view-all' | 'category'} CatalogSubcategoryPickerTileKind */

/**
 * @typedef {Object} CatalogSubcategoryPickerTile
 * @property {string} key
 * @property {CatalogSubcategoryPickerTileKind} kind
 * @property {string} categoryId
 * @property {string} label
 * @property {string | null} imageUrl
 * @property {boolean} isCustomLabel
 * @property {boolean} isCustomImage
 * @property {boolean} isEditable
 */

/**
 * @param {{
 *   parent: { id: string; labelRu: string };
 *   categories: import('../../product-category-tree/model/types.js').ProductCategoryNode[];
 *   displays: import('../model/types.js').ProductCategoryDisplayFromApi[];
 * }} params
 * @returns {CatalogSubcategoryPickerTile[]}
 */
export function buildCatalogSubcategoryPickerTiles({ parent, categories, displays }) {
  const overridesById = mapCategoryDisplaysById(displays);

  /** @type {CatalogSubcategoryPickerTile[]} */
  const tiles = [
    {
      key: `view-all:${parent.id}`,
      kind: "view-all",
      categoryId: parent.id,
      label: PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_VIEW_ALL,
      imageUrl: PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE,
      isCustomLabel: false,
      isCustomImage: false,
      isEditable: false,
    },
  ];

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
}
