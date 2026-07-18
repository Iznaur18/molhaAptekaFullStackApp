/**
 * Отправляет ответ об ошибке в едином формате { message }.
 * @param {object} res - объект response Express
 * @param {number} status - HTTP-код статуса ответа
 * @param {string} message - текст ошибки для клиента
 * @param {Record<string, unknown>} [extra] - доп. поля в JSON (например pendingToken)
 */
export function errorRes(res, status, message, extra) {
  /** @type {{ message: string; requestId?: string } & Record<string, unknown>} */
  const payload = { message };
  if (extra && typeof extra === "object") {
    Object.assign(payload, extra);
  }
  if (res.locals?.requestId) {
    payload.requestId = res.locals.requestId;
  }
  return res.status(status).json(payload);
}
