import { successRes } from '../utils/index.js';

// обработчик успешной загрузки файла — отдаёт клиенту данные о файле.
export function uploadController(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не загружен или тип не разрешён (только jpeg/png)' });
  }
  // пример использования successRes: ответ будет { success: true, data: { url, filename, ... } }
  successRes(res, {
    url: '/uploads/',
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path
  });
}