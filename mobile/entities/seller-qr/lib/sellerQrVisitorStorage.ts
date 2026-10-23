import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { reportClientIssue } from "@/shared/lib/reportClientIssue";

/** Те же ключи, что у web `sellerQrVisitor.js` (в веб-сборке — общий localStorage). */
const VISITOR_ID_KEY = "iz.sellerQr.visitorId";
// SecureStore пускает в ключ только буквы, цифры, «.», «-», «_».
const TRACKED_KEY_PREFIX = "iz.sellerQr.tracked.";

const USE_WEB_STORAGE = Platform.OS === "web";

const readValue = async (key: string): Promise<string | null> => {
  if (USE_WEB_STORAGE) {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
};

const writeValue = async (key: string, value: string): Promise<void> => {
  if (USE_WEB_STORAGE) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const createVisitorId = (): string =>
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

/**
 * Случайный id устройства — чтобы один человек не считался за переход много
 * раз. Хранилище недоступно — id живёт до перезапуска, подсчёт всё равно идёт.
 */
export const getSellerQrVisitorId = async (): Promise<string> => {
  try {
    const stored = await readValue(VISITOR_ID_KEY);
    if (stored) {
      return stored;
    }
    const created = createVisitorId();
    await writeValue(VISITOR_ID_KEY, created);
    return created;
  } catch (error) {
    reportClientIssue("sellerQrVisitorStorage#visitorId", error);
    return createVisitorId();
  }
};

/** Отмечает переход за сегодня. `false` — сегодня этого продавца уже считали. */
export const markSellerQrScanToday = async (
  sellerId: string,
  now: Date = new Date(),
): Promise<boolean> => {
  const key = `${TRACKED_KEY_PREFIX}${sellerId}`;
  const day = now.toISOString().slice(0, 10);
  try {
    if ((await readValue(key)) === day) {
      return false;
    }
    await writeValue(key, day);
  } catch (error) {
    // Без хранилища считаем каждый заход; сервер всё равно схлопнет повторы.
    reportClientIssue("sellerQrVisitorStorage#mark", error);
  }
  return true;
};
