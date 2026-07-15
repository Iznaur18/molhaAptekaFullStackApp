/** Цвета «переливания» — как Fumadocs Banner rainbow / demo. */
export const RAFFLE_REVEAL_RAINBOW_COLORS = [
  "rgba(0,149,255,0.56)",
  "rgba(45, 112, 237, 0.77)",
  "rgba(0, 145, 255, 0.73)",
  "rgba(41, 201, 255, 0.66)",
] as const;

export const RAFFLE_REVEAL_RAINBOW_DURATION_MS = 20_000;

export const buildRepeatingRainbowGradientCss = (
  colors: readonly string[] = RAFFLE_REVEAL_RAINBOW_COLORS,
): string => {
  const stops = [...colors, colors[0]].map(
    (color, index) => `${color} ${(index * 50) / colors.length}%`,
  );
  return `repeating-linear-gradient(70deg, ${stops.join(", ")})`;
};
