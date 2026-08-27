export const RAFFLE_PATH_PREFIX = "/raffle";

export const buildRafflePath = (raffleId: string): string =>
  `${RAFFLE_PATH_PREFIX}/${encodeURIComponent(raffleId)}`;

export const parseRaffleIdFromPathname = (pathname: string): string | null => {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const match = normalized.match(/^\/raffle\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const isRaffleProductsPath = (pathname: string): boolean =>
  parseRaffleIdFromPathname(pathname) != null;
