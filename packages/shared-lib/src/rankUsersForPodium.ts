export type UsersPodiumCandidate = {
  _id: string;
  isBlockedUser?: boolean;
  totalSalesCount?: number;
  followersCount?: number;
  userLoyaltyPoints?: number;
  userRatingByVotes?: {
    countVotes?: number;
    totalRating?: number;
  };
};

export type UsersPodiumPlace = 1 | 2 | 3;

export type UsersPodiumEntry<T extends UsersPodiumCandidate = UsersPodiumCandidate> = {
  place: UsersPodiumPlace;
  user: T;
};

const DEFAULT_PODIUM_SIZE = 3;
const PODIUM_DISPLAY_ORDER: readonly UsersPodiumPlace[] = [2, 1, 3];

const toNonNegativeInt = (value: unknown): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsed));
};

export const getUserPodiumAverageRating = (
  raw: UsersPodiumCandidate["userRatingByVotes"],
): number => {
  if (raw == null || typeof raw !== "object") {
    return 0;
  }

  const countVotes = toNonNegativeInt(raw.countVotes);
  if (countVotes === 0) {
    return 0;
  }

  const totalRating = Number(raw.totalRating);
  if (!Number.isFinite(totalRating)) {
    return 0;
  }

  return totalRating / countVotes;
};

const compareUsersForPodium = (
  left: UsersPodiumCandidate,
  right: UsersPodiumCandidate,
): number => {
  const pointsDiff =
    toNonNegativeInt(right.userLoyaltyPoints) - toNonNegativeInt(left.userLoyaltyPoints);
  if (pointsDiff !== 0) {
    return pointsDiff;
  }

  const salesDiff =
    toNonNegativeInt(right.totalSalesCount) - toNonNegativeInt(left.totalSalesCount);
  if (salesDiff !== 0) {
    return salesDiff;
  }

  const ratingDiff =
    getUserPodiumAverageRating(right.userRatingByVotes) -
    getUserPodiumAverageRating(left.userRatingByVotes);
  if (ratingDiff !== 0) {
    return ratingDiff > 0 ? 1 : -1;
  }

  const followersDiff =
    toNonNegativeInt(right.followersCount) - toNonNegativeInt(left.followersCount);
  if (followersDiff !== 0) {
    return followersDiff;
  }

  return String(left._id).localeCompare(String(right._id));
};

export const sortUsersByPodiumCriteria = <T extends UsersPodiumCandidate>(
  users: readonly T[],
): T[] => {
  const eligible = users.filter((user) => user.isBlockedUser !== true);
  return [...eligible].sort(compareUsersForPodium);
};

export const rankUsersForPodium = <T extends UsersPodiumCandidate>(
  users: readonly T[],
  limit = DEFAULT_PODIUM_SIZE,
): UsersPodiumEntry<T>[] => {
  const safeLimit = Math.max(0, Math.min(DEFAULT_PODIUM_SIZE, Math.floor(limit)));
  if (safeLimit === 0 || users.length === 0) {
    return [];
  }

  const sorted = sortUsersByPodiumCriteria(users);

  return sorted.slice(0, safeLimit).map((user, index) => ({
    place: (index + 1) as UsersPodiumPlace,
    user,
  }));
};

export const buildUsersPodiumPlaceById = <T extends UsersPodiumCandidate>(
  users: readonly T[],
): ReadonlyMap<string, UsersPodiumPlace> => {
  const entries = rankUsersForPodium(users);
  return new Map(entries.map((entry) => [String(entry.user._id), entry.place]));
};

export const orderUsersPodiumForDisplay = <T extends UsersPodiumCandidate>(
  entries: readonly UsersPodiumEntry<T>[],
): UsersPodiumEntry<T>[] => {
  const byPlace = new Map(entries.map((entry) => [entry.place, entry]));
  const ordered: UsersPodiumEntry<T>[] = [];

  for (const place of PODIUM_DISPLAY_ORDER) {
    const entry = byPlace.get(place);
    if (entry != null) {
      ordered.push(entry);
    }
  }

  return ordered;
};

export const excludeUsersPodiumFromList = <T extends UsersPodiumCandidate>(
  users: readonly T[],
  podiumEntries: readonly UsersPodiumEntry<T>[],
): T[] => {
  if (podiumEntries.length === 0) {
    return [...users];
  }

  const podiumIds = new Set(
    podiumEntries.map((entry) => String(entry.user._id)),
  );

  return users.filter((user) => !podiumIds.has(String(user._id)));
};
