import {
  PRODUCT_CATEGORY_PILOT_SEED,
  PRODUCT_CATEGORY_PILOT_SEED_HARDCODED,
} from "../../constants/productCategoryPilotSeed.js";
import {
  PRODUCT_CATEGORY_ROOTS_SEED,
  PRODUCT_CATEGORY_ROOTS_SEED_HARDCODED,
} from "../../constants/productCategoryRootsSeed.js";
import { PRODUCT_CATEGORY_TREE_MAX_DEPTH } from "../../constants/productCategoryTreeConstants.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { normalizeProductCategorySearchKeywords } from "./normalizeProductCategorySearchKeywords.js";

/**
 * Идемпотентный upsert дерева (родители раньше детей).
 * Прод: пустой seed. Тесты/e2e: `seedHardcodedProductCategoryTree()`.
 */
export const PRODUCT_CATEGORY_TREE_SEED = [
  // ...PRODUCT_CATEGORY_ROOTS_SEED_HARDCODED,
  // ...PRODUCT_CATEGORY_PILOT_SEED_HARDCODED,
  ...PRODUCT_CATEGORY_ROOTS_SEED,
  ...PRODUCT_CATEGORY_PILOT_SEED,
];

export const HARDCODED_PRODUCT_CATEGORY_TREE_SEED = [
  ...PRODUCT_CATEGORY_ROOTS_SEED_HARDCODED,
  ...PRODUCT_CATEGORY_PILOT_SEED_HARDCODED,
];

export const HARDCODED_PRODUCT_CATEGORY_SLUGS =
  HARDCODED_PRODUCT_CATEGORY_TREE_SEED.map((node) => node.slug);

export const seedProductCategoryTree = async (
  nodes = PRODUCT_CATEGORY_TREE_SEED,
) => {
  const slugToId = new Map();

  for (const node of nodes) {
    const parentId = node.parentSlug ? (slugToId.get(node.parentSlug) ?? null) : null;

    if (node.parentSlug && !parentId) {
      throw new Error(
        `seedProductCategoryTree: parent "${node.parentSlug}" not found for "${node.slug}"`,
      );
    }

    let pathSlugs = [node.slug];
    let pathIds = [];
    let pathLabelRu = [node.labelRu];
    let depth = 0;

    if (parentId) {
      const parent = await ProductCategoryModel.findById(parentId).lean();
      if (!parent) {
        throw new Error(
          `seedProductCategoryTree: parent doc missing for "${node.slug}"`,
        );
      }
      depth = Number(parent.depth) + 1;
      if (depth > PRODUCT_CATEGORY_TREE_MAX_DEPTH) {
        throw new Error(
          `seedProductCategoryTree: max depth exceeded at "${node.slug}"`,
        );
      }
      pathSlugs = [...parent.pathSlugs, node.slug];
      pathIds = [...parent.pathIds, parent._id];
      pathLabelRu = [...parent.pathLabelRu, node.labelRu];
    }

    const update = {
      labelRu: node.labelRu,
      parentId,
      depth,
      pathSlugs,
      pathIds,
      pathLabelRu,
      searchKeywords: normalizeProductCategorySearchKeywords(node.searchKeywords ?? []),
      isLeaf: node.isLeaf === true,
      sortOrder: Number(node.sortOrder) || 0,
      ...(node.legacyProductCategory
        ? { legacyProductCategory: node.legacyProductCategory }
        : {}),
    };

    const doc = await ProductCategoryModel.findOneAndUpdate(
      { slug: node.slug },
      {
        $set: update,
        $setOnInsert: { slug: node.slug },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();

    slugToId.set(node.slug, doc._id);
  }
};

/** Только тесты / e2e. Прод не вызывает. */
export const seedHardcodedProductCategoryTree = async () => {
  await seedProductCategoryTree(HARDCODED_PRODUCT_CATEGORY_TREE_SEED);
};
