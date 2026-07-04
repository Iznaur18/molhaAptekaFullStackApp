export const INTRO_AD_MODERATION_SECTION_ALL = "";
export const INTRO_AD_MODERATION_SECTION_INTRO = "intro";
export const INTRO_AD_MODERATION_SECTION_BANNER = "banner";
export const INTRO_AD_MODERATION_SECTION_PERSONAL = "personal";

/** @type {readonly string[]} */
export const INTRO_AD_MODERATION_SECTIONS = [
  INTRO_AD_MODERATION_SECTION_INTRO,
  INTRO_AD_MODERATION_SECTION_BANNER,
  INTRO_AD_MODERATION_SECTION_PERSONAL,
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
