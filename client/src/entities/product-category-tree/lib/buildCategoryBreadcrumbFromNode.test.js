import { describe, expect, it } from "vitest";

import { buildCategoryBreadcrumbFromNode } from "./buildCategoryBreadcrumbFromNode.js";

describe("подпись выбранной категории", () => {
  it("не повторяет название, если путь уже им заканчивается", () => {
    expect(
      buildCategoryBreadcrumbFromNode({
        pathLabelRu: ["Автомобили", "Шины и диски", "Шины"],
        labelRu: "Шины",
      }),
    ).toBe("Автомобили › Шины и диски › Шины");
  });

  it("дописывает название, если в пути его нет", () => {
    expect(
      buildCategoryBreadcrumbFromNode({
        pathLabelRu: ["Автомобили", "Шины и диски"],
        labelRu: "Шины",
      }),
    ).toBe("Автомобили › Шины и диски › Шины");
  });

  it("работает без пути", () => {
    expect(buildCategoryBreadcrumbFromNode({ labelRu: "Электроника" })).toBe(
      "Электроника",
    );
  });
});
