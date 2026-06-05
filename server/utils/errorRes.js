/**
 * Отправляет ответ об ошибке в едином формате { message }.
 * @param {object} res - объект response Express
 * @param {number} status - HTTP-код статуса ответа
 * @param {string} message - текст ошибки для клиента
 */
export function errorRes(res, status, message) {
  /** @type {{ message: string; requestId?: string }} */
  const payload = { message };
  if (res.locals?.requestId) {
    payload.requestId = res.locals.requestId;
  }
  return res.status(status).json(payload);
}
