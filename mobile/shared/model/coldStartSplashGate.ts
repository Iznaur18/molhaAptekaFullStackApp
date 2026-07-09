import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

/**
 * Максимум удержания нативного сплэша: если контент не успел загрузиться
 * (медленная сеть, ошибка запроса), показываем экран с тем, что есть,
 * вместо бесконечной заглушки.
 */
export const COLD_START_SPLASH_MAX_WAIT_MS = 5000;

let isSplashReleased = false;

/** Прячет нативный сплэш один раз за жизнь процесса; повторные вызовы — no-op. */
export const releaseColdStartSplash = () => {
  if (isSplashReleased) {
    return;
  }
  isSplashReleased = true;
  void SplashScreen.hideAsync();
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
