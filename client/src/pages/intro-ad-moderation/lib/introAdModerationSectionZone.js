/**
 * @param {string | null | undefined} section
 * @returns {string}
 */
export function buildIntroAdModerationZonePanelClass(section) {
  const classes = ["profile-queue-content-panel"];

  if (section) {
    classes.push(`profile-queue-content-panel--zone-${section}`);
  }

  return classes.join(" ");
}

/**
 * @param {string | null | undefined} section
 * @param {{ active?: boolean; attention?: boolean }} [options]
 * @returns {string}
 */
export function buildIntroAdModerationOverviewTileClass(
  section,
  { active = false, attention = false } = {},
) {
  return [
    "intro-ad-moderation-overview__tile",
    section ? `intro-ad-moderation-overview__tile_${section}` : "",
    active ? "intro-ad-moderation-overview__tile_active" : "",
    attention ? "intro-ad-moderation-overview__tile_attention" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * @param {string} sectionValue
 * @param {boolean} isActive
 * @returns {string}
 */
export function buildIntroAdModerationSectionChipClass(sectionValue, isActive) {
  return [
    "intro-ad-moderation-page__section-chip",
    isActive ? "intro-ad-moderation-page__section-chip_active" : "",
    sectionValue ? `intro-ad-moderation-page__section-chip_${sectionValue}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
