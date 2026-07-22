export const INTRO_AD_MODERATION_SECTION_ALL = "";
export const INTRO_AD_MODERATION_SECTION_INTRO = "intro";
export const INTRO_AD_MODERATION_SECTION_BANNER = "banner";
export const INTRO_AD_MODERATION_SECTION_PERSONAL = "personal";
export const INTRO_AD_MODERATION_SECTION_RAFFLE = "raffle";
export const INTRO_AD_MODERATION_SECTION_USERS_RAFFLE = "users-raffle";

/** @type {readonly string[]} */
export const INTRO_AD_MODERATION_SECTIONS = [
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
  INTRO_AD_MODERATION_SECTION_RAFFLE,
  INTRO_AD_MODERATION_SECTION_USERS_RAFFLE,
];

/**
 * @param {string} sectionFilter
 * @param {string} section
 */
export function isIntroAdModerationSectionVisible(sectionFilter, section) {
  return !sectionFilter || sectionFilter === section;
}

/**
 * @param {string} prefix
 * @param {string} campaignId
 */
export function buildModerationCampaignRowId(prefix, campaignId) {
  return `${prefix}:${campaignId}`;
}
