import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const clientRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const read = (relative) => readFileSync(path.join(clientRoot, relative), "utf8");

/**
 * Две библиотеки не должны приезжать в первую загрузку.
 *
 * Leaflet и @sentry раньше ехали к каждому гостю: 57 КБ карты на страницах, где
 * карты нет, и 48 КБ Sentry, который без DSN даже не инициализируется. Первая
 * загрузка похудела с 550 до 364 КБ ровно на этом.
 *
 * Ломается это молча — бандл собирается, сайт работает, просто снова тяжелеет.
 * Поэтому проверяем оба условия, от которых зависит результат.
 */
describe("тяжёлые зависимости остаются ленивыми", () => {
  it("карта подключается через lazy, а не статическим импортом", () => {
    const source = read("src/entities/address/ui/AddressDeliveryFields.jsx");

    expect(source).toMatch(/lazy\(\s*\(\)\s*=>\s*\n?\s*import\(/u);
    expect(source).toContain("maps/ui/MapPointPicker.jsx");
    expect(source, "статический импорт вернёт leaflet в стартовый граф").not.toMatch(
      /^import\s*\{[^}]*MapPointPicker[^}]*\}\s*from/mu,
    );
  });

  it("карта отрисована внутри Suspense", () => {
    const source = read("src/entities/address/ui/AddressDeliveryFields.jsx");

    // Без границы ленивый компонент уронит дерево при открытии карты.
    expect(source).toContain("<Suspense");
  });

  it("vite не собирает их в именованный vendor-чанк", () => {
    const config = read("vite.config.js");

    // Именованный ручной чанк Rollup делает статической зависимостью entry —
    // даже когда в исходниках пакет тянут только через import().
    expect(config).not.toContain('return "vendor-sentry"');
    expect(config).not.toContain('return "vendor-leaflet"');
  });

  it("исключение стоит выше общего vendor-misc", () => {
    const config = read("vite.config.js");
    const exclusion = config.indexOf('id.includes("@sentry")');
    const catchAll = config.indexOf('return "vendor-misc"');

    expect(exclusion).toBeGreaterThan(-1);
    expect(catchAll).toBeGreaterThan(-1);
    // Ниже catch-all обе библиотеки снова уедут в стартовую загрузку, просто
    // под другим именем — так и случилось с первой попыткой правки.
    expect(exclusion).toBeLessThan(catchAll);
  });

  it("Sentry грузится только динамически", () => {
    const files = [
      "src/shared/api/apiClient.js",
      "src/shared/ui/AppErrorBoundary/AppErrorBoundary.jsx",
      "src/shared/lib/initClientSentry.js",
    ];

    for (const file of files) {
      const source = read(file);
      expect(source, `${file} тянет sentryClient статически`).not.toMatch(
        /^import\s[^\n]*sentryClient/mu,
      );
    }
  });
});
