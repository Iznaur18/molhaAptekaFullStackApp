import ProductCategoryDisplayModel from "../../models/ProductCategoryDisplayModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";

const REMOVED_CATEGORY_SLUGS = ["furniture", "figures"];

export const up = async () => {
  const removedCategories = await ProductCategoryModel.find({
    slug: { $in: REMOVED_CATEGORY_SLUGS },
  })
    .select("_id slug")
    .lean();

  const removedIds = removedCategories.map((row) => row._id);

  if (removedIds.length > 0) {
    await ProductModel.updateMany(
      { productCategoryId: { $in: removedIds } },
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
    categorySlug: { $in: REMOVED_CATEGORY_SLUGS },
  });
};
