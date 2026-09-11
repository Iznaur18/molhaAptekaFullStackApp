import { E2E_API_ORIGIN, E2E_CLIENT_ORIGIN } from "./urls.js";

const API_BASE = E2E_API_ORIGIN;

/**
 * Мутации с cookie-сессией сервер пропускает только с Origin из FRONTEND_URL
 * (csrfCookieOriginCheckMW). Браузер шлёт Origin сам, а APIRequestContext
 * Playwright — нет: без этого заголовка PUT /cart получал 403 «Запрос
 * отклонён (origin)», и E2E падал на подготовке данных, не дойдя до UI.
 */
const BROWSER_ORIGIN_HEADERS = { Origin: E2E_CLIENT_ORIGIN };

const DEV_ACCESS_TOKEN_KEY = "dev_access_token";
const DEV_REFRESH_TOKEN_KEY = "dev_refresh_token";

/**
 * @param {import('@playwright/test').APIResponse} response
 */
function readCookieHeaderFromLoginResponse(response) {
  const setCookie = response.headers()["set-cookie"];
  if (!setCookie) {
    throw new Error("login: missing set-cookie");
  }

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((chunk) => chunk.split(";")[0]).join("; ");
}

/**
 * @param {unknown} authData
 */
function readDevAuthTokensFromLoginBody(authData) {
  if (!authData || typeof authData !== "object") {
    return { accessToken: null, refreshToken: null };
  }

  const accessToken =
    "accessToken" in authData && typeof authData.accessToken === "string"
      ? authData.accessToken
      : null;
  const refreshToken =
    "refreshToken" in authData && typeof authData.refreshToken === "string"
      ? authData.refreshToken
      : null;

  return { accessToken, refreshToken };
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string; password: string }} credentials
 */
export async function loginAndGetAuthSession(request, credentials) {
  const response = await request.post(`${API_BASE}/auth/login`, {
    headers: BROWSER_ORIGIN_HEADERS,
    data: credentials,
  });
  if (!response.ok()) {
    throw new Error(`login failed: ${response.status()} ${await response.text()}`);
  }

  const body = await response.json();
  const { accessToken, refreshToken } = readDevAuthTokensFromLoginBody(body?.data);

  return {
    cookieHeader: readCookieHeaderFromLoginResponse(response),
    accessToken,
    refreshToken,
  };
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string; password: string }} credentials
 */
export async function loginAndGetCookieHeader(request, credentials) {
  const session = await loginAndGetAuthSession(request, credentials);
  return session.cookieHeader;
}

/**
 * @param {string} cookieHeader
 */
export function parseCookieHeaderForPlaywright(cookieHeader) {
  return cookieHeader.split("; ").map((chunk) => {
    const separatorIndex = chunk.indexOf("=");
    const name = chunk.slice(0, separatorIndex);
    const value = chunk.slice(separatorIndex + 1);

    return {
      name,
      value,
      domain: "127.0.0.1",
      path: "/",
    };
  });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ accessToken: string | null; refreshToken: string | null }} tokens
 */
export async function applyDevAuthTokensToPage(page, { accessToken, refreshToken }) {
  if (!accessToken || !refreshToken) {
    return;
  }

  await page.addInitScript(
    ([accessKey, refreshKey, nextAccessToken, nextRefreshToken]) => {
      sessionStorage.setItem(accessKey, nextAccessToken);
      sessionStorage.setItem(refreshKey, nextRefreshToken);
    },
    [DEV_ACCESS_TOKEN_KEY, DEV_REFRESH_TOKEN_KEY, accessToken, refreshToken],
  );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string; password: string }} credentials
 */
export async function loginViaApiCookies(page, request, credentials) {
  const session = await loginAndGetAuthSession(request, credentials);
  await page.context().addCookies(parseCookieHeaderForPlaywright(session.cookieHeader));
  await applyDevAuthTokensToPage(page, session);
}

/**
 * Забирает дневную скидку «за возвращение», как это сделал бы покупатель.
 *
 * Пока скидка не забрана, внизу экрана висит fixed-плашка на ~220px и
 * перекрывает кнопки страницы (например «Оформить» в корзине) — Playwright
 * не может по ним кликнуть. 409 значит «сегодня уже забрали», это нормально.
 *
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} cookieHeader
 */
export async function claimPromoReturnStreak(request, cookieHeader) {
  const response = await request.post(`${API_BASE}/user/me/promo-return-streak/claim`, {
    headers: { ...BROWSER_ORIGIN_HEADERS, Cookie: cookieHeader },
  });
  if (!response.ok() && response.status() !== 409) {
    throw new Error(
      `POST /user/me/promo-return-streak/claim failed: ${response.status()} ${await response.text()}`,
    );
  }
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} cookieHeader
 */
export async function replaceCartItems(request, cookieHeader, items = {}) {
  const response = await request.put(`${API_BASE}/cart`, {
    headers: { ...BROWSER_ORIGIN_HEADERS, Cookie: cookieHeader },
    data: { items },
  });
  if (!response.ok()) {
    throw new Error(`PUT /cart failed: ${response.status()} ${await response.text()}`);
  }
}
