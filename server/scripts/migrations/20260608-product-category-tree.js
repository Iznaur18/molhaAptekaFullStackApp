import { seedProductCategoryTree } from "../../utils/seedProductCategoryTree.js";

export const up = async () => {
  await seedProductCategoryTree();
};
