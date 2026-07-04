export const INTRO_AD_MODERATION_SECTION_ALL = "";
export const INTRO_AD_MODERATION_SECTION_INTRO = "intro";
export const INTRO_AD_MODERATION_SECTION_BANNER = "banner";
export const INTRO_AD_MODERATION_SECTION_PERSONAL = "personal";

export const INTRO_AD_MODERATION_SECTIONS = [
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
] as const;

export const isIntroAdModerationSectionVisible = (sectionFilter: string, section: string) =>
  !sectionFilter || sectionFilter === section;

export const buildModerationCampaignRowId = (prefix: string, campaignId: string) =>
  `${prefix}:${campaignId}`;
