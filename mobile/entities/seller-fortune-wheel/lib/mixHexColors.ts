/**
 * Смешение hex-цвета с белым — замена web `color-mix(in srgb, action 42%, #ffffff)`
 * для нечётных секторов колеса.
 */
export function mixHexWithWhite(hex: string, weight: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) {
    return hex;
  }
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const mix = (channel: number) =>
    Math.round(channel * weight + 255 * (1 - weight))
      .toString(16)
      .padStart(2, "0");
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}
