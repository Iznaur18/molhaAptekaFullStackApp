/**
 * Отправляет ответ об ошибке в едином формате { message }.
 * @param {object} res - объект response Express
 * @param {number} status - HTTP-код статуса ответа
 * @param {string} message - текст ошибки для клиента
 */
export function errorRes(res, status, message) {
  return res.status(status).json({ message });
}
