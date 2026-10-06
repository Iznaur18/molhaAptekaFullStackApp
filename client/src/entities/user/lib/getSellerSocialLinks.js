import {
  USER_SOCIAL_LINK_FIELDS,
  formatSocialLinkDisplay,
  isHttpUrl,
} from "@molha/api-contract";

/**
 * Порядок в окне «Соцсети и сайт» на витрине: сначала то, по чему покупатель
 * чаще всего пишет и смотрит товар.
 */
const SELLER_SOCIAL_LINK_ORDER = [
  "socialInstagramUrl",
  "socialWhatsappUrl",
  "socialTelegramUrl",
  "socialYoutubeUrl",
  "socialVkUrl",
  "socialWebsiteUrl",
];

/**
 * Поля, которые продавец ещё не заполнил, — в том же порядке, что и ссылки.
 *
 * @param {{ id: string }[]} links
 * @returns {{ id: string; labelRu: string; placeholderRu: string }[]}
 */
export function getMissingSellerSocialFields(links) {
  const filledIds = new Set(links.map((link) => link.id));
  return SELLER_SOCIAL_LINK_ORDER.filter((id) => !filledIds.has(id)).flatMap((id) => {
    const field = USER_SOCIAL_LINK_FIELDS.find((item) => item.id === id);
    return field ? [field] : [];
  });
}

/**
 * Заполненные ссылки продавца для окна на витрине.
 *
 * @param {Record<string, unknown> | null | undefined} user
 * @returns {{ id: string; label: string; href: string; display: string }[]}
 */
export function getSellerSocialLinks(user) {
  if (!user) {
    return [];
  }

  return SELLER_SOCIAL_LINK_ORDER.flatMap((id) => {
    const raw = user[id];
    const href = typeof raw === "string" ? raw.trim() : "";
    // В профиле ссылки хранятся уже собранными; всё прочее (в том числе
    // `javascript:`) в `href` не пускаем.
    if (!isHttpUrl(href)) {
      return [];
    }
    const field = USER_SOCIAL_LINK_FIELDS.find((item) => item.id === id);
    return [
      {
        id,
        label: field?.labelRu ?? id,
        href,
        display: formatSocialLinkDisplay(href),
      },
    ];
  });
}
