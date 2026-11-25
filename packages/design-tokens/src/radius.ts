/**
 * Радиусы. Синхрон с `client/src/shared/styles/designTokens.css` (`--iz-radius-*`).
 * `lg` = 17px (целое; CSS раньше был `calc(14px * 1.2)` ≈ 16.8).
 */
export const izRadius = {
  sm: 8,
  md: 12,
  lg: 17,
  pill: 999,
  button: 10,
  input: 8,
  modal: 12,
  /** Mobile parity scale / `--iz-radius-card` */
  card: 14,
  /** Mobile parity scale / `--iz-radius-card-lg` */
  cardLg: 16,
  /** Mobile parity scale / `--iz-radius-segment-tab` */
  segmentTab: 11,
} as const;
