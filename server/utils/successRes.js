/**
 * Отправляет успешный ответ в едином формате { success: true, data }
 * @param {object} res - объект response Express для отправки ответа
 * @param {*} data - данные для клиента, которые будут отправлены в ответе
 * @param {number} status - HTTP-код статуса ответа (по умолчанию 200)
 */
export function successRes(res, data, status = 200) { // функция отправляет успешный ответ в едином формате { success: true, data }
  return res.status(status).json({ success: true, data });
}
