/**
 * RN shadow recipes ≈ web `--iz-shadow-*`.
 * `shadowColor` задаёт потребитель (`theme.colors.ink` / `overlay`).
 * opacity калибрована под ink/#0f172a ≈ web overlay tokens.
 */
export const izShadows = {
  card: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  elevated: {
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  modal: {
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 16,
  },
  inputFocus: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
