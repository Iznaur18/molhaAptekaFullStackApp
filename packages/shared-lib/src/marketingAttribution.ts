/**
 * Откуда пришёл пользователь: UTM-метки, click id рекламы и внешний реферер.
 *
 * Клиент хранит первое касание (не перезаписывается) и последнее (новые метки
 * перезаписывают, живёт 30 дней) и отправляет их при регистрации и заказе.
 * Сервер прогоняет входящие данные через тот же `sanitizeMarketingAttribution`.
 */

export const MARKETING_ATTRIBUTION_STORAGE_KEY = "gitorg_marketing_attribution";

/** Последнее касание старше 30 дней к заказу не привязывается. */
export const MARKETING_LAST_TOUCH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const MARKETING_TOUCH_FIELD_MAX = 100;
export const MARKETING_TOUCH_PATH_MAX = 200;

export const MARKETING_UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export const MARKETING_MEDIUM_CPC = "cpc";
export const MARKETING_MEDIUM_ORGANIC = "organic";
export const MARKETING_MEDIUM_REFERRAL = "referral";

export type MarketingTouch = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  clickId: string;
  referrerHost: string;
  landingPath: string;
  capturedAt: string;
};

export type MarketingAttribution = {
  firstTouch: MarketingTouch | null;
  lastTouch: MarketingTouch | null;
};

export type MarketingTouchSummary = {
  source: string;
  medium: string;
  campaign: string;
};

/** Поисковики: переход с них — органика, источник — имя поисковика. */
const SEARCH_ENGINE_HOSTS: ReadonlyArray<[RegExp, string]> = [
  [/(^|\.)yandex\.[a-z.]+$/, "yandex"],
  [/(^|\.)ya\.ru$/, "yandex"],
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)go\.mail\.ru$/, "mail.ru"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
];

const cleanText = (value: unknown, max = MARKETING_TOUCH_FIELD_MAX): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const cleanKey = (value: unknown): string => cleanText(value).toLowerCase();

const hostFromUrl = (url: string | undefined): string => {
  if (!url) {
    return "";
  }
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

const isOwnHost = (host: string, siteHosts: readonly string[]): boolean =>
  siteHosts.some((site) => {
    const normalized = site.toLowerCase().replace(/^www\./, "");
    return (
      normalized !== "" && (host === normalized || host.endsWith(`.${normalized}`))
    );
  });

const resolveSearchEngine = (host: string): string | null => {
  for (const [pattern, name] of SEARCH_ENGINE_HOSTS) {
    if (pattern.test(host)) {
      return name;
    }
  }
  return null;
};

/**
 * Касание из текущего захода. `null` — прямой заход или переход внутри сайта:
 * такое последнее касание не перезаписывает.
 */
export function readMarketingTouch(input: {
  search: string;
  referrer?: string;
  landingPath?: string;
  siteHosts?: readonly string[];
  now?: Date;
}): MarketingTouch | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(input.search ?? "");
  } catch {
    return null;
  }

  const utmSource = cleanKey(params.get("utm_source"));
  const utmMedium = cleanKey(params.get("utm_medium"));
  const utmCampaign = cleanKey(params.get("utm_campaign"));
  const utmContent = cleanText(params.get("utm_content"));
  const utmTerm = cleanText(params.get("utm_term"));
  const yclid = cleanText(params.get("yclid"));
  const gclid = cleanText(params.get("gclid"));
  const clickId = yclid || gclid;

  const referrerHost = hostFromUrl(input.referrer);
  const externalReferrer =
    referrerHost !== "" && !isOwnHost(referrerHost, input.siteHosts ?? []);

  const hasCampaign =
    utmSource !== "" || utmMedium !== "" || utmCampaign !== "" || clickId !== "";

  let source: string;
  let medium: string;
  if (hasCampaign) {
    source =
      utmSource ||
      (yclid
        ? "yandex"
        : gclid
          ? "google"
          : externalReferrer
            ? referrerHost
            : "unknown");
    medium = utmMedium || (clickId ? MARKETING_MEDIUM_CPC : "");
  } else if (externalReferrer) {
    const engine = resolveSearchEngine(referrerHost);
    source = engine ?? referrerHost;
    medium = engine ? MARKETING_MEDIUM_ORGANIC : MARKETING_MEDIUM_REFERRAL;
  } else {
    return null;
  }

  return {
    source: source.slice(0, MARKETING_TOUCH_FIELD_MAX),
    medium,
    campaign: utmCampaign,
    content: utmContent,
    term: utmTerm,
    clickId,
    referrerHost: externalReferrer
      ? referrerHost.slice(0, MARKETING_TOUCH_FIELD_MAX)
      : "",
    landingPath: cleanText(input.landingPath, MARKETING_TOUCH_PATH_MAX),
    capturedAt: (input.now ?? new Date()).toISOString(),
  };
}

const sanitizeTouch = (raw: unknown): MarketingTouch | null => {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const source = cleanKey(row.source);
  const capturedAtRaw = cleanText(row.capturedAt, 40);
  const capturedAtMs = Date.parse(capturedAtRaw);
  if (!source || !Number.isFinite(capturedAtMs)) {
    return null;
  }
  return {
    source,
    medium: cleanKey(row.medium),
    campaign: cleanKey(row.campaign),
    content: cleanText(row.content),
    term: cleanText(row.term),
    clickId: cleanText(row.clickId),
    referrerHost: cleanKey(row.referrerHost),
    landingPath: cleanText(row.landingPath, MARKETING_TOUCH_PATH_MAX),
    capturedAt: new Date(capturedAtMs).toISOString(),
  };
};

/** Проверка формы и длины полей; мусор превращается в `null`. */
export function sanitizeMarketingAttribution(
  raw: unknown,
): MarketingAttribution | null {
  if (raw == null || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const firstTouch = sanitizeTouch(row.firstTouch);
  const lastTouch = sanitizeTouch(row.lastTouch);
  if (!firstTouch && !lastTouch) {
    return null;
  }
  return { firstTouch, lastTouch };
}

/** Новое касание дополняет сохранённое: первое не меняется, последнее — да. */
export function mergeMarketingAttribution(
  stored: MarketingAttribution | null,
  touch: MarketingTouch | null,
): MarketingAttribution | null {
  const firstTouch = stored?.firstTouch ?? touch ?? null;
  const lastTouch = touch ?? stored?.lastTouch ?? null;
  if (!firstTouch && !lastTouch) {
    return null;
  }
  return { firstTouch, lastTouch };
}

/** Что отправить на сервер: последнее касание — только если ему меньше 30 дней. */
export function selectMarketingAttributionForSubmit(
  stored: unknown,
  now: Date = new Date(),
): MarketingAttribution | null {
  const clean = sanitizeMarketingAttribution(stored);
  if (!clean) {
    return null;
  }
  const lastTouch =
    clean.lastTouch &&
    now.getTime() - Date.parse(clean.lastTouch.capturedAt) <=
      MARKETING_LAST_TOUCH_TTL_MS
      ? clean.lastTouch
      : null;
  if (!clean.firstTouch && !lastTouch) {
    return null;
  }
  return { firstTouch: clean.firstTouch, lastTouch };
}

/** Короткая версия для событий аналитики и отчётов по каналам. */
export function summarizeMarketingTouch(
  touch: MarketingTouch | null | undefined,
): MarketingTouchSummary | null {
  if (!touch) {
    return null;
  }
  return { source: touch.source, medium: touch.medium, campaign: touch.campaign };
}
