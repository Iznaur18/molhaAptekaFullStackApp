/** Квадратное превью приза на главной (web + mobile). */
export const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO = 0.42;

export const RAFFLE_FEATURED_VISUAL_ASPECT_RATIO_STACKED = 1;

/** @deprecated Split-layout убран — оставлено для обратной совместимости импортов. */
export const RAFFLE_FEATURED_VISUAL_MIN_HEIGHT = 160;

/** @deprecated Квадрат считается от ширины карточки. */
export const RAFFLE_FEATURED_VISUAL_STACKED_HEIGHT = 196;

/** @deprecated Split-layout убран. */
export const RAFFLE_FEATURED_SPLIT_LAYOUT_MIN_CARD_WIDTH = 641;

export const RAFFLE_FEATURED_CARD_BORDER_RADIUS = 22;
export const RAFFLE_FEATURED_CARD_PANEL_GAP = 12;

export const RAFFLE_FEATURED_BANNER_CHROME = {
  cardPanelGap: RAFFLE_FEATURED_CARD_PANEL_GAP,
  cardBorderRadius: RAFFLE_FEATURED_CARD_BORDER_RADIUS,
  footerPaddingHorizontal: 16,
  footerPaddingTop: 12,
  footerPaddingBottom: 14,
  footerContentGap: 10,
  titleBadgeInset: 10,
  visualControlInset: 10,
  innerPaddingHorizontal: 0,
  innerPaddingTop: 0,
  innerPaddingBottom: 0,
  imageBleedHorizontal: 0,
  imageBleedTop: 0,
  stackedGridGap: RAFFLE_FEATURED_CARD_PANEL_GAP,
  bodyPaddingTop: 0,
  stackedBodyPaddingTop: 0,
  titleLineHeight: 25,
  titleMarginBottom: 5,
  descriptionLineHeight: 20,
  descriptionMarginBottom: 10,
  progressBarHeight: 12,
  progressBarBorderRadius: 999,
  progressLabelMarginTop: 10,
  progressLabelLineHeight: 17,
  progressMarginBottom: 0,
  manageContentHeight: 32,
  managePaddingBottom: 0,
  manageMarginBottom: 0,
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
  /** Title/description — бейдж и info-overlay, не в footer. */
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
    return Math.max(0, Math.round(visualWidth));
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
  RAFFLE_FEATURED_BANNER_CHROME.footerContentGap +
  RAFFLE_FEATURED_BANNER_CHROME.progressLabelLineHeight +
  RAFFLE_FEATURED_BANNER_CHROME.progressMarginBottom;

export const resolveRaffleFeaturedManageSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.manageContentHeight +
  RAFFLE_FEATURED_BANNER_CHROME.managePaddingBottom +
  RAFFLE_FEATURED_BANNER_CHROME.manageMarginBottom;

export const resolveRaffleFeaturedActionsSlotHeight = (): number =>
  RAFFLE_FEATURED_BANNER_CHROME.actionsMinHeight;

export const resolveRaffleFeaturedBodyMinHeight = (
  _layout: RaffleFeaturedBannerLayoutMode = "stacked",
  _options: RaffleFeaturedBannerMetricsOptions = {},
): number => {
  const chrome = RAFFLE_FEATURED_BANNER_CHROME;

  return (
    chrome.footerPaddingTop +
    chrome.footerPaddingBottom +
    resolveRaffleFeaturedProgressSlotHeight() +
    chrome.footerContentGap +
    resolveRaffleFeaturedActionsSlotHeight()
  );
};

export const resolveRaffleFeaturedBannerLayoutMode = (
  _cardWidth?: number,
): RaffleFeaturedBannerLayoutMode => "stacked";

export const resolveRaffleFeaturedVisualWidth = (
  cardWidth: number,
  _layout: RaffleFeaturedBannerLayoutMode = "stacked",
): number => Math.max(0, cardWidth);

export const resolveRaffleFeaturedBannerInnerMinHeight = (
  cardWidth: number,
  layout: RaffleFeaturedBannerLayoutMode = "stacked",
  options: RaffleFeaturedBannerMetricsOptions = {},
): number => {
  const chrome = RAFFLE_FEATURED_BANNER_CHROME;
  const visualHeight = resolveRaffleFeaturedVisualHeight(
    resolveRaffleFeaturedVisualWidth(cardWidth, layout),
    layout,
  );
  const bodyMinHeight = resolveRaffleFeaturedBodyMinHeight(layout, options);

  return Math.round(visualHeight + chrome.cardPanelGap + bodyMinHeight);
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
    showInlineCopy: false,
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
