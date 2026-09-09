import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Файл лежит в src/shared/ui/Skeleton — до корня client четыре уровня.
const clientRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const read = (relative) => readFileSync(path.join(clientRoot, relative), "utf8");

/**
 * Три страницы, где первая загрузка раньше схлопывалась в абзац «Загрузка…»:
 * экран сжимался в одну строку, а потом разворачивался в полную вёрстку.
 * Ломается это молча — тестов на «как выглядит ожидание» нет, а вернуть
 * текстовую заглушку можно одной строкой.
 */
const PAGES = [
  {
    имя: "витрина продавца",
    страница: "src/pages/seller-products/ui/SellerProductsPage.jsx",
    скелетон: "SellerProductsPageSkeleton",
  },
  {
    имя: "профиль продавца",
    страница: "src/pages/user-details/ui/UserDetailsPage.jsx",
    скелетон: "UserDetailsPageSkeleton",
  },
  {
    имя: "корзина",
    страница: "src/pages/cart/ui/CartPage.jsx",
    скелетон: "CartPageSkeleton",
  },
];

describe("скелетоны первой загрузки", () => {
  for (const { имя, страница, скелетон } of PAGES) {
    it(`${имя}: ожидание рисует скелетон, а не текст`, () => {
      const source = read(страница);

      expect(source).toContain(`import { ${скелетон} }`);
      expect(source).toContain(`<${скелетон} />`);

      // Заглушка «Загрузка…» в ветке ожидания — то, от чего уходили.
      expect(
        source,
        "ветка загрузки снова отдаёт абзац вместо скелетона",
      ).not.toMatch(/return\s*\(?\s*<p className="[a-z-]+__state">\{[A-Z_]+\.LOADING\}/u);
    });
  }

  it("общий шиммер уважает prefers-reduced-motion", () => {
    const css = read("src/shared/ui/Skeleton/skeleton.css");

    // Бесконечная анимация — ровно то, что просят отключать. Ни один из
    // прежних скелетонов проекта этого не делает, здесь не терять.
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toMatch(/animation:\s*none/u);
  });

  it("скелетоны не плодят вложенные живые области", () => {
    // У CatalogGridSkeleton свой role="status": витрина переиспользует его и
    // обязана спрятать от скринридера, иначе загрузка объявляется дважды.
    const source = read("src/pages/seller-products/ui/SellerProductsPageSkeleton.jsx");
    const grid = source.indexOf("<CatalogGridSkeleton");
    const hidden = source.lastIndexOf('aria-hidden="true"', grid);

    expect(grid).toBeGreaterThan(-1);
    expect(hidden).toBeGreaterThan(-1);
  });
});
