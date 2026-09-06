import { describe, expect, it } from "vitest";

import { filterCategoryRows } from "./categoryTreeAdminUtils.js";

/**
 * Боевой случай: плитку «Автомобили» переименовали на витрине в «Транспорт и
 * запчасти», после чего категорию не удавалось найти в дереве — админ искал по
 * новому названию, а дерево знало только старое.
 */
const AUTOS = {
  _id: "6a899d761ebe0410f66e0a41",
  slug: "autos",
  labelRu: "Автомобили",
  storefrontLabel: "Транспорт и запчасти",
  pathLabelRu: ["Автомобили"],
  pathSlugs: ["autos"],
  searchKeywords: [],
  depth: 0,
  isLeaf: false,
  sortOrder: 0,
  parentId: null,
};

const CLOTHES = {
  _id: "6a899eac1ebe0410f66e0a52",
  slug: "clothes",
  labelRu: "Одежда",
  storefrontLabel: "Одежда и обувь",
  pathLabelRu: ["Одежда"],
  pathSlugs: ["clothes"],
  searchKeywords: ["футболки"],
  depth: 0,
  isLeaf: false,
  sortOrder: 0,
  parentId: null,
};

const rows = [AUTOS, CLOTHES];

describe("поиск по дереву категорий", () => {
  it("находит по названию плитки с витрины", () => {
    expect(filterCategoryRows(rows, "Транспорт")).toEqual([AUTOS]);
  });

  it("по-прежнему находит по названию в дереве", () => {
    expect(filterCategoryRows(rows, "Автомобили")).toEqual([AUTOS]);
  });

  it("находит по слагу и ключевым словам", () => {
    expect(filterCategoryRows(rows, "autos")).toEqual([AUTOS]);
    expect(filterCategoryRows(rows, "футболки")).toEqual([CLOTHES]);
  });

  it("не спотыкается о категории без переименования", () => {
    const plain = { ...AUTOS, storefrontLabel: null };

    expect(filterCategoryRows([plain], "Автомобили")).toEqual([plain]);
    expect(filterCategoryRows([plain], "Транспорт")).toEqual([]);
  });

  it("пустой запрос отдаёт всё", () => {
    expect(filterCategoryRows(rows, "   ")).toEqual(rows);
  });
});
