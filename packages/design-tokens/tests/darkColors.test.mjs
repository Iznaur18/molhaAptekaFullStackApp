import assert from "node:assert/strict";
import { test } from "node:test";

import { izColors, izColorsDark } from "../src/colors.ts";
import { parseHexColor, rgbToHsl } from "../src/invertColorLightness.ts";
import { resolveIzTheme } from "../src/index.ts";

const lightnessOf = (hex) => rgbToHsl(parseHexColor(hex)).l;

test("dark palette is hand-crafted, not a mirror of light", () => {
  // Холст near-black и явно темнее светлого фона.
  assert.equal(izColorsDark.bg, "#0c0e12");
  assert.ok(lightnessOf(izColorsDark.bg) < 0.1);
  assert.ok(lightnessOf(izColorsDark.bg) < lightnessOf(izColors.bg));
  // Текст светлый на тёмном фоне.
  assert.ok(lightnessOf(izColorsDark.text) > 0.85);
});

test("dark surfaces step up above the canvas (bg < muted < elevated < surface)", () => {
  const bg = lightnessOf(izColorsDark.bg);
  const muted = lightnessOf(izColorsDark.surfaceMuted);
  const elevated = lightnessOf(izColorsDark.surfaceElevated);
  const surface = lightnessOf(izColorsDark.surface);
  assert.ok(bg < muted, "bg < surfaceMuted");
  assert.ok(muted < elevated, "surfaceMuted < surfaceElevated");
  assert.ok(elevated < surface, "surfaceElevated < surface");
});

test("interactive is monochrome silver (no blue), readable as text on dark", () => {
  assert.equal(izColorsDark.action, "#d7dbe2");
  assert.equal(izColorsDark.link, "#d7dbe2");
  // action используется и как текст (цена/ссылки) — должен быть светлым.
  assert.ok(lightnessOf(izColorsDark.action) > 0.7);
  assert.ok(lightnessOf(izColorsDark.primary) > 0.7);
  // onContrast тёмный: текст на серебряной кнопке читаем.
  assert.ok(lightnessOf(izColorsDark.onContrast) < 0.1);
  // Никакого синего перекоса: канал B не доминирует над R в акценте.
  const [r, , b] = izColorsDark.action
    .match(/[0-9a-f]{2}/g)
    .map((h) => parseInt(h, 16));
  assert.ok(Math.abs(r - b) < 24, "action близок к нейтральному, не синий");
});

test("status text/solids are lighter than in light for dark legibility", () => {
  for (const key of ["success", "danger", "successText", "dangerText", "warningText"]) {
    assert.ok(lightnessOf(izColorsDark[key]) > lightnessOf(izColors[key]), key);
  }
});

test("premium keeps the warm gold crest accent", () => {
  assert.equal(izColorsDark.premium, "#e0c35a");
});

test("resolveIzTheme('dark') returns the hand-crafted dark palette", () => {
  assert.equal(resolveIzTheme("dark").colors.bg, "#0c0e12");
  assert.notEqual(resolveIzTheme("dark").colors.bg, resolveIzTheme("light").colors.bg);
  assert.notEqual(resolveIzTheme("dark").colors.bg, resolveIzTheme("custom").colors.bg);
});
