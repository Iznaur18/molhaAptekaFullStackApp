/**
 * @param {unknown} error
 * @param {string} fallback
 */
export function resolveApiClientErrorMessage(error, fallback) {
  const responseMessage = error?.response?.data?.message;
  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage.trim();
  }

  const code = error?.code;
  const message = error?.message;

  if (
    code === "ERR_NETWORK" ||
    message === "Network Error" ||
    message === "network error"
  ) {
    return "Не удалось связаться с API. Откройте сайт по http://127.0.0.1:5173 (не localhost), проверьте npm run start:dev в server и повторите.";
  }

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return fallback;
}
