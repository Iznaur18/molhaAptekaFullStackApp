/**
 * Паритет web `client/src/entities/fortune-wheel/lib/resolveSectorAngles.js`:
 * углы секций пропорциональны шансам; без шансов — круг поровну.
 */
export type SectorAngles = { startDeg: number; endDeg: number; midDeg: number };

export function resolveSectorAngles(
  sectors: { chancePercent?: number }[],
): SectorAngles[] {
  const list = Array.isArray(sectors) ? sectors : [];
  if (list.length === 0) {
    return [];
  }
  const chances = list.map((sector) => {
    const chance = Number(sector?.chancePercent);
    return Number.isFinite(chance) && chance > 0 ? chance : 0;
  });
  const total = chances.reduce((sum, chance) => sum + chance, 0);
  const weights =
    total > 0
      ? chances.map((chance) => chance / total)
      : list.map(() => 1 / list.length);

  let cursor = 0;
  return weights.map((weight) => {
    const startDeg = cursor;
    const endDeg = cursor + weight * 360;
    cursor = endDeg;
    return { startDeg, endDeg, midDeg: (startDeg + endDeg) / 2 };
  });
}
