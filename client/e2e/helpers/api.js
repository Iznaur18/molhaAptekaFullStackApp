const API_BASE = "http://127.0.0.1:4444";

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
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {string} cookieHeader
 */
export async function replaceCartItems(request, cookieHeader, items = {}) {
  const response = await request.put(`${API_BASE}/cart`, {
    headers: { Cookie: cookieHeader },
    data: { items },
  });
  if (!response.ok()) {
    throw new Error(`PUT /cart failed: ${response.status()} ${await response.text()}`);
  }
}
