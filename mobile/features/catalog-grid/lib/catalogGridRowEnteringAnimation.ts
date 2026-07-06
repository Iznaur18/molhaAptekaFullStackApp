import {
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const CATALOG_ROW_ENTER_OFFSET_PX = 28;
const CATALOG_ROW_ENTER_SCALE = 0.96;
const CATALOG_ROW_ENTER_OPACITY_MS = 280;
const CATALOG_ROW_ENTER_STAGGER_MS = 36;
const CATALOG_ROW_ENTER_STAGGER_CAP = 5;

export const createCatalogGridRowEntering = (
  scrollDirection: SharedValue<number>,
  rowIndex = 0,
) => {
  return () => {
    "worklet";

    const direction = scrollDirection.value >= 0 ? 1 : -1;
    const staggerMs =
      Math.min(Math.max(rowIndex, 0), CATALOG_ROW_ENTER_STAGGER_CAP) *
      CATALOG_ROW_ENTER_STAGGER_MS;

    return {
      initialValues: {
        opacity: 0,
        transform: [
          { translateY: direction * CATALOG_ROW_ENTER_OFFSET_PX },
          { scale: CATALOG_ROW_ENTER_SCALE },
        ],
      },
      animations: {
        opacity: withDelay(staggerMs, withTiming(1, { duration: CATALOG_ROW_ENTER_OPACITY_MS })),
        transform: [
          {
            translateY: withDelay(
              staggerMs,
              withSpring(0, { damping: 18, stiffness: 280, mass: 0.8 }),
            ),
          },
          {
            scale: withDelay(
              staggerMs,
              withSpring(1, { damping: 18, stiffness: 280, mass: 0.8 }),
            ),
          },
        ],
      },
    };
  };
};
