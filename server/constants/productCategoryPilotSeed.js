/**
 * Пилотное дерево v1: Электроника → Телефоны → Мобильные → листья.
 * Бренды (Apple и т.д.) — не узлы дерева, а характеристики товара.
 *
 * @typedef {{
 *   slug: string;
 *   labelRu: string;
 *   parentSlug: string | null;
 *   isLeaf: boolean;
 *   legacyProductCategory?: string;
 *   searchKeywords?: string[];
 *   sortOrder?: number;
 * }} ProductCategorySeedNode
 */

/** @type {ProductCategorySeedNode[]} */
export const PRODUCT_CATEGORY_PILOT_SEED = [
  {
    slug: "electronics",
    labelRu: "Электроника",
    parentSlug: null,
    isLeaf: false,
    legacyProductCategory: "electronics",
    searchKeywords: ["электроника", "техника", "гаджеты"],
    sortOrder: 10,
  },
  {
    slug: "electronics-phones",
    labelRu: "Телефоны",
    parentSlug: "electronics",
    isLeaf: false,
    searchKeywords: ["телефон", "телефоны", "мобильный", "смартфон"],
    sortOrder: 10,
  },
  {
    slug: "electronics-phones-mobile",
    labelRu: "Мобильные телефоны",
    parentSlug: "electronics-phones",
    isLeaf: false,
    searchKeywords: ["мобильные", "смартфоны", "iphone", "айфон"],
    sortOrder: 10,
  },
  {
    slug: "electronics-phones-mobile-smartphones",
    labelRu: "Смартфоны",
    parentSlug: "electronics-phones-mobile",
    isLeaf: true,
    searchKeywords: ["android", "смартфон"],
    sortOrder: 10,
  },
  {
    slug: "electronics-phones-mobile-feature",
    labelRu: "Кнопочные телефоны",
    parentSlug: "electronics-phones-mobile",
    isLeaf: true,
    searchKeywords: ["кнопочный", "раскладушка"],
    sortOrder: 20,
  },
];
