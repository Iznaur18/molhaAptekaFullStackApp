import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import {
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
} from "@/features/intro-ad-moderation-page/lib/introAdModerationSectionFilters";

export type IntroAdModerationSectionZoneId =
  | typeof INTRO_AD_MODERATION_SECTION_INTRO
  | typeof INTRO_AD_MODERATION_SECTION_BANNER
  | typeof INTRO_AD_MODERATION_SECTION_PERSONAL
  | typeof INTRO_AD_MODERATION_SECTION_RAFFLE
  | typeof INTRO_AD_MODERATION_SECTION_USERS_RAFFLE;

type IntroAdModerationListPanelStyles = {
  list: StyleProp<ViewStyle & TextStyle>;
  listContentPanel: StyleProp<ViewStyle & TextStyle>;
  listContentPanelIntro: StyleProp<ViewStyle & TextStyle>;
  listContentPanelBanner: StyleProp<ViewStyle & TextStyle>;
  listContentPanelPersonal: StyleProp<ViewStyle & TextStyle>;
  listContentPanelRaffle: StyleProp<ViewStyle & TextStyle>;
  listContentPanelUsersRaffle: StyleProp<ViewStyle & TextStyle>;
};

const LIST_PANEL_ZONE_STYLE_KEYS: Record<
  IntroAdModerationSectionZoneId,
  keyof IntroAdModerationListPanelStyles
> = {
  [INTRO_AD_MODERATION_SECTION_INTRO]: "listContentPanelIntro",
  [INTRO_AD_MODERATION_SECTION_BANNER]: "listContentPanelBanner",
  [INTRO_AD_MODERATION_SECTION_PERSONAL]: "listContentPanelPersonal",
  [INTRO_AD_MODERATION_SECTION_RAFFLE]: "listContentPanelRaffle",
  [INTRO_AD_MODERATION_SECTION_USERS_RAFFLE]: "listContentPanelUsersRaffle",
};

export function resolveIntroAdModerationListPanelStyles(
  section: IntroAdModerationSectionZoneId | null | undefined,
  styles: IntroAdModerationListPanelStyles,
): StyleProp<ViewStyle & TextStyle>[] {
  if (!section) {
    return [styles.list];
  }

  return [styles.list, styles.listContentPanel, styles[LIST_PANEL_ZONE_STYLE_KEYS[section]]];
}

type IntroAdModerationOverviewStyles = {
  overviewTile: StyleProp<ViewStyle & TextStyle>;
  overviewTileIntro: StyleProp<ViewStyle & TextStyle>;
  overviewTileBanner: StyleProp<ViewStyle & TextStyle>;
  overviewTilePersonal: StyleProp<ViewStyle & TextStyle>;
  overviewTileRaffle: StyleProp<ViewStyle & TextStyle>;
  overviewTileUsersRaffle: StyleProp<ViewStyle & TextStyle>;
  overviewTileActive: StyleProp<ViewStyle & TextStyle>;
  overviewTileAttention: StyleProp<ViewStyle & TextStyle>;
};

const OVERVIEW_TILE_ZONE_STYLE_KEYS: Record<
  IntroAdModerationSectionZoneId,
  keyof IntroAdModerationOverviewStyles
> = {
  [INTRO_AD_MODERATION_SECTION_INTRO]: "overviewTileIntro",
  [INTRO_AD_MODERATION_SECTION_BANNER]: "overviewTileBanner",
  [INTRO_AD_MODERATION_SECTION_PERSONAL]: "overviewTilePersonal",
  [INTRO_AD_MODERATION_SECTION_RAFFLE]: "overviewTileRaffle",
  [INTRO_AD_MODERATION_SECTION_USERS_RAFFLE]: "overviewTileUsersRaffle",
};

export function resolveIntroAdModerationOverviewTileStyles(
  section: IntroAdModerationSectionZoneId | "attention" | null | undefined,
  styles: IntroAdModerationOverviewStyles,
  { active = false, attention = false } = {},
): StyleProp<ViewStyle & TextStyle>[] {
  const resolved: StyleProp<ViewStyle & TextStyle>[] = [styles.overviewTile];

  if (section && section !== "attention") {
    resolved.push(styles[OVERVIEW_TILE_ZONE_STYLE_KEYS[section]]);
  }

  if (active) {
    resolved.push(styles.overviewTileActive);
  }

  if (attention) {
    resolved.push(styles.overviewTileAttention);
  }

  return resolved;
}

