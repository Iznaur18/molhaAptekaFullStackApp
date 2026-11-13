import { apiClient } from "@/shared/api";
import { formatApiErrorMessage } from "@/shared/lib";

/** Секция колеса в публичном state (шансы сервер отдаёт). */
export type FortuneWheelSector = {
  discountPercent: number;
  durationHours: number;
  chancePercent?: number;
  enabled: boolean;
  prizeProductId?: string | null;
};

export type FortuneWheelPrize = {
  discountPercent?: number | null;
  durationHours?: number | null;
  prizeProductId?: string | null;
  prizeProductName?: string | null;
  expiresAt?: string | null;
};

/** Результат спина (ответ POST /spin или todaySpin из state). */
export type FortuneWheelSpin = {
  sectorIndex: number;
  result: "win" | "empty";
  prize?: FortuneWheelPrize | null;
  winExpiresAt?: string | null;
};

export type FortuneWheelActiveWin = {
  discountPercent?: number | null;
  prizeProductId?: string | null;
  prizeProductName?: string | null;
};

/** Публичное состояние колеса на витрине продавца. */
export type SellerFortuneWheelState = {
  enabled: boolean;
  sectors?: FortuneWheelSector[];
  spinsTotal?: number;
  canSpin?: boolean;
  requiresAuth?: boolean;
  todaySpin?: FortuneWheelSpin | null;
  activeWin?: FortuneWheelActiveWin | null;
};

/**
 * Паритет web `fetchSellerFortuneWheelState`: без строгой схемы намеренно —
 * необязательный блок не должен ронять витрину.
 */
export async function fetchSellerFortuneWheelState(
  sellerId: string,
): Promise<SellerFortuneWheelState> {
  try {
    const { data } = await apiClient.get(
      `/seller-fortune-wheel/seller/${encodeURIComponent(sellerId)}`,
    );
    return (data?.data as SellerFortuneWheelState | undefined) ?? { enabled: false };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить игру"));
  }
}

export async function spinFortuneWheel(
  sellerId: string,
): Promise<FortuneWheelSpin | null> {
  try {
    const { data } = await apiClient.post(
      `/seller-fortune-wheel/seller/${encodeURIComponent(sellerId)}/spin`,
    );
    return (data?.data as FortuneWheelSpin | undefined) ?? null;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось крутить колесо"));
  }
}
