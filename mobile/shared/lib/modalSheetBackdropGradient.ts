/** Паритет `.wholesale-price-modal__scrim` / checkout sheet scrim. */
export const MODAL_SHEET_BACKDROP_STOPS = [
  { offset: 0, opacity: 0.28 },
  { offset: 0.38, opacity: 0.48 },
  { offset: 0.68, opacity: 0.68 },
  { offset: 1, opacity: 0.82 },
] as const;

const parseHexColor = (hex: string): { b: number; g: number; r: number } => {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    return {
      r: Number.parseInt(normalized[0] + normalized[0], 16),
      g: Number.parseInt(normalized[1] + normalized[1], 16),
      b: Number.parseInt(normalized[2] + normalized[2], 16),
    };
  }
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
};

export const inkColorWithOpacity = (ink: string, opacity: number): string => {
  const { r, g, b } = parseHexColor(ink);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const buildModalSheetBackdropGradientCss = (ink: string): string => {
  const stops = MODAL_SHEET_BACKDROP_STOPS.map(
    ({ offset, opacity }) =>
      `${inkColorWithOpacity(ink, opacity)} ${Math.round(offset * 100)}%`,
  );
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
};