type IntroAdModerationSectionChipStyles = {
  sectionChip: StyleProp<ViewStyle & TextStyle>;
  sectionChipActive: StyleProp<ViewStyle & TextStyle>;
  sectionChipIntro: StyleProp<ViewStyle & TextStyle>;
  sectionChipBanner: StyleProp<ViewStyle & TextStyle>;
  sectionChipPersonal: StyleProp<ViewStyle & TextStyle>;
  sectionChipRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipUsersRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipText: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextActive: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextIntro: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextBanner: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextPersonal: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextUsersRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipActiveIntro: StyleProp<ViewStyle & TextStyle>;
  sectionChipActiveBanner: StyleProp<ViewStyle & TextStyle>;
  sectionChipActivePersonal: StyleProp<ViewStyle & TextStyle>;
  sectionChipActiveRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipActiveUsersRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextActiveIntro: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextActiveBanner: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextActivePersonal: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextActiveRaffle: StyleProp<ViewStyle & TextStyle>;
  sectionChipTextActiveUsersRaffle: StyleProp<ViewStyle & TextStyle>;
};

const SECTION_CHIP_ZONE_STYLE_KEYS: Record<
  IntroAdModerationSectionZoneId,
  {
    chip: keyof IntroAdModerationSectionChipStyles;
    text: keyof IntroAdModerationSectionChipStyles;
    activeChip: keyof IntroAdModerationSectionChipStyles;
    activeText: keyof IntroAdModerationSectionChipStyles;
  }
> = {
  [INTRO_AD_MODERATION_SECTION_INTRO]: {
    chip: "sectionChipIntro",
    text: "sectionChipTextIntro",
    activeChip: "sectionChipActiveIntro",
    activeText: "sectionChipTextActiveIntro",
  },
  [INTRO_AD_MODERATION_SECTION_BANNER]: {
    chip: "sectionChipBanner",
    text: "sectionChipTextBanner",
    activeChip: "sectionChipActiveBanner",
    activeText: "sectionChipTextActiveBanner",
  },
  [INTRO_AD_MODERATION_SECTION_PERSONAL]: {
    chip: "sectionChipPersonal",
    text: "sectionChipTextPersonal",
    activeChip: "sectionChipActivePersonal",
    activeText: "sectionChipTextActivePersonal",
  },
  [INTRO_AD_MODERATION_SECTION_RAFFLE]: {
    chip: "sectionChipRaffle",
    text: "sectionChipTextRaffle",
    activeChip: "sectionChipActiveRaffle",
    activeText: "sectionChipTextActiveRaffle",
  },
  [INTRO_AD_MODERATION_SECTION_USERS_RAFFLE]: {
    chip: "sectionChipUsersRaffle",
    text: "sectionChipTextUsersRaffle",
    activeChip: "sectionChipActiveUsersRaffle",
    activeText: "sectionChipTextActiveUsersRaffle",
  },
};

export function resolveIntroAdModerationSectionChipStyles(
  sectionValue: string,
  isActive: boolean,
  styles: IntroAdModerationSectionChipStyles,
): { chip: StyleProp<ViewStyle & TextStyle>[]; text: StyleProp<ViewStyle & TextStyle>[] } {
  const chipStyles: StyleProp<ViewStyle & TextStyle>[] = [styles.sectionChip];
  const textStyles: StyleProp<ViewStyle & TextStyle>[] = [styles.sectionChipText];

  if (sectionValue) {
    const zoneStyles = SECTION_CHIP_ZONE_STYLE_KEYS[sectionValue as IntroAdModerationSectionZoneId];
    if (zoneStyles) {
      chipStyles.push(styles[zoneStyles.chip]);
      textStyles.push(styles[zoneStyles.text]);

      if (isActive) {
        chipStyles.push(styles[zoneStyles.activeChip]);
        textStyles.push(styles[zoneStyles.activeText]);
      }
    }
  }

  if (isActive && !sectionValue) {
    chipStyles.push(styles.sectionChipActive);
    textStyles.push(styles.sectionChipTextActive);
  }

  return { chip: chipStyles, text: textStyles };
}
