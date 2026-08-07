import { formatApiErrorMessage } from "@izibuy/shared-lib";

/**
 * @param {unknown} error
 * @param {string} fallback
 */
export function resolveApiClientErrorMessage(error, fallback) {
  const code = error?.code;
  const message = error?.message;

  if (
    code === "ERR_NETWORK" ||
    message === "Network Error" ||
    message === "network error"
  ) {
    return "Не удалось связаться с API. Откройте сайт по http://127.0.0.1:5173 (не localhost), проверьте npm run start:dev в server и повторите.";
  }

  return formatApiErrorMessage(error, fallback);
}
