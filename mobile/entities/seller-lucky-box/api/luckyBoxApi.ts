import { apiClient } from "@/shared/api";
import { formatApiErrorMessage } from "@/shared/lib";

/** Приз игры: скидка (%) ИЛИ товар за 0 ₽ (prizeProductId задан). */
export type LuckyBoxPrize = {
  discountPercent?: number | null;
  durationHours?: number | null;
  prizeProductId?: string | null;
  prizeProductName?: string | null;
  expiresAt?: string | null;
};

/** Одна совершённая попытка (из todayPlays или ответ POST /play). */
export type LuckyBoxPlay = {
  pickedBoxIndex: number;
  result: "win" | "empty";
  /** Раскладка призовых коробок — сервер раскрывает её после попытки. */
  layout?: number[];
  layoutPrizes?: {
    boxIndex: number;
    discountPercent?: number | null;
    prizeProductId?: string | null;
    prizeProductName?: string | null;
  }[];
  prize?: LuckyBoxPrize | null;
  winExpiresAt?: string | null;
  /** Сервер положил товар-приз в корзину (или объяснил, почему нет). */
  cartPrize?:
    | { ok: true; alreadyInCart: boolean }
    | { ok: false; message: string }
    | null;
};

export type LuckyBoxActiveWin = {
  discountPercent?: number | null;
  prizeProductId?: string | null;
  prizeProductName?: string | null;
};

/** Публичное состояние игры на витрине продавца. */
export type SellerLuckyBoxState = {
  enabled: boolean;
  boxesTotal?: number;
  prizesTotal?: number;
  attemptsTotal?: number;
  canPlay?: boolean;
  requiresAuth?: boolean;
  todayPlays?: LuckyBoxPlay[];
  activeWin?: LuckyBoxActiveWin | null;
};

/**
 * Паритет web `fetchSellerLuckyBoxState`: без строгой схемы намеренно —
 * необязательный блок не должен ронять витрину.
 */
export async function fetchSellerLuckyBoxState(
  sellerId: string,
): Promise<SellerLuckyBoxState> {
  try {
    const { data } = await apiClient.get(
      `/seller-lucky-box/seller/${encodeURIComponent(sellerId)}`,
    );
    return (
      (data?.data as SellerLuckyBoxState | undefined) ?? {
        enabled: false,
        boxesTotal: 6,
      }
    );
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить игру"));
  }
}

export async function playLuckyBox(
  sellerId: string,
  boxIndex: number,
): Promise<LuckyBoxPlay | null> {
  try {
    const { data } = await apiClient.post(
      `/seller-lucky-box/seller/${encodeURIComponent(sellerId)}/play`,
      { boxIndex },
    );
    return (data?.data as LuckyBoxPlay | undefined) ?? null;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось открыть коробку"));
  }
}

/** Активный выигрыш покупателя для корзины (скидка или товар-приз). */
export type MyLuckyBoxWin = {
  sellerId?: string | null;
  discountPercent?: number | null;
  prizeProductId?: string | null;
  prizeProductName?: string | null;
};

export type LuckyBoxConfigPrize = {
  discountPercent?: number;
  durationHours?: number;
  prizeProductId?: string | null;
  enabled?: boolean;
};

export type MyLuckyBoxConfig = {
  enabled?: boolean;
  prizes?: LuckyBoxConfigPrize[];
  playsTotal?: number;
  winsTotal?: number;
};

export type PutMyLuckyBoxConfigBody = {
  enabled: boolean;
  prizes: Array<{
    discountPercent: number;
    durationHours: number;
    prizeProductId?: string | null;
    enabled: boolean;
  }>;
};

/** Паритет web `fetchMyLuckyBoxConfig`. */
export async function fetchMyLuckyBoxConfig(): Promise<MyLuckyBoxConfig | null> {
  try {
    const { data } = await apiClient.get("/seller-lucky-box/me/config");
    return (data?.data?.config as MyLuckyBoxConfig | undefined) ?? null;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось загрузить настройки игры"),
    );
  }
}

/** Паритет web `putMyLuckyBoxConfig`. */
export async function putMyLuckyBoxConfig(
  body: PutMyLuckyBoxConfigBody,
): Promise<MyLuckyBoxConfig | null> {
  try {
    const { data } = await apiClient.put("/seller-lucky-box/me/config", body);
    return (data?.data?.config as MyLuckyBoxConfig | undefined) ?? null;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, "Не удалось сохранить настройки игры"),
    );
  }
}

/** Паритет web `fetchMyLuckyBoxWins`. */
export async function fetchMyLuckyBoxWins(): Promise<MyLuckyBoxWin[]> {
  try {
    const { data } = await apiClient.get("/seller-lucky-box/me/wins");
    const wins = data?.data?.wins;
    return Array.isArray(wins) ? (wins as MyLuckyBoxWin[]) : [];
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, "Не удалось загрузить выигрыши"));
  }
}
