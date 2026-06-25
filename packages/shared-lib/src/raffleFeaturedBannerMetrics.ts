/** Высота visual = visualWidth × ratio (web + mobile). */
export const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO = 0.42;

export const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO_STACKED = 0.52;

/** Web `.raffle-featured-banner__visual` min-height (split / desktop). */
export const RAFFLE_FEATURED_VISUAL_MIN_HEIGHT = 160;

/** Web mobile stacked: `height: 12.25rem`. */
export const RAFFLE_FEATURED_VISUAL_STACKED_HEIGHT = 196;

/** Ширина карточки, с которой web переходит в 2-колоночный layout. */
export const RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH = 641;

export const RAFFLE_FEATURED_BANNER_CHROME = {
  innerPaddingHorizontal: 6.4,
  innerPaddingTop: 5.12,
  innerPaddingBottom: 6.08,
  imageBleedHorizontal: 4.8,
  imageBleedTop: 3.52,
  /** Web `.raffle-featured-banner__inner` row gap @mobile stacked (`1rem`). */
  stackedGridGap: 16,
  bodyPaddingTop: 10,
  stackedBodyPaddingTop: 0,
  titleLineHeight: 25,
  titleMarginBottom: 5,
  descriptionLineHeight: 20,
  descriptionMarginBottom: 10,
  progressBarHeight: 8.8,
  progressLabelMarginTop: 5.6,
  progressLabelLineHeight: 17,
  progressMarginBottom: 12,
  manageContentHeight: 32,
  managePaddingBottom: 10.4,
  manageMarginBottom: 10.4,
  actionsMinHeight: 32,
  actionsGap: 8,
  splitGridGap: 20,
} as const;

export type RaffleFeaturedBannerLayoutMode = "stacked" | "split";

export type RaffleFeaturedBannerMetricsOptions = {
  hasManage?: boolean;
};

export type RaffleFeaturedBannerMetrics = {
  cardWidth: number;
  layout: RaffleFeaturedBannerLayoutMode;
  /** Web mobile stacked: title/description в info-panel, не в body. */
  showInlineCopy: boolean;
  visualWidth: number;
  visualHeight: number;
  bodyMinHeight: number;
  innerMinHeight: number;
  titleSlotHeight: number;
  descriptionSlotHeight: number;
  progressSlotHeight: number;
  manageSlotHeight: number;
  actionsSlotHeight: number;
};

export const resolveRaffleFeaturedVisualHeight = (
  visualWidth: number,
  layout: RaffleFeaturedBannerLayoutMode = "stacked",
): number => {
  if (layout === "stacked") {
    return RAFFLE_FEATURED_VISUAL_STACKED_HEIGHT;
  }

  const fromAspect = Math.round(
    Math.max(0, visualWidth) * RAFFLE_FEATURED_VISUAL_ASPECT_RATIO,
  );

  return Math.max(RAFFLE_FEATURED_VISUAL_MIN_HEIGHT, fromAspect);
};

export const resolveRaffleFeaturedTitleSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.titleLineHeight +
  RAFFLE_FEATURED_BANNER_CHROME.titleMarginBottom;

export const resolveRaffleFeaturedDescriptionSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.descriptionLineHeight +
  RAFFLE_FEATURED_BANNER_CHROME.descriptionMarginBottom;

export const resolveRaffleFeaturedProgressSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.progressBarHeight +
  RAFFLE_FEATURED_BANNER_CHROME.progressLabelMarginTop +
  RAFFLE_FEATURED_BANNER_CHROME.progressLabelLineHeight +
  RAFFLE_FEATURED_BANNER_CHROME.progressMarginBottom;

export const resolveRaffleFeaturedManageSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.manageContentHeight +
  RAFFLE_FEATURED_BANNER_CHROME.managePaddingBottom +
  RAFFLE_FEATURED_BANNER_CHROME.manageMarginBottom;

export const resolveRaffleFeaturedActionsSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.actionsMinHeight;

