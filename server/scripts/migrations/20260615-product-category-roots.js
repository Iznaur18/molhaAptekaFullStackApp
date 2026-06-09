import { PRODUCT_CATEGORY_ROOTS_SEED } from "../../constants/productCategoryRootsSeed.js";
import { seedProductCategoryTree } from "../../utils/seedProductCategoryTree.js";
import { ensureProductCategoryDisplaysForSlugs } from "../../utils/ensureProductCategoryDisplayForSlug.js";

export const up = async () => {
  await seedProductCategoryTree();
  await ensureProductCategoryDisplaysForSlugs(
    PRODUCT_CATEGORY_ROOTS_SEED.map((node) => node.slug),
  );
};
