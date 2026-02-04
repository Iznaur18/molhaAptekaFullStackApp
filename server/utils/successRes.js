/**
 * Отправляет успешный ответ в едином формате { success: true, data }
 * @param {object} res - объект response Express
 * @param {*} data - данные для клиента
 * @param {number} status - HTTP-код (по умолчанию 200)
 */
export function successRes(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}
