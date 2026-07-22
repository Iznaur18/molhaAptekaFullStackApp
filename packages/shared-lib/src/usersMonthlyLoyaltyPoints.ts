export const USERS_MONTHLY_LOYALTY_POINTS_GOAL = 50_000;

export const resolveLoyaltyPointsProgressPercent = (
  pointsAwarded: number,
  goal: number = USERS_MONTHLY_LOYALTY_POINTS_GOAL,
): number => {
  const safePoints = Number.isFinite(pointsAwarded) ? Math.max(0, pointsAwarded) : 0;
  const safeGoal = Number.isFinite(goal) ? Math.max(0, goal) : 0;
  if (safeGoal <= 0) {
    return 0;
  }

  return Math.min(100, Math.floor((safePoints / safeGoal) * 100));
};

export const formatLoyaltyPointsCount = (value: number): string => {
  const safe = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return safe.toLocaleString("ru-RU");
};
