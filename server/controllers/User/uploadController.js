import { successRes, errorRes } from '../../utils/index.js';

// обработчик успешной загрузки файла — отдаёт клиенту данные о файле.
export function uploadController(req, res) {
  if (!req.file) { // если файл не загружен или тип не разрешен (только jpeg/png)
    return errorRes(res, 400, 'Файл не загружен или тип не разрешён (только jpeg/png)');
  }
  // пример использования successRes: ответ будет { success: true, data: { url, filename, ... } }
  successRes(res, { // отправляем данные о файле
    url: '/uploads/' + req.file.filename, // URL файла в формате /uploads/<filename>
    filename: req.file.filename, // имя файла
    originalname: req.file.originalname, // оригинальное имя файла
    // path: req.file.path // путь к файлу. Не отправляем путь к файлу, чтобы не было утечки информации о файловой системе
  });
}