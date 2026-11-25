/**
 * Фирменные цвета соцсетей (не тема light/dark/custom).
 * Web: SellerSocialLinksSheet.css / ProductInstagramPostMediaButton.css.
 * Mobile: SocialBrandIcon.tsx / catalogProductStyles Instagram CTA.
 */
export const izSocialBrandColors = {
  whatsapp: "#25d366",
  telegram: "#29a9eb",
  youtube: "#ff0033",
  vk: "#0077ff",
  /** Glyph на цветном бейдже. */
  onBrand: "#ffffff",
  /** Бейдж профиля: `linear-gradient(45deg, …)`. */
  instagramBadgeGradient: {
    start: "#f9a03f",
    mid: "#e1306c",
    end: "#833ab4",
  },
  /** Кнопка поста на медиа товара (чуть другие стопы, чем у badge). */
  instagramMediaGradient: {
    start: "#f58529",
    mid: "#dd2a7b",
    end: "#8134af",
  },
} as const;

/** Ключи полей продавца → solid fill бейджа (instagram — градиент). */
export const izSocialBrandBadgeSolidByFieldId = {
  socialWhatsappUrl: izSocialBrandColors.whatsapp,
  socialTelegramUrl: izSocialBrandColors.telegram,
  socialYoutubeUrl: izSocialBrandColors.youtube,
  socialVkUrl: izSocialBrandColors.vk,
} as const;

export type IzSocialBrandFieldId = keyof typeof izSocialBrandBadgeSolidByFieldId;
