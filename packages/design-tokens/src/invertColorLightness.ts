const HEX_CHANNEL = /[0-9a-f]/;

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const channelToHex = (channel: number): string =>
  Math.round(clamp01(channel) * 255)
    .toString(16)
    .padStart(2, "0");

export const parseHexColor = (hex: string): Rgb => {
  const normalized = hex.trim().replace(/^#/, "").toLowerCase();
  if (normalized.length === 3 && [...normalized].every((ch) => HEX_CHANNEL.test(ch))) {
    return {
      r: Number.parseInt(normalized[0] + normalized[0], 16) / 255,
      g: Number.parseInt(normalized[1] + normalized[1], 16) / 255,
      b: Number.parseInt(normalized[2] + normalized[2], 16) / 255,
    };
  }
  if (normalized.length === 6 && [...normalized].every((ch) => HEX_CHANNEL.test(ch))) {
    return {
      r: Number.parseInt(normalized.slice(0, 2), 16) / 255,
      g: Number.parseInt(normalized.slice(2, 4), 16) / 255,
      b: Number.parseInt(normalized.slice(4, 6), 16) / 255,
    };
  }
  throw new Error(`Unsupported hex color: ${hex}`);
};

export const formatHexColor = ({ r, g, b }: Rgb): string =>
  `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;

export const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l };
  }

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }
  h *= 60;
  if (h < 0) {
    h += 360;
  }
  return { h, s, l };
};

export const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = h / 60;
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r = chroma;
    g = x;
  } else if (hPrime < 2) {
    r = x;
    g = chroma;
  } else if (hPrime < 3) {
    g = chroma;
    b = x;
  } else if (hPrime < 4) {
    g = x;
    b = chroma;
  } else if (hPrime < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const match = l - chroma / 2;
  return { r: r + match, g: g + match, b: b + match };
};

/** Classic dark-mode transform: keep H/S, mirror lightness. */
export const mirrorLightness = (hex: string): string => {
  const hsl = rgbToHsl(parseHexColor(hex));
  return formatHexColor(hslToRgb({ ...hsl, l: 1 - hsl.l }));
};

export const setLightness = (hex: string, lightness: number): string => {
  const hsl = rgbToHsl(parseHexColor(hex));
  return formatHexColor(hslToRgb({ ...hsl, l: clamp01(lightness) }));
};

export const shiftLightness = (hex: string, delta: number): string => {
  const hsl = rgbToHsl(parseHexColor(hex));
  return formatHexColor(hslToRgb({ ...hsl, l: clamp01(hsl.l + delta) }));
};

export const toRgbCss = (hex: string, alpha: number): string => {
  const { r, g, b } = parseHexColor(hex);
  const toByte = (channel: number) => Math.round(clamp01(channel) * 255);
  const alphaPct = Math.round(clamp01(alpha) * 100);
  return `rgb(${toByte(r)} ${toByte(g)} ${toByte(b)} / ${alphaPct}%)`;
};
