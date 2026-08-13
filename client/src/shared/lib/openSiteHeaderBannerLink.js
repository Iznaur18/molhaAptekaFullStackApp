/**
 * @param {string | null | undefined} value
 */
export const isExternalHttpUrl = (value) => /^https?:\/\//i.test(String(value ?? "").trim());

/**
 * Bare host → https://…; relative path without leading / → /…
 * @param {string | null | undefined} linkPath
 * @returns {string | null}
 */
export const normalizeSiteHeaderBannerLink = (linkPath) => {
  const trimmed = String(linkPath ?? "").trim();
  if (!trimmed) {
    return null;
  }
  if (isExternalHttpUrl(trimmed)) {
    return trimmed;
  }
  if (/^(?:www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:[/:?#].*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

/**
 * @param {string | null | undefined} linkPath
 * @returns {string | null}
 */
export const resolveSiteHeaderBannerHref = (linkPath) =>
  normalizeSiteHeaderBannerLink(linkPath);

/**
 * External → new tab. Internal → return path for SPA navigate.
 * @param {string} linkPath
 * @returns {string | undefined}
 */
export const openSiteHeaderBannerLink = (linkPath) => {
  const normalized = normalizeSiteHeaderBannerLink(linkPath);
  if (!normalized) {
    return;
  }
  if (isExternalHttpUrl(normalized)) {
    window.open(normalized, "_blank", "noopener,noreferrer");
    return;
  }
  return normalized;
};
