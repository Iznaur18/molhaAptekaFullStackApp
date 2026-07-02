/**
 * @param {string | null | undefined} value
 */
export const isExternalHttpUrl = (value) => /^https?:\/\//i.test(String(value ?? "").trim());

/**
 * @param {string} linkPath
 */
export const openSiteHeaderBannerLink = (linkPath) => {
  const trimmed = String(linkPath).trim();
  if (!trimmed) {
    return;
  }
  if (isExternalHttpUrl(trimmed)) {
    window.location.assign(trimmed);
    return;
  }
  return trimmed;
};
