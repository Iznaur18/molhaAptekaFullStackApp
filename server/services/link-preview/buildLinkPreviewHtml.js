/**
 * @param {string} value
 */
export function escapeHtmlAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * @param {{
 *   title: string;
 *   description: string;
 *   url: string;
 *   imageUrl: string;
 *   siteName?: string;
 * }} params
 */
export function buildLinkPreviewHtml({
  title,
  description,
  url,
  imageUrl,
  siteName = "Gitorg",
}) {
  const safeTitle = escapeHtmlAttr(title);
  const safeDescription = escapeHtmlAttr(description);
  const safeUrl = escapeHtmlAttr(url);
  const safeImage = escapeHtmlAttr(imageUrl);
  const safeSite = escapeHtmlAttr(siteName);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${safeUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${safeSite}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:locale" content="ru_RU" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
</head>
<body>
  <p><a href="${safeUrl}">${safeTitle}</a></p>
</body>
</html>
`;
}
