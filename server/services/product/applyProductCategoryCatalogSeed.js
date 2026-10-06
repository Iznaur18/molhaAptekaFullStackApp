import { PRODUCT_CATEGORY_CATALOG_SEED } from "../../constants/productCategoryCatalogSeed.js";
import { PRODUCT_CATEGORY_TREE_MAX_DEPTH } from "../../constants/productCategoryTreeConstants.js";
import CuratedCategoryListModel from "../../models/CuratedCategoryListModel.js";
import OneCCategoryMappingModel from "../../models/OneCCategoryMappingModel.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import ProductModel from "../../models/ProductModel.js";
import { normalizeProductCategorySearchKeywords } from "./normalizeProductCategorySearchKeywords.js";
import {
  cleanupProductCategoryDisplayForDeletedCategory,
  detachProductsFromCategoryLeaf,
} from "./productCategoryDeleteHelpers.js";

const SIBLING_SORT_ORDER_STEP = 10;

/**
 * Слаг из сида уже занят узлом другого корня — апсерт по слагу молча
 * перевесил бы чужую ветку под наш корень. Проверяем до первой записи.
 *
 * @param {typeof PRODUCT_CATEGORY_CATALOG_SEED} seed
 */
const assertSeedSlugsDoNotCollide = async (seed) => {
  const seenSlugs = new Set();

  for (const { rootSlug, nodes } of seed) {
    for (const node of nodes) {
      if (seenSlugs.has(node.slug) || node.slug === rootSlug) {
        throw new Error(`applyProductCategoryCatalogSeed: дубль slug "${node.slug}"`);
      }
      seenSlugs.add(node.slug);
    }

    const foreign = await ProductCategoryModel.findOne({
      slug: { $in: nodes.map((node) => node.slug) },
      "pathSlugs.0": { $ne: rootSlug },
    })
      .select("slug pathSlugs")
      .lean();

    if (foreign) {
      throw new Error(
        `applyProductCategoryCatalogSeed: slug "${foreign.slug}" уже занят в корне "${foreign.pathSlugs?.[0]}", ожидался "${rootSlug}"`,
      );
    }
  }
};

/**
 * @param {import('mongoose').LeanDocument<any>} root
 * @param {typeof PRODUCT_CATEGORY_CATALOG_SEED[number]["nodes"]} nodes
 */
