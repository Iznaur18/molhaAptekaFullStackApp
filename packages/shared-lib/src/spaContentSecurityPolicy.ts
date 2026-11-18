const SENTRY_INGEST_HOST_PATTERN = "https://*.ingest.sentry.io";
const PLAUSIBLE_ORIGIN = "https://plausible.io";

function parseHttpOrigin(raw: string | undefined | null): string | null {
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

function sentryConnectOriginsFromDsn(dsn: string | undefined | null): string[] {
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

function isPlausibleConfigured(options: {
  plausibleScriptSrc?: string | null;
  plausibleDomain?: string | null;
} = {}): boolean {
  const scriptSrc = String(
    options.plausibleScriptSrc ??
      (typeof process !== "undefined" ? process.env?.VITE_PLAUSIBLE_SCRIPT_SRC : "") ??
      "",
  ).trim();
  const domain = String(
    options.plausibleDomain ??
      (typeof process !== "undefined" ? process.env?.VITE_PLAUSIBLE_DOMAIN : "") ??
      "",
  ).trim();
  return scriptSrc.length > 0 || domain.length > 0;
}

export type SpaContentSecurityPolicyOptions = {
  frontendOrigin?: string | null;
  mediaOrigin?: string | null;
  apiOrigin?: string | null;
  sentryDsn?: string | null;
  plausibleScriptSrc?: string | null;
  plausibleDomain?: string | null;
  inlineScriptHashes?: string[];
  upgradeInsecureRequests?: boolean;
};

/**
 * CSP для HTML SPA (nginx / vite preview). Медиа с CDN — `PUBLIC_UPLOAD_BASE_URL`.
 * Pure: без зависимости от server/.
 */
export function buildSpaContentSecurityPolicy(
  options: SpaContentSecurityPolicyOptions = {},
): string {
  const env = typeof process !== "undefined" ? process.env : undefined;
  const frontendOrigin = parseHttpOrigin(
    options.frontendOrigin ?? env?.FRONTEND_URL,
  );
  const mediaOrigin = parseHttpOrigin(
    options.mediaOrigin ?? env?.PUBLIC_UPLOAD_BASE_URL,
  );
  const apiOrigin = parseHttpOrigin(options.apiOrigin ?? env?.VITE_API_URL);
  const sentryDsn = options.sentryDsn ?? env?.VITE_SENTRY_DSN ?? env?.SENTRY_DSN;

  const imgSources = new Set(["'self'", "data:", "blob:", "https:"]);
  const mediaSources = new Set(["'self'", "blob:", "https:"]);
  const connectSources = new Set(["'self'"]);
  const scriptSources = new Set(["'self'"]);

  for (const hash of options.inlineScriptHashes ?? []) {
    const value = String(hash ?? "").trim();
    if (value) {
      scriptSources.add(value);
    }
  }

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

  if (isPlausibleConfigured(options)) {
    const scriptOrigin =
      parseHttpOrigin(
        options.plausibleScriptSrc ?? env?.VITE_PLAUSIBLE_SCRIPT_SRC,
      ) ?? PLAUSIBLE_ORIGIN;
    scriptSources.add(scriptOrigin);
    connectSources.add(scriptOrigin);
  }

  const upgradeInsecure =
    options.upgradeInsecureRequests ?? Boolean(frontendOrigin?.startsWith("https:"));

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `script-src ${[...scriptSources].join(" ")}`,
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
