/**
 * Адрес, который продавец вставляет в узел обмена 1С.
 *
 * Берём из `PUBLIC_API_BASE_URL` / первого значения `FRONTEND_URL`: 1С ходит
 * снаружи, и относительный путь ей ничего не скажет. Без настроенного адреса
 * отдаём только путь — в кабинете это видно как «допишите свой домен».
 */
export function buildOneCExchangeEndpointUrl() {
  const path = "/onec/exchange";

  const explicit =
    process.env.PUBLIC_API_BASE_URL?.trim() ||
    process.env.API_PUBLIC_URL?.trim() ||
    "";
  if (explicit) {
    return `${explicit.replace(/\/+$/, "")}${path}`;
  }

  const frontend = String(process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)[0];

  if (frontend) {
    return `${frontend.replace(/\/+$/, "")}${path}`;
  }

  return path;
}
