import axios from "axios";

import { API_BASE_URL } from "../config/apiBaseUrl.js";

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/** Удаляет legacy JWT из localStorage после перехода на httpOnly cookie. */
export const clearLegacyAuthTokenStorage = () => {
  try {
    localStorage.removeItem("rassro_auth_token");
  } catch {
    // storage недоступен
  }
};

clearLegacyAuthTokenStorage();
