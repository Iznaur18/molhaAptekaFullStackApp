import ProductCategoryDisplayModel from "../models/ProductCategoryDisplayModel.js";

/**
 * @param {string} categorySlug
 */
export const ensureProductCategoryDisplayForSlug = async (categorySlug) => {
  const slug = String(categorySlug ?? "").trim();
  if (!slug) {
    return;
  }

  await ProductCategoryDisplayModel.findOneAndUpdate(
    { categorySlug: slug },
    { $setOnInsert: { categorySlug: slug } },
    { upsert: true },
  );
};

/**
 * @param {string[]} categorySlugs
 */
export const ensureProductCategoryDisplaysForSlugs = async (categorySlugs) => {
  for (const slug of categorySlugs) {
    await ensureProductCategoryDisplayForSlug(slug);
  }
};
