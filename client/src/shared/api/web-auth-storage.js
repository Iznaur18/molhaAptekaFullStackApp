import {
  clearDevAuthTokens,
  getDevAccessToken,
  getDevRefreshToken,
  isDevBearerAuthEnabled,
} from "./devAuthTokenStorage.js";

export const isBearerAuthEnabled = () => isDevBearerAuthEnabled();

export const getAccessToken = () => getDevAccessToken();

export const getRefreshToken = () => getDevRefreshToken();

export const clearAuthTokens = () => {
  clearDevAuthTokens();
};
