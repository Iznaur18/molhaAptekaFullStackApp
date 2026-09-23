import { OneCCategoryMappingModel, ProductModel } from "../../models/index.js";
import { buildSellerCatalogProductsQuery } from "../user/userSellerCatalogProducts.js";

/**
 * Полки витрины из групп номенклатуры 1С.
 *
 * Дерево групп уже приносит обмен (`OneCCategoryMapping`), товар помнит свою
 * группу (`product1cGroupId`). Здесь мы только считаем, сколько товаров
 * реально видно покупателю, и прячем пустые ветки: у продавца с 1С треть
 * корневых групп стоит пустыми, и витрина из них выглядела бы сломанной.
 *
 * @typedef {{
 *   id: string;
 *   name: string;
 *   productCount: number;
 *   children: Array<{ id: string; name: string; productCount: number }>;
 * }} OneCShelf
 */

/** Сколько подкатегорий отдаём на ветку: длиннее список никто не листает. */
const CHILDREN_MAX = 60;
/** Столько корневых полок хватает даже большому каталогу. */
const ROOTS_MAX = 60;

/**
 * Видимые товары продавца по группам 1С.
 *
 * @param {string} sellerId
 * @returns {Promise<Map<string, number>>}
 */
async function countVisibleProductsByGroup(sellerId) {
  const rows = await ProductModel.aggregate([
    {
      $match: {
        ...buildSellerCatalogProductsQuery(sellerId),
        product1cGroupId: { $type: "string", $ne: "" },
      },
    },
    { $group: { _id: "$product1cGroupId", n: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [String(row._id), Number(row.n) || 0]));
}

/**
 * Полки продавца из 1С: корневые группы и их подкатегории.
 *
 * Считаем «своими» товары самой группы, а в счётчике ветки — вместе с
 * подкатегориями: покупатель, нажав «Канцтовары», ждёт весь раздел.
 *
 * @param {string} sellerId
 * @returns {Promise<OneCShelf[]>}
 */
export async function listSellerOneCShelves(sellerId) {
  const groups = await OneCCategoryMappingModel.find({ sellerId })
    .select("externalId name parentExternalId depth")
    .lean();
  if (groups.length === 0) return [];

  const ownCounts = await countVisibleProductsByGroup(sellerId);

  /** @type {Map<string, { id: string; name: string; parentId: string | null; own: number; children: any[] }>} */
  const byId = new Map();
  for (const group of groups) {
    const id = String(group.externalId ?? "").trim();
    if (!id) continue;
    byId.set(id, {
      id,
      name: String(group.name ?? "").trim() || id,
      parentId: String(group.parentExternalId ?? "").trim() || null,
      own: ownCounts.get(id) ?? 0,
      children: [],
    });
  }

  const roots = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  /**
   * Счётчик ветки: свои товары плюс все вложенные.
   *
   * @param {{ own: number; children: any[] }} node
   * @returns {number}
   */
  const branchCount = (node) =>
    node.own + node.children.reduce((sum, child) => sum + branchCount(child), 0);

  return roots
    .map((root) => ({
      id: root.id,
      name: root.name,
      productCount: branchCount(root),
      children: root.children
        .map((child) => ({
          id: child.id,
          name: child.name,
          productCount: branchCount(child),
        }))
        .filter((child) => child.productCount > 0)
        .sort((a, b) => a.name.localeCompare(b.name, "ru"))
        .slice(0, CHILDREN_MAX),
    }))
    .filter((root) => root.productCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"))
    .slice(0, ROOTS_MAX);
}

/**
 * Группа и все вложенные — по ним фильтруются товары ветки.
 *
 * @param {string} sellerId
 * @param {string} groupId
 * @returns {Promise<string[]>}
 */
export async function resolveOneCGroupBranchIds(sellerId, groupId) {
  const root = String(groupId ?? "").trim();
  if (!root) return [];

  const groups = await OneCCategoryMappingModel.find({ sellerId })
    .select("externalId parentExternalId")
    .lean();

  /** @type {Map<string, string[]>} */
  const childrenByParent = new Map();
  for (const group of groups) {
    const parentId = String(group.parentExternalId ?? "").trim();
    if (!parentId) continue;
    const list = childrenByParent.get(parentId) ?? [];
    list.push(String(group.externalId ?? "").trim());
    childrenByParent.set(parentId, list);
  }

  const branch = [];
  const queue = [root];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || branch.includes(current)) continue;
    branch.push(current);
    queue.push(...(childrenByParent.get(current) ?? []));
  }
  return branch;
}
