/** Высота visual = visualWidth × ratio (web + mobile). */
export const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO = 0.42;

/** Ширина карточки, с которой web переходит в 2-колоночный layout. */
export const RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH = 641;

export const RAFFLE_FEATURED_BANNER_CHROME = {
  innerPaddingHorizontal: 6.4,
  innerPaddingTop: 5,
  innerPaddingBottom: 6,
  imageBleedTop: 3.5,
  bodyPaddingTop: 10,
  titleLineHeight: 25,
  titleMarginBottom: 5,
  descriptionLineHeight: 20,
  descriptionMarginBottom: 10,
  progressBarHeight: 9,
  progressLabelMarginTop: 5,
  progressLabelLineHeight: 20,
  progressMarginBottom: 12,
  manageContentHeight: 32,
  managePaddingBottom: 10,
  manageMarginBottom: 10,
  actionsMinHeight: 36,
  splitGridGap: 20,
} as const;

export type RaffleFeaturedBannerLayoutMode = "stacked" | "split";

export type RaffleFeaturedBannerMetrics = {
  cardWidth: number;
  layout: RaffleFeaturedBannerLayoutMode;
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

export const resolveRaffleFeaturedVisualHeight = (visualWidth: number): number =>
  Math.round(Math.max(0, visualWidth) * RAFFLE_FEATURED_VISUAL_ASPECT_RATIO);

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

export const resolveRaffleFeaturedBodyMinHeight = (): number => {
  const chrome = RAFFLE_FEATURED_BANNER_CHROME;
  return (
    chrome.bodyPaddingTop +
    resolveRaffleFeaturedTitleSlotHeight() +
    resolveRaffleFeaturedDescriptionSlotHeight() +
    resolveRaffleFeaturedProgressSlotHeight() +
    resolveRaffleFeaturedManageSlotHeight() +
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
): number => {
  const chrome = RAFFLE_FEATURED_BANNER_CHROME;
  const visualHeight = resolveRaffleFeaturedVisualHeight(
    resolveRaffleFeaturedVisualWidth(cardWidth, layout),
  );
  const bodyMinHeight = resolveRaffleFeaturedBodyMinHeight();

  if (layout === "stacked") {
    return Math.round(
      chrome.innerPaddingTop +
        chrome.innerPaddingBottom +
        visualHeight -
        chrome.imageBleedTop +
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
): RaffleFeaturedBannerMetrics => {
  const visualWidth = resolveRaffleFeaturedVisualWidth(cardWidth, layout);

  return {
    cardWidth: Math.max(0, cardWidth),
    layout,
    visualWidth,
    visualHeight: resolveRaffleFeaturedVisualHeight(visualWidth),
    bodyMinHeight: resolveRaffleFeaturedBodyMinHeight(),
    innerMinHeight: resolveRaffleFeaturedBannerInnerMinHeight(cardWidth, layout),
    titleSlotHeight: resolveRaffleFeaturedTitleSlotHeight(),
    descriptionSlotHeight: resolveRaffleFeaturedDescriptionSlotHeight(),
    progressSlotHeight: resolveRaffleFeaturedProgressSlotHeight(),
    manageSlotHeight: resolveRaffleFeaturedManageSlotHeight(),
    actionsSlotHeight: resolveRaffleFeaturedActionsSlotHeight(),
  };
};
