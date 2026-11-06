import {
  USER_SOCIAL_LINK_FIELDS,
  formatSocialLinkDisplay,
  isHttpUrl,
} from "@molha/api-contract";

/**
 * Порядок в окне «Соцсети и сайт» на витрине: сначала то, по чему покупатель
 * чаще всего пишет и смотрит товар. Паритет web `getSellerSocialLinks.js`.
 */
export const SELLER_SOCIAL_LINK_ORDER = [
  "socialInstagramUrl",
  "socialWhatsappUrl",
  "socialTelegramUrl",
  "socialYoutubeUrl",
  "socialVkUrl",
  "socialWebsiteUrl",
] as const;

export type SellerSocialLinkId = (typeof SELLER_SOCIAL_LINK_ORDER)[number];

export type SellerSocialLink = {
  id: SellerSocialLinkId;
  label: string;
  href: string;
  display: string;
};

type SocialField = { id: string; labelRu: string; placeholderRu: string };

const findField = (id: string): SocialField | undefined =>
  (USER_SOCIAL_LINK_FIELDS as readonly SocialField[]).find((item) => item.id === id);

/** Заполненные ссылки продавца для окна на витрине. */
export const getSellerSocialLinks = (
  user: Record<string, unknown> | null | undefined,
): SellerSocialLink[] => {
  if (!user) {
    return [];
  }
  return SELLER_SOCIAL_LINK_ORDER.flatMap((id) => {
    const raw = user[id];
    const href = typeof raw === "string" ? raw.trim() : "";
    // В профиле ссылки хранятся уже собранными; всё прочее (в том числе
    // `javascript:`) не открываем.
    if (!isHttpUrl(href)) {
      return [];
    }
    return [
      {
        id,
        label: findField(id)?.labelRu ?? id,
        href,
        display: formatSocialLinkDisplay(href),
      },
    ];
  });
};

/** Поля, которые продавец ещё не заполнил, — в том же порядке, что и ссылки. */
export const getMissingSellerSocialFields = (
  links: readonly { id: string }[],
): (SocialField & { id: SellerSocialLinkId })[] => {
  const filledIds = new Set(links.map((link) => link.id));
  return SELLER_SOCIAL_LINK_ORDER.filter((id) => !filledIds.has(id)).flatMap((id) => {
    const field = findField(id);
    return field ? [{ ...field, id }] : [];
  });
};
