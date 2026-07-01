/**
 * @typedef {{
 *   id: string;
 *   enabled: boolean;
 *   imageUrl: string | null;
 *   imageAlt: string;
 *   linkPath: string | null;
 *   backgroundColor: string | null;
 * }} SiteHeaderBannerItem
 */

/**
 * @typedef {{
 *   enabled: boolean;
 *   items: SiteHeaderBannerItem[];
 *   updatedAt?: string | null;
 * }} SiteHeaderBannerSettings
 */

/**
 * @typedef {{
 *   id: string;
 *   imageUrl: string;
 *   imageAlt: string;
 *   linkPath: string | null;
 *   backgroundColor: string | null;
 * }} SiteHeaderBannerSlide
 */

export {};
