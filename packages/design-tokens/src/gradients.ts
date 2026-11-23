/**
 * Именованные градиенты — стопы из canonical color keys.
 * Потребитель резолвит `colorKey` → `theme.colors[colorKey]`.
 * Углы: web CSS; RN `GradientFill` ≈ 135deg диагональ где указано.
 */
export const izGradients = {
  surfaceFade: {
    angleDeg: 180,
    stops: [
      { colorKey: "surfaceElevated", offset: 0 },
      { colorKey: "surface", offset: 0.7 },
    ],
  },
  infoPanel: {
    angleDeg: 180,
    stops: [
      { colorKey: "infoSoft", offset: 0 },
      { colorKey: "surface", offset: 0.55 },
    ],
  },
  premiumPanel: {
    angleDeg: 180,
    stops: [
      { colorKey: "warningSurface", offset: 0 },
      { colorKey: "surface", offset: 0.55 },
    ],
  },
  rafflePink: {
    angleDeg: 135,
    stops: [
      { colorKey: "accentSoft", offset: 0 },
      { colorKey: "accentSoft", offset: 0.55 },
      { colorKey: "surface", offset: 1 },
    ],
  },
  raffleSuccess: {
    angleDeg: 135,
    stops: [
      { colorKey: "successSurface", offset: 0 },
      { colorKey: "successSurface", offset: 0.55 },
      { colorKey: "surface", offset: 1 },
    ],
  },
  feedIndigo: {
    angleDeg: 145,
    stops: [
      { colorKey: "accentSoft", offset: 0 },
      { colorKey: "surfaceElevated", offset: 1 },
    ],
  },
  feedGold: {
    angleDeg: 145,
    stops: [
      { colorKey: "warningSurface", offset: 0 },
      { colorKey: "warningSurface", offset: 1 },
    ],
  },
  appIntro: {
    angleDeg: 135,
    stops: [
      { colorKey: "infoDeep", offset: 0 },
      { colorKey: "accent", offset: 0.55 },
      { colorKey: "accent", offset: 1 },
    ],
  },
} as const;

export type IzGradientName = keyof typeof izGradients;
