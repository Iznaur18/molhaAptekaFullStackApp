import { PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED } from "../../constants/productCategoryDefaultCharacteristicsSeed.js";
import ProductCategoryModel from "../../models/ProductCategoryModel.js";
import { normalizeProductCategoryDefaultCharacteristicKeys } from "./normalizeProductCategoryDefaultCharacteristicKeys.js";

/**
 * Список для листа — у ближайшего к нему узла на пути: сам лист, потом
 * родитель и так до корня.
 *
 * @param {string[]} pathSlugs путь от корня до узла включительно
 * @param {Record<string, string[]>} [seed]
 * @returns {string[]}
 */
export const resolveSeedDefaultCharacteristicKeys = (
  pathSlugs,
  seed = PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED,
) => {
  for (let index = pathSlugs.length - 1; index >= 0; index -= 1) {
    const keys = seed[pathSlugs[index]];
    if (keys) return keys;
  }
  return [];
};

/**
 * Раскладывает встроенные «Характеристики по умолчанию» по конечным
 * подкатегориям.
 *
 * Трогает только листья с пустым списком: то, что админ уже ввёл руками,
 * остаётся как есть. Поэтому же повторный запуск ничего не меняет.
 *
 * `dryRun` ничего не пишет и возвращает те же счётчики — что было бы сделано.
 *
 * @param {{ seed?: Record<string, string[]>; dryRun?: boolean }} [options]
 */
export const applyProductCategoryDefaultCharacteristics = async ({
  seed = PRODUCT_CATEGORY_DEFAULT_CHARACTERISTICS_SEED,
  dryRun = false,
} = {}) => {
  const leaves = await ProductCategoryModel.find({ isLeaf: true })
    .select("slug pathSlugs defaultCharacteristicKeys")
    .lean();

  const summary = {
    leavesChecked: leaves.length,
    leavesFilled: 0,
    leavesAlreadyFilled: 0,
    leavesWithoutSeed: 0,
  };

  for (const leaf of leaves) {
    if ((leaf.defaultCharacteristicKeys ?? []).length > 0) {
      summary.leavesAlreadyFilled += 1;
      continue;
    }

    const keys = normalizeProductCategoryDefaultCharacteristicKeys(
      resolveSeedDefaultCharacteristicKeys(leaf.pathSlugs ?? [leaf.slug], seed),
    );
    if (keys.length === 0) {
      summary.leavesWithoutSeed += 1;
      continue;
    }

    summary.leavesFilled += 1;
    if (dryRun) continue;

    await ProductCategoryModel.updateOne(
      { _id: leaf._id },
      { $set: { defaultCharacteristicKeys: keys } },
      { runValidators: true },
    );
  }

  return summary;
};
