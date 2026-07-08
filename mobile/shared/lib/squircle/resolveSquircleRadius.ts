import { SQUIRCLE_RADIUS_SCALE } from "@/shared/lib/squircle/squircleConstants";

export const resolveSquircleRadius = (baseRadius: number): number =>
  Math.round(baseRadius * SQUIRCLE_RADIUS_SCALE * 10) / 10;