export const resolveRaffleFeaturedBodyMinHeight = (
  layout: RaffleFeaturedBannerLayoutMode = "split",
  options: RaffleFeaturedBannerMetricsOptions = {},
): number => {
  const { hasManage = false } = options;
  const chrome = RAFFLE_FEATURED_BANNER_CHROME;
  const copySlots =
    layout === "split"
      ? resolveRaffleFeaturedTitleSlotHeight() +
        resolveRaffleFeaturedDescriptionSlotHeight()
      : 0;
  const bodyPaddingTop =
    layout === "split" ? chrome.bodyPaddingTop : chrome.stackedBodyPaddingTop;
  const manageSlot = hasManage ? resolveRaffleFeaturedManageSlotHeight() : 0;

  return (
    bodyPaddingTop +
    copySlots +
    resolveRaffleFeaturedProgressSlotHeight() +
    manageSlot +
    resolveRaffleFeaturedActionsSlotHeight()
  );
};

export const resolveRaffleFeaturedBannerLayoutMode = (
  cardWidth: number,
): RaffleFeaturedBannerLayoutMode =>
  cardWidth >= RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH ? "split" : "stacked";

export const resolveRaffleFeaturedVisualWidth = (
  cardWidth: number,
  layout: RaffleFeaturedBannerLayoutMode = resolveRaffleFeaturedBannerLayoutMode(cardWidth),
): number => {
  const width = Math.max(0, cardWidth);
  if (layout === "stacked") {
    return width;
  }

  const chrome = RAFFLE_FEATURED_BANNER_CHROME;
  const innerContentWidth = width - chrome.innerPaddingHorizontal * 2;
  return Math.max(0, (innerContentWidth - chrome.splitGridGap) / 2);
};

export const resolveRaffleFeaturedBannerInnerMinHeight = (
  cardWidth: number,
  layout: RaffleFeaturedBannerLayoutMode = resolveRaffleFeaturedBannerLayoutMode(cardWidth),
  options: RaffleFeaturedBannerMetricsOptions = {},
): number => {
  const chrome = RAFFLE_FEATURED_BANNER_CHROME;
  const visualHeight = resolveRaffleFeaturedVisualHeight(
    resolveRaffleFeaturedVisualWidth(cardWidth, layout),
    layout,
  );
  const bodyMinHeight = resolveRaffleFeaturedBodyMinHeight(layout, options);

  if (layout === "stacked") {
    return Math.round(
      chrome.innerPaddingTop +
        chrome.innerPaddingBottom +
        visualHeight -
        chrome.imageBleedTop +
        chrome.stackedGridGap +
        bodyMinHeight,
    );
  }

  return Math.round(
    chrome.innerPaddingTop +
      chrome.innerPaddingBottom +
      Math.max(visualHeight, bodyMinHeight),
  );
};

export const resolveRaffleFeaturedBannerMetrics = (
  cardWidth: number,
  layout: RaffleFeaturedBannerLayoutMode = resolveRaffleFeaturedBannerLayoutMode(cardWidth),
  options: RaffleFeaturedBannerMetricsOptions = {},
): RaffleFeaturedBannerMetrics => {
  const visualWidth = resolveRaffleFeaturedVisualWidth(cardWidth, layout);

  return {
    cardWidth: Math.max(0, cardWidth),
    layout,
    showInlineCopy: layout === "split",
    visualWidth,
    visualHeight: resolveRaffleFeaturedVisualHeight(visualWidth, layout),
    bodyMinHeight: resolveRaffleFeaturedBodyMinHeight(layout, options),
    innerMinHeight: resolveRaffleFeaturedBannerInnerMinHeight(cardWidth, layout, options),
    titleSlotHeight: resolveRaffleFeaturedTitleSlotHeight(),
    descriptionSlotHeight: resolveRaffleFeaturedDescriptionSlotHeight(),
    progressSlotHeight: resolveRaffleFeaturedProgressSlotHeight(),
    manageSlotHeight: resolveRaffleFeaturedManageSlotHeight(),
    actionsSlotHeight: resolveRaffleFeaturedActionsSlotHeight(),
  };
};
