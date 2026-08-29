import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { izColors, izColorsCustom, izColorsDark } from "@izibuy/design-tokens";
import { describe, expect, it } from "vitest";

import { COLOR_VAR_MAP } from "./runtimeDesignTokens.js";

/**
 * Значения в designTokens.css нужны только для ПЕРВОЙ отрисовки: до того, как
 * отработает JS и разложит по переменным реальную тему из пакета. Синхронность
 * держится вручную (см. комментарий в packages/design-tokens/src/colors.ts),
 * и расхождение почти не поймать глазами — страница просто мигнёт чужим цветом.
 * Здесь она проверяется автоматически.
 */

// В vitest+jsdom `import.meta.url` не файловый — путь считаем от корня клиента.
const cssText = readFileSync(
  resolve(process.cwd(), "src/shared/styles/designTokens.css"),
  "utf8",
);

/** Значения из блока `:root` — там объявлена светлая (каноническая) палитра. */
const readRootCssVars = () => {
  const start = cssText.indexOf(":root {");
  const end = cssText.indexOf("\n}", start);
  expect(start, "в designTokens.css нет блока :root").toBeGreaterThan(-1);
  expect(end, "блок :root не закрыт").toBeGreaterThan(start);

  const vars = {};
  for (const match of cssText.slice(start, end).matchAll(/(--iz-color-[a-z-]+):\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }
  return vars;
};

const rootVars = readRootCssVars();

describe("design tokens: пакет и designTokens.css", () => {
  it("состав цветов без CSS-переменной не растёт", () => {
    // Эти живут только в объекте темы: мобилка читает его напрямую и
    // пользуется ими (nearBlack и actionSurface — в 16 и 14 файлах), а веб
    // через переменные достать их не может и потому местами зашивает числом.
    // Список зафиксирован намеренно: новый токен без пары в COLOR_VAR_MAP
    // уронит тест — либо добавьте переменную, либо продлите список осознанно.
    const MOBILE_ONLY = [
      "actionSurface",
      "infoNavy",
      "nearBlack",
      "premium",
      "primaryBright",
      "raffleBorder",
      "raffleSurface",
      "star",
      "starMuted",
      "warningBorder",
    ];
    const unmapped = Object.keys(izColors)
      .filter((token) => !COLOR_VAR_MAP[token])
      .sort();
    expect(unmapped).toEqual(MOBILE_ONLY);
  });

  it("каждая переменная из карты объявлена в :root", () => {
    const missing = Object.entries(COLOR_VAR_MAP)
      .filter(([, cssVar]) => rootVars[cssVar] === undefined)
      .map(([token, cssVar]) => `${token} -> ${cssVar}`);
    expect(
      missing,
      `нет в designTokens.css — до старта JS цвет будет пустым: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("значения в :root совпадают со светлой темой пакета", () => {
    const mismatched = [];
    for (const [token, value] of Object.entries(izColors)) {
      const cssVar = COLOR_VAR_MAP[token];
      if (!cssVar) continue;
      const cssValue = rootVars[cssVar];
      if (cssValue === undefined) continue;
      if (cssValue.toLowerCase() !== String(value).toLowerCase()) {
        mismatched.push(`${token}: пакет ${value}, css ${cssValue}`);
      }
    }
    expect(
      mismatched,
      `designTokens.css разошёлся с пакетом:\n  ${mismatched.join("\n  ")}`,
    ).toEqual([]);
  });

  it("все три темы отдают один и тот же набор токенов", () => {
    // Мобилка читает тот же объект напрямую: недостающий ключ в теме = undefined
    // в стиле компонента, без единой ошибки в консоли.
    const base = Object.keys(izColors).sort();
    expect(Object.keys(izColorsDark).sort(), "тёмная тема").toEqual(base);
    expect(Object.keys(izColorsCustom).sort(), "своя тема").toEqual(base);
  });

  it("ни один токен не остался пустым", () => {
    for (const [name, palette] of [
      ["светлая", izColors],
      ["тёмная", izColorsDark],
      ["своя", izColorsCustom],
    ]) {
      for (const [token, value] of Object.entries(palette)) {
        expect(String(value ?? "").trim(), `${name}: ${token}`).not.toBe("");
      }
    }
  });
});
