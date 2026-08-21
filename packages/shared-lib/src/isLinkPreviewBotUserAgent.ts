/**
 * User-Agent crawler’ов, которые читают Open Graph для превью ссылок
 * (WhatsApp, Telegram, VK, Facebook, …).
 */
const LINK_PREVIEW_BOT_UA_RE =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|SkypeUriPreview|vkShare|VKRobot|Pinterest|redditbot|Embedly|Quora Link Preview|Showyoubot|outbrain|Googlebot|bingbot|YandexBot|DuckDuckBot|Baiduspider|Applebot|SemrushBot|developers\.google\.com\/\+\/web\/snippet/i;

/**
 * @param {string | null | undefined} userAgent
 */
export function isLinkPreviewBotUserAgent(
  userAgent: string | null | undefined = undefined,
): boolean {
  return LINK_PREVIEW_BOT_UA_RE.test(String(userAgent ?? ""));
}
