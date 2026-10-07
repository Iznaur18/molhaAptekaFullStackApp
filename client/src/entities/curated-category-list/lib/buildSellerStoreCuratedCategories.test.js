import { describe, expect, it } from "vitest";

import { buildSellerStoreCuratedCategories } from "./buildSellerStoreCuratedCategories.js";

describe("buildSellerStoreCuratedCategories", () => {
  it("превращает плитку продавца в personal-элемент витрины", () => {
    expect(
      buildSellerStoreCuratedCategories([
        { _id: "c1", sellerId: "s1", labelRu: "Мой магазин", imageUrl: "/u/a.webp" },
      ]),
    ).toEqual([
      {
        itemKey: "personal:c1",
        kind: "personal",
        refId: "c1",
        label: "Мой магазин",
        imageUrl: "/u/a.webp",
        sellerId: "s1",
      },
    ]);
  });

  it("плитка без картинки получает imageUrl null", () => {
    const [item] = buildSellerStoreCuratedCategories([
      { _id: "c2", sellerId: "s2", labelRu: "Без фото" },
    ]);
    expect(item.imageUrl).toBeNull();
  });

  it("пустой список остаётся пустым", () => {
    expect(buildSellerStoreCuratedCategories([])).toEqual([]);
  });
});
