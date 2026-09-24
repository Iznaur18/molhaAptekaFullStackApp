import { formatApiErrorMessage } from "@izibuy/shared-lib";
import { authLinkedAccountsDataSchema } from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";

/** `GET /auth/accounts` — активный и сохранённые аккаунты этого браузера. */
export async function fetchLinkedAccounts() {
  try {
    const { data } = await apiClient.get("/auth/accounts");
    return parseApiContractData(data, authLinkedAccountsDataSchema);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, ACCOUNT_SWITCHER_UI.ERROR_FALLBACK));
  }
}

/** `POST /auth/accounts/stash` — отложить текущий аккаунт перед входом в ещё один. */
export async function stashActiveAccount() {
  try {
    await apiClient.post("/auth/accounts/stash", {});
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, ACCOUNT_SWITCHER_UI.ERROR_FALLBACK));
  }
}

/** @param {string} userId */
export async function switchLinkedAccount(userId) {
  try {
    await apiClient.post("/auth/accounts/switch", { userId });
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, ACCOUNT_SWITCHER_UI.ERROR_FALLBACK));
  }
}

/**
 * @param {string} userId
 * @returns {Promise<{ removedActive: boolean }>}
 */
export async function removeLinkedAccount(userId) {
  try {
    const { data } = await apiClient.post("/auth/accounts/remove", { userId });
    return { removedActive: data?.data?.removedActive === true };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, ACCOUNT_SWITCHER_UI.ERROR_FALLBACK));
  }
}

export async function logoutAllLinkedAccounts() {
  try {
    await apiClient.post("/auth/accounts/logout-all", {});
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, ACCOUNT_SWITCHER_UI.ERROR_FALLBACK));
  }
}
