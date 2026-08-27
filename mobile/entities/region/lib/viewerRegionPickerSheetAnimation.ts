/** Паритет client `ViewerRegionPickerSheet.css`. */
export const VIEWER_REGION_PICKER_SHEET_ANIMATION = {
  enterMs: 300,
  exitMs: 240,
  enterEasingCss: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  exitEasingCss: "cubic-bezier(0.55, 0.055, 0.675, 1)",
  /** `--viewer-region-sheet-height: min(92svh, 36rem)` */
  maxHeightRatio: 0.92,
  maxHeightPx: 576,
} as const;
