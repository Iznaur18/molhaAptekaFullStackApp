import axios from 'axios';

import { API_BASE_URL } from '../config/apiBaseUrl.js';

const BEARER_PREFIX = 'Bearer';

/** Ключ в `localStorage` для JWT после логина (сервер: `Authorization: Bearer`). */
export const AUTH_TOKEN_STORAGE_KEY = 'rassro_auth_token';

export const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `${BEARER_PREFIX} ${token}`;
    }
  } catch {
    // storage недоступен (SSR / режим инкогнито с ограничениями)
  }
  return config;
});
