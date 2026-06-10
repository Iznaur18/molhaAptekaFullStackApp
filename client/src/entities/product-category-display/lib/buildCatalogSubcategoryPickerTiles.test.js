import { describe, expect, it } from "vitest";

import { buildCatalogSubcategoryPickerTiles } from "./buildCatalogSubcategoryPickerTiles.js";
import { PRODUCT_CATEGORY_DISPLAY_UI } from "../../../shared/config/appUiCopy.js";

describe("buildCatalogSubcategoryPickerTiles", () => {
  it("prepends view-all tile and marks it non-editable", () => {
    const tiles = buildCatalogSubcategoryPickerTiles({
      parent: { id: "root1", labelRu: "Электроника" },
      categories: [
        {
          id: "child1",
          slug: "phones",
          labelRu: "Телефоны",
          parentId: "root1",
          depth: 1,
          pathSlugs: ["electronics", "phones"],
          pathLabelRu: ["Электроника", "Телефоны"],
          isLeaf: true,
          searchKeywords: [],
        },
      ],
      displays: [],
    });

    expect(tiles).toHaveLength(2);
    expect(tiles[0]).toMatchObject({
      kind: "view-all",
      categoryId: "root1",
      label: PRODUCT_CATEGORY_DISPLAY_UI.SUBCATEGORY_VIEW_ALL,
      isEditable: false,
    });
    expect(tiles[1]).toMatchObject({
      categoryId: "child1",
      label: "Телефоны",
      isEditable: true,
    });
  });

  it("applies admin display overrides by categoryId", () => {
    const tiles = buildCatalogSubcategoryPickerTiles({
      parent: { id: "root1", labelRu: "Электроника" },
      categories: [
        {
          id: "child1",
          slug: "phones",
          labelRu: "Телефоны",
          parentId: "root1",
          depth: 1,
          pathSlugs: ["electronics", "phones"],
          pathLabelRu: ["Электроника", "Телефоны"],
          isLeaf: true,
          searchKeywords: [],
        },
      ],
      displays: [
        {
          categoryId: "child1",
          categorySlug: null,
          customLabel: "Смартфоны",
          imageUrl: "/uploads/phones.jpg",
        },
      ],
    });

    expect(tiles[1]).toMatchObject({
      label: "Смартфоны",
      imageUrl: "/uploads/phones.jpg",
      isCustomLabel: true,
      isCustomImage: true,
    });
  });
});
