import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";

/**
 * @param {string | null | undefined} categoryId
 * @param {string[]} slugCandidates
 */
const buildDisplayMatchOrClauses = (categoryId, slugCandidates) => {
  /** @type {Record<string, unknown>[]} */
  const orClauses = [];

  if (categoryId) {
    orClauses.push({ categoryId });
  }

  for (const slug of slugCandidates) {
    orClauses.push({ categorySlug: slug });
  }

  return orClauses;
};

/**
 * @param {import("mongoose").Types.ObjectId | string | null | undefined} categoryId
 * @param {string | null | undefined} categorySlug
 */
const collectSlugCandidates = async (categoryId, categorySlug) => {
  /** @type {Set<string>} */
  const slugs = new Set();

  if (typeof categorySlug === "string" && categorySlug.trim()) {
    slugs.add(categorySlug.trim());
  }

  /** @type {Record<string, unknown> | null} */
  let root = null;

  if (categoryId) {
    root = await ProductCategoryModel.findById(categoryId).lean();
  } else if (slugs.size > 0) {
    const slug = [...slugs][0];
    root =
      (await ProductCategoryModel.findOne({
        $or: [{ slug }, { legacyProductCategory: slug }],
      }).lean()) ?? null;
  }

  if (root) {
    if (typeof root.slug === "string" && root.slug.trim()) {
      slugs.add(root.slug.trim());
    }
    if (typeof root.legacyProductCategory === "string" && root.legacyProductCategory.trim()) {
      slugs.add(root.legacyProductCategory.trim());
    }
  }

  return {
    root,
    slugs: [...slugs],
  };
};

/**
 * @param {Record<string, unknown>[]} rows
 * @param {string | null} categoryId
 */
const pickPrimaryCategoryDisplay = (rows, categoryId) => {
  if (rows.length === 0) {
    return null;
  }

  if (categoryId) {
    const byId = rows.find((row) => row.categoryId && String(row.categoryId) === categoryId);
    if (byId) {
      return byId;
    }
  }

  const withSlug = rows.find(
    (row) => typeof row.categorySlug === "string" && row.categorySlug.trim(),
  );
  if (withSlug) {
    return withSlug;
  }

  return rows[0];
};

/**
 * @param {string | null} categoryId
 * @param {string[]} slugCandidates
 * @param {import("mongoose").Types.ObjectId | null | undefined} exceptId
 */
const deleteMatchingCategoryDisplays = async (categoryId, slugCandidates, exceptId = null) => {
  const orClauses = buildDisplayMatchOrClauses(categoryId, slugCandidates);
  if (orClauses.length === 0) {
    return;
  }

  /** @type {Record<string, unknown>} */
  const filter = { $or: orClauses };
  if (exceptId) {
    filter._id = { $ne: exceptId };
  }

  await ProductCategoryDisplayModel.deleteMany(filter);
};

/**
 * @param {string | null} categoryId
 * @param {string[]} slugCandidates
 */
const findMatchingCategoryDisplays = async (categoryId, slugCandidates) => {
  const orClauses = buildDisplayMatchOrClauses(categoryId, slugCandidates);
  if (orClauses.length === 0) {
    return [];
  }

  return ProductCategoryDisplayModel.find({ $or: orClauses }).lean();
};

/**
 * @param {{ categoryId?: string | null; categorySlug?: string | null }} keys
 */
export const resolveProductCategoryDisplayPatchTarget = async ({
  categoryId = null,
  categorySlug = null,
}) => {
  const normalizedCategoryId =
    typeof categoryId === "string" && categoryId.trim() ? categoryId.trim() : null;
  const normalizedCategorySlug =
    typeof categorySlug === "string" && categorySlug.trim() ? categorySlug.trim() : null;

  const { root, slugs: slugCandidates } = await collectSlugCandidates(
    normalizedCategoryId,
    normalizedCategorySlug,
  );

  const resolvedCategoryId = normalizedCategoryId ?? (root?._id ? String(root._id) : null);
  const matches = await findMatchingCategoryDisplays(resolvedCategoryId, slugCandidates);
  const existing = pickPrimaryCategoryDisplay(matches, resolvedCategoryId);

  return {
    existing: existing ?? null,
    filter: existing?._id ? { _id: existing._id } : null,
    slugCandidates,
    categoryId: resolvedCategoryId,
    matches,
  };
};

/**
 * @param {{
 *   categoryId?: string | null;
 *   categorySlug?: string | null;
 *   update: Record<string, unknown>;
 * }} params
 */
export const upsertProductCategoryDisplay = async ({
  categoryId = null,
  categorySlug = null,
  update,
}) => {
  const target = await resolveProductCategoryDisplayPatchTarget({
    categoryId,
    categorySlug,
  });

  if (target.existing?._id) {
    await deleteMatchingCategoryDisplays(
      target.categoryId,
      target.slugCandidates,
      target.existing._id,
    );

    return ProductCategoryDisplayModel.findByIdAndUpdate(
      target.existing._id,
      { $set: update },
      { returnDocument: "after", runValidators: true },
    ).lean();
  }

  await deleteMatchingCategoryDisplays(target.categoryId, target.slugCandidates);

  if (target.categoryId) {
    return ProductCategoryDisplayModel.findOneAndUpdate(
      { categoryId: target.categoryId },
      { $set: { categoryId: target.categoryId, ...update } },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();
  }

  const insertSlug =
    target.slugCandidates[0] ??
    (typeof categorySlug === "string" && categorySlug.trim() ? categorySlug.trim() : null);
  if (!insertSlug) {
    throw new Error("Не удалось определить ключ display-категории");
  }

  return ProductCategoryDisplayModel.findOneAndUpdate(
    { categorySlug: insertSlug },
    { $set: { categorySlug: insertSlug, ...update } },
    { upsert: true, returnDocument: "after", runValidators: true },
  ).lean();
};
