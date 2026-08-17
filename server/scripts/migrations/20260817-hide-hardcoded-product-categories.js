import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { HARDCODED_PRODUCT_CATEGORY_SLUGS } from "../../services/product/seedProductCategoryTree.js";

/**
 * Убрать seed-категории из каталога: пользователи их больше не видят.
 * Товары отвязываются (productCategoryId = null). Админ добавляет дерево сам.
 */
export const up = async () => {
  const removedCategories = await ProductCategoryModel.find({
    slug: { $in: HARDCODED_PRODUCT_CATEGORY_SLUGS },
  })
    .select("_id slug")
    .lean();

  const removedIds = removedCategories.map((row) => row._id);

  if (removedIds.length > 0) {
    await ProductModel.updateMany(
      {
        $or: [
          { productCategoryId: { $in: removedIds } },
          { categoryPathIds: { $in: removedIds } },
        ],
      },
      {
        $set: {
          productCategoryId: null,
          categoryPathIds: [],
          categoryBreadcrumbRu: "",
        },
      },
    );
    await ProductCategoryModel.deleteMany({ _id: { $in: removedIds } });
  }

  await ProductCategoryDisplayModel.deleteMany({
    categorySlug: { $in: HARDCODED_PRODUCT_CATEGORY_SLUGS },
  });
};
