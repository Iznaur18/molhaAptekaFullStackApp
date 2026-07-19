import { useCallback, useEffect, useState, type RefObject } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Gesture } from "react-native-gesture-handler";
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS } from "@/shared/lib/homeCatalogBackdropLayout";
import { homeCatalogTabBarRevealProgress } from "@/shared/model/homeCatalogTabBarVisibility";

/** Порог скорости (px/s): резкий флик доводит переход даже на коротком пути. */
const SWIPE_VELOCITY = 320;
/** Доля dockOffset, которую нужно протянуть, чтобы переход «зафиксировался». */
const COMMIT_TRAVEL = 0.22;
/**
 * Жёсткость «резинки»: eff = raw / (raw + RESIST). Чем больше протянул, тем
 * тяжелее идёт (производная максимальна у начала и падает дальше). Меньше
 * значение — резинка мягче (быстрее набирает ход), больше — тяжелее.
 */
const RUBBER_RESIST = 0.55;
/** Наклон/старт вертикального жеста — иначе горизонтальные ленты внутри работают свободно. */
const PAN_ACTIVATE_Y = 14;
const PAN_FAIL_X = 18;
/** Ниже этого progress шторка закрывает hero — фоновое видео можно ставить на паузу. */
const BACKDROP_PLAYBACK_THRESHOLD = 0.9;

/** Пружина доводки/отката — лёгкая упругость без заметного перелёта. */
const SPRING_CONFIG = { damping: 20, stiffness: 210, mass: 1 } as const;
/** Программный возврат к интро (тап по вкладке) — детерминированная анимация. */
const RESET_CONFIG = { duration: 380, easing: Easing.out(Easing.cubic) } as const;

const clamp01 = (value: number): number => {
  "worklet";
  return value < 0 ? 0 : value > 1 ? 1 : value;
};

/** Резиновое затухание: 0 при raw=0, асимптотически → 1; тяжелее с расстоянием. */
const rubber = (raw: number): number => {
  "worklet";
  const positive = raw < 0 ? 0 : raw;
  return positive / (positive + RUBBER_RESIST);
};

type ScrollableToOffset = {
  scrollToOffset: (params: { offset: number; animated?: boolean }) => void;
};

type UseHomeFeedIntroTransitionParams = {
  /** Дистанция сдвига шторки: высота hero-интро + cap. */
  dockOffset: number;
  /** Реф внутреннего FlatList — для возврата в верх при сбросе. */
  listRef: RefObject<ScrollableToOffset | null>;
  /** true только на главной ленте: вне её переход не управляет таб-баром. */
  enabled: boolean;
  /**
   * false — интро-фон выключен: лента сразу открыта, жест/сброс в hero no-op.
   * @see IS_HOME_FEED_INTRO_BACKDROP_ENABLED
   */
  introBackdropEnabled?: boolean;
};

/**
 * Двухпозиционный переход «интро (задний фон) ↔ лента (передний фон)» с
 * резиновым следованием за пальцем.
 *
 * Во время жеста шторка тянется за пальцем с нарастающим сопротивлением
 * (см. {@link rubber}) — чем дальше, тем тяжелее. По отпусканию: протянул
 * дальше порога (или резкий флик) → доводим до края пружиной, иначе — упруго
 * откатываем назад. Механика двусторонняя:
 *   - из интро тянем вверх → открываем ленту;
 *   - из переднего фона сброс в интро — тап по вкладке «Главная» (`resetToIntro`),
 *     а не pull-down (pull-down оставлен под RefreshControl).
 * Вне этих условий (свайп внутри ленты) жест перехода не вмешивается — работает
 * обычная нативная прокрутка.
 */
