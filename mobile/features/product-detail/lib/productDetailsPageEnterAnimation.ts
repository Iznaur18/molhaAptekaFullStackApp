import { Easing, withTiming } from "react-native-reanimated";

/**
 * Паритет web `ProductDetailsPage.css`:
 * `--product-details-page-enter-ms: 220ms` / exit `180ms`, scale `0.96 → 1`.
 */
export const PRODUCT_DETAILS_PAGE_ENTER_MS = 220;
export const PRODUCT_DETAILS_PAGE_EXIT_MS = 180;
export const PRODUCT_DETAILS_PAGE_ENTER_SCALE = 0.96;

const enterEasing = Easing.out(Easing.ease);
const exitEasing = Easing.in(Easing.ease);

/** Reanimated `entering` — mount product details screen. */
export const createProductDetailsPageEntering = () => {
  return () => {
    "worklet";
    return {
      initialValues: {
        opacity: 0,
        transform: [{ scale: PRODUCT_DETAILS_PAGE_ENTER_SCALE }],
      },
      animations: {
        opacity: withTiming(1, {
          duration: PRODUCT_DETAILS_PAGE_ENTER_MS,
          easing: enterEasing,
        }),
        transform: [
          {
            scale: withTiming(1, {
              duration: PRODUCT_DETAILS_PAGE_ENTER_MS,
              easing: enterEasing,
            }),
          },
        ],
      },
    };
  };
};

/**
 * Exit на Stack pop часто срезается навигатором — константы для паритета/тестов.
 * При поддержке `exiting` на корне экрана использовать эти timings.
 */
export const createProductDetailsPageExiting = () => {
  return () => {
    "worklet";
    return {
      initialValues: {
        opacity: 1,
        transform: [{ scale: 1 }],
      },
      animations: {
        opacity: withTiming(0, {
          duration: PRODUCT_DETAILS_PAGE_EXIT_MS,
          easing: exitEasing,
        }),
        transform: [
          {
            scale: withTiming(PRODUCT_DETAILS_PAGE_ENTER_SCALE, {
              duration: PRODUCT_DETAILS_PAGE_EXIT_MS,
              easing: exitEasing,
            }),
          },
        ],
      },
    };
  };
};
