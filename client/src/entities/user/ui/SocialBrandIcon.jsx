/**
 * Значки соцсетей одной линией. В lucide-react фирменных значков нет, поэтому
 * рисуем сами — в той же сетке 24×24 и с той же обводкой, что у остальных.
 */
const SOCIAL_BRAND_ICON_PATHS = {
  socialInstagramUrl: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </>
  ),
  socialWhatsappUrl: (
    <>
      <path d="M3 21l1.7-4.6A8.5 8.5 0 1 1 8 19.6L3 21z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-0.9 0.9c-1-0.5-1.9-1.4-2.4-2.4l0.9-0.9-1-2L9 8.5z" />
    </>
  ),
  socialTelegramUrl: (
    <>
      <path d="M21 4L3 11l6 2.2L11 20l3.2-4.4L19 19l2-15z" />
      <path d="M9 13.2L21 4" />
    </>
  ),
  socialYoutubeUrl: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2v5.6l5-2.8-5-2.8z" />
    </>
  ),
  socialVkUrl: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M7 9c0.4 3.4 2.3 6 5.4 6V9" />
      <path d="M17 9c-0.6 1.8-2.2 3-4.6 3 2.4 0 4 1.2 4.9 3" />
    </>
  ),
  socialWebsiteUrl: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9s1.3-6.5 3.9-9z" />
    </>
  ),
};

/**
 * @param {{
 *   id: string;
 *   size?: number;
 *   strokeWidth?: number;
 *   className?: string;
 * }} props
 */
export function SocialBrandIcon({ id, size = 20, strokeWidth = 2.1, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {SOCIAL_BRAND_ICON_PATHS[id] ?? SOCIAL_BRAND_ICON_PATHS.socialWebsiteUrl}
    </svg>
  );
}
