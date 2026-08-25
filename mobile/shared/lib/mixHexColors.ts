/**
 * Аналог CSS `color-mix(in srgb, a <ratio>, b)` для RN, где такой функции нет.
 *
 * Нужен там, где веб-стили заданы через color-mix и подменять их альфой нельзя:
 * альфа composite'ится с тем, что реально лежит под элементом, а color-mix даёт
 * непрозрачный цвет независимо от подложки.
 *
 * @param a — первый цвет, #rgb или #rrggbb
 * @param b — второй цвет
 * @param ratioOfA — доля первого цвета, 0..1
 */
export const mixHexColors = (a: string, b: string, ratioOfA: number): string => {
  const left = parseHexColor(a);
  const right = parseHexColor(b);
  if (left == null || right == null) {
    return a;
  }
  const weight = Math.max(0, Math.min(1, Number(ratioOfA) || 0));
  const channel = (from: number, to: number) =>
    Math.round(from * weight + to * (1 - weight));

  return rgbToHex(
    channel(left[0], right[0]),
    channel(left[1], right[1]),
    channel(left[2], right[2]),
  );
};

const parseHexColor = (value: string): [number, number, number] | null => {
  const raw = String(value ?? "").trim().replace(/^#/, "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((char) => char + char)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return null;
  }
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
};

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
