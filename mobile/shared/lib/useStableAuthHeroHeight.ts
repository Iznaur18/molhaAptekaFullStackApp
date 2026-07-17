import { useState } from "react";
import { Dimensions } from "react-native";

import { resolveAuthHeroHeight } from "@/shared/lib/resolveAuthHeroHeight";

/**
 * Фиксируем hero на mount.
 * Нельзя подписываться на window/visualViewport resize — на mobile web
 * клавиатура сжимает viewport, layout прыгает и TextInput теряет фокус.
 */
export const useStableAuthHeroHeight = (): number => {
  const [heroHeight] = useState(() => {
    const screen = Dimensions.get("screen");
    const windowSize = Dimensions.get("window");
    return resolveAuthHeroHeight(screen.height || windowSize.height);
  });

  return heroHeight;
};
