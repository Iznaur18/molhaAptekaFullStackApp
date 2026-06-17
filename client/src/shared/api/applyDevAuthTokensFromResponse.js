import { persistDevAuthTokensFromResponse } from "./devAuthTokenStorage.js";

/**
 * @param {import('axios').AxiosResponse} response
 */
export const applyDevAuthTokensFromResponse = (response) => {
  persistDevAuthTokensFromResponse(response?.data?.data);
  return response;
};