export const useHomeFeedIntroTransition = ({
  dockOffset,
  listRef,
  enabled,
  introBackdropEnabled = true,
}: UseHomeFeedIntroTransitionParams) => {
  // 0 — интро (задний фон), 1 — лента (передний фон). Во время жеста — дробное.
  // При выключенном hero сразу стартуем с ленты — без мигания фона на загрузке.
  const initialOpen = introBackdropEnabled ? 0 : 1;
  const progress = useSharedValue(initialOpen);
  // Осевшее состояние (0/1), меняется только по завершении анимации — от него
  // зависит scrollEnabled, чтобы прокрутка не дёргалась на дробном progress.
  const mode = useSharedValue(initialOpen);
  // 1 — активна главная лента (иначе не трогаем таб-бар).
  const enabledSv = useSharedValue(enabled ? 1 : 0);

  // Снимок на старте жеста — чтобы следование было без скачка и с учётом того,
  // откуда начали (интро/лента).
  const dragActive = useSharedValue(0);
  const dragStartProgress = useSharedValue(0);

  const [scrollEnabled, setScrollEnabled] = useState(initialOpen >= 0.5);
  const [backdropPlaybackActive, setBackdropPlaybackActive] = useState(introBackdropEnabled);

  const applyScrollEnabledFromMode = useCallback((nextMode: number) => {
    setScrollEnabled(nextMode >= 0.5);
  }, []);

  useEffect(() => {
    enabledSv.value = enabled ? 1 : 0;
  }, [enabled, enabledSv]);

  // Список активен только в осевшем переднем фоне; на дробном progress состояние
  // не трогаем, чтобы прокрутка не включалась посреди жеста.
  useAnimatedReaction(
    () => mode.value,
    (current, previous) => {
      if (current !== previous) {
        runOnJS(applyScrollEnabledFromMode)(current);
      }
    },
  );

  useAnimatedReaction(
    () => progress.value < BACKDROP_PLAYBACK_THRESHOLD,
    (active, previous) => {
      if (active !== previous) {
        runOnJS(setBackdropPlaybackActive)(active);
      }
    },
  );

  // Таб-бар выезжает вместе с переходом: скрыт на интро, показан на ленте.
  useAnimatedReaction(
    () => progress.value,
    (value) => {
      if (enabledSv.value === 1) {
        homeCatalogTabBarRevealProgress.value = clamp01(value);
      }
    },
  );

  // Возврат на главную: reveal мог быть сброшен в 1 на других вкладках
  // (resetHomeCatalogTabBarReveal при blur). По фокусу возвращаем его к текущему
  // состоянию перехода, иначе таб-бар остаётся видимым на интро.
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }
      homeCatalogTabBarRevealProgress.value = clamp01(progress.value);
      applyScrollEnabledFromMode(mode.value);
    }, [applyScrollEnabledFromMode, enabled, mode, progress]),
  );

  // Нативный жест самой ленты. Pan работает поверх экрана ОДНОВРЕМЕННО с ним,
  // иначе Pan перехватывал бы прокрутку. Связываем их через simultaneous.
  const nativeGesture = Gesture.Native();

  const panGesture = Gesture.Pan()
    .enabled(introBackdropEnabled)
    .activeOffsetY([-PAN_ACTIVATE_Y, PAN_ACTIVATE_Y])
    .failOffsetX([-PAN_FAIL_X, PAN_FAIL_X])
    .simultaneousWithExternalGesture(nativeGesture)
    .onStart(() => {
      "worklet";
      dragStartProgress.value = progress.value;
      // Жест перехода только из интро (открытие вверх). С ленты pull-down —
      // RefreshControl, не закрытие в hero.
      dragActive.value = dragStartProgress.value <= 0.5 ? 1 : 0;
    })
    .onUpdate((event) => {
      "worklet";
      if (dragActive.value === 0) {
        return;
      }
      const start = dragStartProgress.value;
      if (start <= 0.5) {
        // Открытие: тянем вверх (translationY < 0), прогресс растёт с сопротивлением.
        const raw = -event.translationY / dockOffset;
        progress.value = clamp01(start + (1 - start) * rubber(raw));
      }
    })
    .onFinalize((event) => {
      "worklet";
      if (dragActive.value === 0) {
        return;
      }
      dragActive.value = 0;

      const travel = dockOffset * COMMIT_TRAVEL;
      const commit = -event.translationY >= travel || event.velocityY <= -SWIPE_VELOCITY;
      const target = commit ? 1 : 0;

      progress.value = withSpring(target, SPRING_CONFIG, (finished) => {
        if (finished) {
          mode.value = target >= 0.5 ? 1 : 0;
        }
      });
    });

  const sheetStyle = useAnimatedStyle(() => {
    const hidden = 1 - clamp01(progress.value);
    const radius = hidden * HOME_CATALOG_FOREGROUND_SHEET_TOP_RADIUS;
    return {
      transform: [{ translateY: hidden * dockOffset }],
      borderTopLeftRadius: radius,
      borderTopRightRadius: radius,
    };
  }, [dockOffset]);

  // Возврат к интро (тап по вкладке «Домой», когда уже на ленте).
  const resetToIntro = useCallback(() => {
    if (!introBackdropEnabled) {
      return;
    }
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    // mode сразу в интро — прокрутка выключается на время анимации.
    mode.value = 0;
    progress.value = withTiming(0, RESET_CONFIG);
  }, [introBackdropEnabled, listRef, mode, progress]);

  /** Сразу открыть ленту (progress=1): скролл и таб-бар без жеста интро. */
  const openFeedSheet = useCallback(() => {
    progress.value = 1;
    mode.value = 1;
    applyScrollEnabledFromMode(1);
    if (enabled) {
      homeCatalogTabBarRevealProgress.value = 1;
    }
  }, [applyScrollEnabledFromMode, enabled, mode, progress]);

  return {
    panGesture,
    nativeGesture,
    sheetStyle,
    scrollEnabled,
    backdropPlaybackActive,
    resetToIntro,
    openFeedSheet,
  };
};
