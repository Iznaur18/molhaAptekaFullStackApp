import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { PRODUCT_CATEGORY_VALUES } from "../../constants/productConstants.js";
import { UNCATEGORIZED_PRODUCT_CATEGORY_SLUG } from "../../constants/productCategoryTreeConstants.js";

export const PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR = " › ";

/** @deprecated TEMP: снова включить маппинг legacy → лист дерева */
const REQUIRE_LEGACY_CATEGORY_TREE_LEAF = false;

const uncategorizedProductCategoryWrite = () => ({
  productCategoryId: null,
  categoryPathIds: [],
  categoryBreadcrumbRu: "",
  productCategory: UNCATEGORIZED_PRODUCT_CATEGORY_SLUG,
  categorySearchKeywords: [],
  categoryPathLabelRu: [],
});

/**
 * @param {import('mongoose').Types.ObjectId | string} categoryId
 */
export const loadLeafProductCategoryOrThrow = async (categoryId) => {
  const category = await ProductCategoryModel.findById(categoryId).lean();

  if (!category) {
    throw new Error("Категория не найдена");
  }
  if (category.isLeaf !== true) {
    throw new Error("Укажите конечную подкатегорию (лист дерева)");
  }

  return category;
};

/**
 * @param {import('mongoose').LeanDocument<import('../models/ProductCategoryModel.js').default>} leaf
 */
const resolveLegacyProductCategorySlug = async (leaf) => {
  if (
    typeof leaf.legacyProductCategory === "string" &&
    leaf.legacyProductCategory.trim()
  ) {
    return leaf.legacyProductCategory.trim();
  }

  const rootId = Array.isArray(leaf.pathIds) ? leaf.pathIds[0] : null;
  if (!rootId) {
    return typeof leaf.slug === "string" && leaf.slug.trim()
      ? leaf.slug.trim()
      : PRODUCT_CATEGORY_VALUES[0];
  }

  const root = await ProductCategoryModel.findById(rootId)
    .select("legacyProductCategory slug")
    .lean();

  if (
    typeof root?.legacyProductCategory === "string" &&
    root.legacyProductCategory.trim()
  ) {
    return root.legacyProductCategory.trim();
  }

  const slug = typeof root?.slug === "string" ? root.slug.trim() : "";
  if (slug) {
    return slug;
  }

  return PRODUCT_CATEGORY_VALUES[0];
};

/**
 * @param {string | import('mongoose').Types.ObjectId} categoryId
 */
export const resolveProductCategoryWriteFromId = async (categoryId) => {
  const leaf = await loadLeafProductCategoryOrThrow(categoryId);
  const pathIds = [...(Array.isArray(leaf.pathIds) ? leaf.pathIds : []), leaf._id];
  const pathLabelRu = Array.isArray(leaf.pathLabelRu) ? leaf.pathLabelRu : [];
  const categoryBreadcrumbRu = [...pathLabelRu, leaf.labelRu]
    .filter(Boolean)
    .join(PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR);

  const productCategory = await resolveLegacyProductCategorySlug(leaf);

  return {
    productCategoryId: leaf._id,
    categoryPathIds: pathIds,
    categoryBreadcrumbRu,
    productCategory,
    categorySearchKeywords: Array.isArray(leaf.searchKeywords)
      ? leaf.searchKeywords
      : [],
    categoryPathLabelRu: [...pathLabelRu, leaf.labelRu].filter(Boolean),
  };
};

/**
 * Дефолтный лист для legacy enum (пилот: только ветки с деревом).
 *
 * @param {string} legacySlug
 * @returns {Promise<string | null>}
 */
export const resolveDefaultLeafIdForLegacyCategory = async (legacySlug) => {
  const normalized = String(legacySlug ?? "").trim();
  if (!normalized) {
    return null;
  }

  const root =
    (await ProductCategoryModel.findOne({
      parentId: null,
      $or: [{ legacyProductCategory: normalized }, { slug: normalized }],
    })
      .select("_id")
      .lean()) ??
    (await ProductCategoryModel.findOne({
      $or: [{ legacyProductCategory: normalized }, { slug: normalized }],
    })
      .sort({ depth: 1 })
      .select("_id")
      .lean());

  if (!root) {
    return null;
  }

  const leaf = await ProductCategoryModel.findOne({
    isLeaf: true,
    pathIds: root._id,
  })
    .sort({ sortOrder: 1, labelRu: 1 })
    .select("_id")
    .lean();

  return leaf?._id ? String(leaf._id) : null;
};

/**
 * Legacy enum без привязки к дереву (временный режим).
 *
 * @param {string} legacySlug
 */
export const resolveProductCategoryWriteFromLegacySlugOnly = async (legacySlug) => {
  const productCategory = String(legacySlug).trim();
  if (!productCategory) {
    throw new Error("Указана неизвестная категория товара");
  }

  const root = await ProductCategoryModel.findOne({
    parentId: null,
    $or: [{ slug: productCategory }, { legacyProductCategory: productCategory }],
  })
    .select("_id")
    .lean();

  if (!root && !PRODUCT_CATEGORY_VALUES.includes(productCategory)) {
    throw new Error("Указана неизвестная категория товара");
  }

  return {
    productCategoryId: null,
    categoryPathIds: [],
    categoryBreadcrumbRu: "",
    productCategory,
    categorySearchKeywords: [],
    categoryPathLabelRu: [],
  };
};

/**
 * @param {{ productCategoryId?: unknown; productCategory?: unknown }} body
 */
export const resolveProductCategoryWriteFromBody = async (body) => {
  const rawId = body?.productCategoryId;
  if (rawId != null && String(rawId).trim() !== "") {
    const categoryId = String(rawId).trim();
    const category = await ProductCategoryModel.findById(categoryId)
      .select("_id isLeaf")
      .lean();
    if (!category) {
      // Удалённый seed / устаревший id в форме — не блокируем публикацию.
      return uncategorizedProductCategoryWrite();
    }
    return resolveProductCategoryWriteFromId(categoryId);
  }

  const legacy = body?.productCategory;
  if (legacy == null || String(legacy).trim() === "") {
    return uncategorizedProductCategoryWrite();
  }

  const legacySlug = String(legacy).trim();
  const leafId = await resolveDefaultLeafIdForLegacyCategory(legacySlug);
  if (leafId) {
    return resolveProductCategoryWriteFromId(leafId);
  }

  if (!REQUIRE_LEGACY_CATEGORY_TREE_LEAF) {
    return resolveProductCategoryWriteFromLegacySlugOnly(legacySlug);
  }

  throw new Error(
    "Для этой категории укажите productCategoryId (конечная подкатегория из дерева)",
  );
};
