const DEV_ACCESS_TOKEN_KEY = "dev_access_token";
const DEV_REFRESH_TOKEN_KEY = "dev_refresh_token";

export const isDevBearerAuthEnabled = () => import.meta.env.DEV;

/**
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export const saveDevAuthTokens = (accessToken, refreshToken) => {
  if (!isDevBearerAuthEnabled()) {
    return;
  }
  try {
    sessionStorage.setItem(DEV_ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(DEV_REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // sessionStorage недоступен
  }
};

export const getDevAccessToken = () => {
  if (!isDevBearerAuthEnabled()) {
    return null;
  }
  try {
    const token = sessionStorage.getItem(DEV_ACCESS_TOKEN_KEY);
    return token?.trim() ? token.trim() : null;
  } catch {
    return null;
  }
};

export const getDevRefreshToken = () => {
  if (!isDevBearerAuthEnabled()) {
    return null;
  }
  try {
    const token = sessionStorage.getItem(DEV_REFRESH_TOKEN_KEY);
    return token?.trim() ? token.trim() : null;
  } catch {
    return null;
  }
};

export const clearDevAuthTokens = () => {
  try {
    sessionStorage.removeItem(DEV_ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(DEV_REFRESH_TOKEN_KEY);
  } catch {
    // sessionStorage недоступен
  }
};

/**
 * @param {unknown} authData
 */
export const persistDevAuthTokensFromResponse = (authData) => {
  if (!authData || typeof authData !== "object") {
    return;
  }
  const accessToken =
    "accessToken" in authData && typeof authData.accessToken === "string"
      ? authData.accessToken
      : null;
  const refreshToken =
    "refreshToken" in authData && typeof authData.refreshToken === "string"
      ? authData.refreshToken
      : null;
  if (accessToken && refreshToken) {
    saveDevAuthTokens(accessToken, refreshToken);
  }
};
