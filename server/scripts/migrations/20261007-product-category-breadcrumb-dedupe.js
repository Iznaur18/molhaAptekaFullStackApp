import {
  PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR,
  buildLeafCategoryPathLabels,
} from "../../services/product/resolveProductCategoryWrite.js";

/**
 * Убирает повтор последней подкатегории в хлебных крошках товаров:
 * «Кафе и рестораны › Пицца › Пицца» → «Кафе и рестораны › Пицца».
 *
 * Повтор писал общий код выбора категории (починен в том же коммите): путь
 * узла уже кончается его названием, а оно дописывалось ещё раз. Задело все
 * товары с подкатегорией.
 *
 * Крошки пересобираем из категории товара, а не правкой строки: так они
 * заодно сверяются с текущими названиями узлов. Пишем через коллекцию, чтобы
 * не трогать `updatedAt` товара — это не правка продавца. Поисковый blob не
 * пересобираем: лишнее повторённое слово на поиск не влияет.
 *
 * Идемпотентно: обновляются только товары, у которых крошки отличаются.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const products = db.collection("products");
  const categories = db.collection("productcategories");

  const categoryIds = await products.distinct("productCategoryId", {
    productCategoryId: { $ne: null },
  });
  const leaves = await categories
    .find({ _id: { $in: categoryIds } }, { projection: { pathLabelRu: 1, labelRu: 1 } })
    .toArray();

  let categoriesChecked = 0;
  let productsToFix = 0;
  let productsFixed = 0;

  for (const leaf of leaves) {
    categoriesChecked += 1;
    const categoryBreadcrumbRu = buildLeafCategoryPathLabels(leaf).join(
      PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR,
    );
    if (!categoryBreadcrumbRu) continue;

    const filter = {
      productCategoryId: leaf._id,
      categoryBreadcrumbRu: { $ne: categoryBreadcrumbRu },
    };

    if (!isApply) {
      productsToFix += await products.countDocuments(filter);
      continue;
    }

    const result = await products.updateMany(filter, {
      $set: { categoryBreadcrumbRu },
    });
    productsToFix += result.matchedCount;
    productsFixed += result.modifiedCount;
  }

  return {
    categoriesChecked,
    // Категории, которых уже нет в дереве: их товары не трогаем.
    categoriesMissing: categoryIds.length - leaves.length,
    productsToFix,
    productsFixed,
  };
}