const upsertSeedNodesUnderRoot = async (root, nodes) => {
  const parentSlugs = new Set(nodes.map((node) => node.parentSlug ?? root.slug));
  /** Уже записанные узлы: по ним собираем путь детей без похода в базу. */
  const written = new Map([
    [
      root.slug,
      {
        _id: root._id,
        depth: 0,
        pathSlugs: [root.slug],
        pathIds: [],
        pathLabelRu: [root.labelRu],
      },
    ],
  ]);
  const siblingCounts = new Map();

  for (const node of nodes) {
    const parentSlug = node.parentSlug ?? root.slug;
    const parent = written.get(parentSlug);
    if (!parent) {
      throw new Error(
        `applyProductCategoryCatalogSeed: родитель "${parentSlug}" не найден для "${node.slug}"`,
      );
    }

    const depth = parent.depth + 1;
    if (depth > PRODUCT_CATEGORY_TREE_MAX_DEPTH) {
      throw new Error(
        `applyProductCategoryCatalogSeed: превышена глубина дерева на "${node.slug}"`,
      );
    }

    const siblingIndex = (siblingCounts.get(parentSlug) ?? 0) + 1;
    siblingCounts.set(parentSlug, siblingIndex);

    const path = {
      depth,
      pathSlugs: [...parent.pathSlugs, node.slug],
      pathIds: [...parent.pathIds, parent._id],
      pathLabelRu: [...parent.pathLabelRu, node.labelRu],
    };

    const doc = await ProductCategoryModel.findOneAndUpdate(
      { slug: node.slug },
      {
        $set: {
          labelRu: node.labelRu,
          parentId: parent._id,
          ...path,
          searchKeywords: normalizeProductCategorySearchKeywords(
            node.searchKeywords ?? [],
          ),
          isLeaf: !parentSlugs.has(node.slug),
          sortOrder: siblingIndex * SIBLING_SORT_ORDER_STEP,
        },
        $setOnInsert: { slug: node.slug },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();

    written.set(node.slug, { _id: doc._id, ...path });
  }
};

/**
 * Убирает из корня всё, чего нет в сиде. Товары удаляемых узлов остаются в
 * своём корне без подкатегории — тем же кодом, что и «удалить категорию» в
 * админке.
 *
 * @param {import('mongoose').LeanDocument<any>[]} obsolete
 */
const removeNodesMissingFromSeed = async (obsolete) => {
  let detachedProducts = 0;
  for (const doc of obsolete) {
    detachedProducts += await detachProductsFromCategoryLeaf(doc);
    await cleanupProductCategoryDisplayForDeletedCategory(doc);
  }

  const obsoleteIds = obsolete.map((doc) => doc._id);
  if (obsoleteIds.length > 0) {
    await Promise.all([
      // Продавец сопоставит группу 1С заново; с висячим id товары импорта
      // получали бы несуществующую категорию.
      OneCCategoryMappingModel.updateMany(
        { categoryId: { $in: obsoleteIds } },
        { $set: { categoryId: null } },
      ),
      CuratedCategoryListModel.updateMany(
        { "items.refId": { $in: obsoleteIds } },
        { $pull: { items: { refId: { $in: obsoleteIds } } } },
      ),
    ]);
    await ProductCategoryModel.deleteMany({ _id: { $in: obsoleteIds } });
  }

  return { deletedCategories: obsoleteIds.length, detachedProducts };
};

/**
 * Приводит подкатегории перечисленных в сиде корней к зашитому в код дереву:
 * узлы сида создаются или обновляются по слагу, остальные узлы этих корней
 * удаляются. Корни, которых в сиде нет, не трогаются вовсе.
 *
 * Сами корни не создаются и не переименовываются: на их слаг завязаны плитка
 * витрины и `productCategory` у товаров. Корня нет в базе — он попадает в
 * `skippedRoots`, и его ветка пропускается.
 *
 * Сначала запись, потом удаление: упавший посередине запуск оставляет старые
 * узлы на месте, а повторный доводит дело до конца.
 *
 * `dryRun` ничего не пишет и возвращает те же счётчики — что было бы сделано.
 *
 * @param {{ seed?: typeof PRODUCT_CATEGORY_CATALOG_SEED; dryRun?: boolean }} [options]
 */
export const applyProductCategoryCatalogSeed = async ({
  seed = PRODUCT_CATEGORY_CATALOG_SEED,
  dryRun = false,
} = {}) => {
  await assertSeedSlugsDoNotCollide(seed);

  const summary = {
    rootsApplied: 0,
    skippedRoots: /** @type {string[]} */ ([]),
    upsertedCategories: 0,
    deletedCategories: 0,
    detachedProducts: 0,
  };

  for (const { rootSlug, nodes } of seed) {
    const root = await ProductCategoryModel.findOne({
      slug: rootSlug,
      parentId: null,
    }).lean();

    if (!root) {
      summary.skippedRoots.push(rootSlug);
      continue;
    }

    const seedSlugs = nodes.map((node) => node.slug);
    const obsolete = await ProductCategoryModel.find({
      pathIds: root._id,
      slug: { $nin: seedSlugs },
    }).lean();
    const rootLosesProducts = root.isLeaf === true && nodes.length > 0;

    if (dryRun) {
      summary.rootsApplied += 1;
      summary.upsertedCategories += nodes.length;
      summary.deletedCategories += obsolete.length;
      summary.detachedProducts += await ProductModel.countDocuments({
        productCategoryId: {
          $in: [
            ...obsolete.map((doc) => doc._id),
            ...(rootLosesProducts ? [root._id] : []),
          ],
        },
      });
      continue;
    }

    if (rootLosesProducts) {
      // Товар живёт только на листе: с корня, который становится веткой,
      // товары снимаются так же, как с удаляемых подкатегорий.
      summary.detachedProducts += await detachProductsFromCategoryLeaf(root);
      await ProductCategoryModel.updateOne(
        { _id: root._id },
        { $set: { isLeaf: false } },
      );
    }

    await upsertSeedNodesUnderRoot(root, nodes);
    const removed = await removeNodesMissingFromSeed(obsolete);

    summary.rootsApplied += 1;
    summary.upsertedCategories += nodes.length;
    summary.deletedCategories += removed.deletedCategories;
    summary.detachedProducts += removed.detachedProducts;
  }

  return summary;
};
