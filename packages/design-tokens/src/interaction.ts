/**
 * Interactive states — паритет `--iz-state-*` / `--iz-transition-*` в designTokens.css.
 */
export const izInteraction = {
  disabledOpacity: 0.55,
  pressedOpacity: 0.85,
  pressedScale: 0.96,
  /** withSpring({ damping: 18, stiffness: 350 }) ≈ press feedback */
  pressSpringDamping: 18,
  pressSpringStiffness: 350,
  transitionPressMs: 180,
  transitionBaseMs: 150,
} as const;
