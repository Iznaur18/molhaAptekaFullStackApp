const API_BASE = "http://127.0.0.1:4444";

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string; password: string }} credentials
 */
export async function loginAndGetCookieHeader(request, { email, password }) {
  const response = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(`login failed: ${response.status()} ${await response.text()}`);
  }

  const setCookie = response.headers()["set-cookie"];
  if (!setCookie) {
    throw new Error("login: missing set-cookie");
  }

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  return cookies.map((chunk) => chunk.split(";")[0]).join("; ");
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
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ email: string; password: string }} credentials
 */
export async function loginViaApiCookies(page, request, credentials) {
  const cookieHeader = await loginAndGetCookieHeader(request, credentials);
  await page.context().addCookies(parseCookieHeaderForPlaywright(cookieHeader));
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
