import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Максимум удержания нативного сплэша: если контент не успел загрузиться
 * (медленная сеть, ошибка запроса), показываем экран с тем, что есть,
 * вместо бесконечной заглушки.
 */
export const COLD_START_SPLASH_MAX_WAIT_MS = 5000;

const canUseNativeSplash = Platform.OS !== "web";

let isSplashReleased = false;
let hideSplashPromise: Promise<void> | null = null;

/**
 * Регистрирует удержание нативного сплэша на cold start.
 * На web — no-op.
 */
export const prepareColdStartSplash = (): void => {
  if (!canUseNativeSplash) {
    return;
  }
  void SplashScreen.preventAutoHideAsync().catch(() => {});
};

/**
 * Прячет нативный сплэш. При смене view controller (auth → tabs на iOS)
 * первый hideAsync может упасть — флаг success ставим только после resolve,
 * чтобы повторный вызов после login/replace снова попробовал скрыть.
 */
export const releaseColdStartSplash = (): void => {
  if (isSplashReleased || !canUseNativeSplash) {
    return;
  }

  if (hideSplashPromise) {
    return;
  }

  hideSplashPromise = SplashScreen.hideAsync()
    .then(() => {
      isSplashReleased = true;
    })
    .catch(() => {
      // VC сменился (login/register) — сплэш ещё не зарегистрирован для текущего.
    })
    .finally(() => {
      hideSplashPromise = null;
    });
};

/**
 * Держит нативный сплэш, пока стартовый экран не готов отрисоваться целиком —
 * контент появляется одним кадром, без поддёргиваний от догружающихся секций.
 * Работает только на холодном старте: после первого скрытия сплэша — no-op.
 * Страховочный таймаут живёт в корневом layout.
 */
export const useColdStartSplashGate = (isContentReady: boolean) => {
  useEffect(() => {
    if (isContentReady) {
      releaseColdStartSplash();
    }
  }, [isContentReady]);
};
