import {
  clearAuthTokens as clearStoredAuthTokens,
  getAccessToken as getStoredAccessToken,
  getRefreshToken as getStoredRefreshToken,
  setAuthTokens as setStoredAuthTokens,
} from "./authTokenStorage";

export const getAccessToken = async (): Promise<string | null> => getStoredAccessToken();

export const getRefreshToken = async (): Promise<string | null> => getStoredRefreshToken();

export const setAuthTokens = async (tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> => setStoredAuthTokens(tokens);

export const clearAuthTokens = async (): Promise<void> => clearStoredAuthTokens();

export { isCookieAuthWeb } from "./authTokenStorage";
