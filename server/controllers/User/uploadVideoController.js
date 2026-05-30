import { buildPublicUploadUrl } from '../../utils/buildPublicUploadUrl.js';
import { successRes, errorRes } from '../../utils/index.js';

export function uploadVideoController(req, res) {
  if (!req.file) {
    return errorRes(
      res,
      400,
      'Файл не загружен или тип не разрешён (только MP4, WebM)',
    );
  }

  const url = buildPublicUploadUrl({
    filename: req.file.filename,
  });

  successRes(res, {
    url,
    filename: req.file.filename,
    originalname: req.file.originalname,
  });
}
