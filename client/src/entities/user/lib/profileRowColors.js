/** @type {Record<string, string>} */
export const PROFILE_SECTION_TONES = {
  stats: "accent",
  identity: "accent",
  personal: "calm",
  account: "calm",
  other: "calm",
};

/**
 * @param {string} sectionId
 * @returns {string}
 */
export function getProfileSectionTone(sectionId) {
  return PROFILE_SECTION_TONES[sectionId] ?? "calm";
}
