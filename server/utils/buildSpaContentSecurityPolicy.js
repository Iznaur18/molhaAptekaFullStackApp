const SENTRY_INGEST_HOST_PATTERN = "https://*.ingest.sentry.io";

/**
 * @param {string | undefined | null} raw
 * @returns {string | null}
 */
function parseHttpOrigin(raw) {
  const value = String(raw ?? "").trim();
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * @param {string | undefined | null} dsn
 * @returns {string[]}
 */
function sentryConnectOriginsFromDsn(dsn) {
  const value = String(dsn ?? "").trim();
  if (!value) {
    return [];
  }

  try {
    return [new URL(value).origin];
  } catch {
    return [];
  }
}

/**
 * CSP для HTML SPA (nginx / vite preview). Медиа с CDN — `PUBLIC_UPLOAD_BASE_URL`.
 *
 * @param {{
 *   frontendOrigin?: string | null;
 *   mediaOrigin?: string | null;
 *   apiOrigin?: string | null;
 *   sentryDsn?: string | null;
 *   upgradeInsecureRequests?: boolean;
 * }} [options]
 * @returns {string}
 */
export function buildSpaContentSecurityPolicy(options = {}) {
  const frontendOrigin = parseHttpOrigin(
    options.frontendOrigin ?? process.env.FRONTEND_URL,
  );
  const mediaOrigin = parseHttpOrigin(
    options.mediaOrigin ?? process.env.PUBLIC_UPLOAD_BASE_URL,
  );
  const apiOrigin = parseHttpOrigin(options.apiOrigin ?? process.env.VITE_API_URL);
  const sentryDsn =
    options.sentryDsn ?? process.env.VITE_SENTRY_DSN ?? process.env.SENTRY_DSN;

  const imgSources = new Set(["'self'", "data:", "blob:", "https:"]);
  const mediaSources = new Set(["'self'", "blob:", "https:"]);
  const connectSources = new Set(["'self'"]);

  if (mediaOrigin && mediaOrigin !== frontendOrigin) {
    imgSources.add(mediaOrigin);
    mediaSources.add(mediaOrigin);
  }

  if (apiOrigin && apiOrigin !== frontendOrigin) {
    connectSources.add(apiOrigin);
  }

  for (const origin of sentryConnectOriginsFromDsn(sentryDsn)) {
    connectSources.add(origin);
  }
  connectSources.add(SENTRY_INGEST_HOST_PATTERN);

  const upgradeInsecure =
    options.upgradeInsecureRequests ?? Boolean(frontendOrigin?.startsWith("https:"));

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${[...imgSources].join(" ")}`,
    `media-src ${[...mediaSources].join(" ")}`,
    "font-src 'self' data:",
    `connect-src ${[...connectSources].join(" ")}`,
    "frame-ancestors 'self'",
    "form-action 'self'",
  ];

  if (upgradeInsecure) {
    directives.push("upgrade-insecure-requests");
  }

  return `${directives.join("; ")};`;
}
