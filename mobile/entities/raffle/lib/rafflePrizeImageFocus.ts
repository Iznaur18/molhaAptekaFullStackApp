import type { RaffleFromApi } from "@/entities/raffle/model/types";

/** Синхрон с client/server profileImageFocus (0–100). */
export const PROFILE_IMAGE_FOCUS_MIN = 0;
export const PROFILE_IMAGE_FOCUS_MAX = 100;
export const DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS = { x: 50, y: 50 };

type ImageFocus = { x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normalizeProfileImageFocus = (
  raw: unknown,
  fallback: ImageFocus,
): ImageFocus => {
  const source =
    raw != null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as { x?: unknown; y?: unknown })
      : {};
  const x = Number(source.x ?? fallback.x);
  const y = Number(source.y ?? fallback.y);

  return {
    x: Math.round(
      clamp(
        Number.isFinite(x) ? x : fallback.x,
        PROFILE_IMAGE_FOCUS_MIN,
        PROFILE_IMAGE_FOCUS_MAX,
      ),
    ),
    y: Math.round(
      clamp(
        Number.isFinite(y) ? y : fallback.y,
        PROFILE_IMAGE_FOCUS_MIN,
        PROFILE_IMAGE_FOCUS_MAX,
      ),
    ),
  };
};

export const getRafflePrizeImageFocus = (raffle: RaffleFromApi | null | undefined): ImageFocus =>
  normalizeProfileImageFocus(raffle?.prizeImageFocus, DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS);

/** expo-image contentPosition ↔ CSS object-position */
export const formatRafflePrizeContentPosition = (raffle: RaffleFromApi | null | undefined) => {
  const { x, y } = getRafflePrizeImageFocus(raffle);
  return {
    left: `${x}%`,
    top: `${y}%`,
  };
};
