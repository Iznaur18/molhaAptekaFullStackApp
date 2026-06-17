import { buildPublicUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../services/upload/finalizeUploadedFile.js";
import { prepareUploadedVideoFile } from "../../services/upload/prepareUploadedVideoFile.js";
import { successRes, errorRes } from "../../services/http/index.js";

export async function uploadVideoController(req, res) {
if (!req.file) {
      return errorRes(
        res,
        400,
        "Файл не загружен или тип не разрешён (только MP4, WebM, MOV, HEVC)",
      );
    }

    try {
      await prepareUploadedVideoFile(req.file);
    } catch (transcodeError) {
      console.error("uploadVideoController transcode error:", transcodeError);
      return errorRes(
        res,
        400,
        "Не удалось обработать видео. Загрузите MP4 (H.264) или короче 3 секунд",
      );
    }

    const filename = await finalizeUploadedFile(req.file);
    const url = buildPublicUploadUrl({ filename });

    return successRes(res, {
      url,
      filename,
      originalname: req.file.originalname,
    });
}
