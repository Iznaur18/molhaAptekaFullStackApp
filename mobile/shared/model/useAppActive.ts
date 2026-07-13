import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Image } from "expo-image";

/**
 * `true`, пока приложение на переднем плане. Уход в фон/сворачивание → `false`.
 * Используется как общий гейт для тяжёлого контента (видео), чтобы декодеры не
 * работали, когда пользователь не смотрит на экран.
 */
export const useAppActive = (): boolean => {
  const [active, setActive] = useState(() => AppState.currentState === "active");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      setActive(state === "active");
    });
    return () => subscription.remove();
  }, []);

  return active;
};

/**
 * Сбрасывает in-memory кеш изображений при уходе приложения в фон. expo-image не
 * даёт задать жёсткий лимит размера кеша, поэтому освобождаем RAM явно — на
 * слабых устройствах это снижает шанс убийства процесса системой. Диск-кеш
 * (memory-disk) остаётся, поэтому при возврате байты берутся с диска, без сети.
 */
export const useTrimImageMemoryOnBackground = (): void => {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "background") {
        void Image.clearMemoryCache();
      }
    });
    return () => subscription.remove();
  }, []);
};
