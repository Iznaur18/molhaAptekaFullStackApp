import type { IzTheme } from "@izibuy/design-tokens";

type ThemeColors = IzTheme["colors"];

/** Soft warning ring matching web `.product-card--raffle-participant`. */
export const resolveProductCardRaffleParticipantFrameStyle = (colors: ThemeColors) =>
  ({
    borderWidth: 1,
    borderColor: `${colors.warning}73`,
    backgroundColor: colors.surface,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  }) as const;
