import { buildPublicUploadUrl } from "../../utils/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../utils/finalizeUploadedFile.js";
import { successRes, errorRes } from "../../utils/index.js";

export async function uploadVideoController(req, res) {
  try {
    if (!req.file) {
      return errorRes(
        res,
        400,
        "Файл не загружен или тип не разрешён (только MP4, WebM, MOV, HEVC)",
      );
    }

    const filename = await finalizeUploadedFile(req.file);
    const url = buildPublicUploadUrl({ filename });

    return successRes(res, {
      url,
      filename,
      originalname: req.file.originalname,
    });
  } catch (error) {
    console.error("uploadVideoController error:", error);
    return errorRes(res, 500, "Не удалось сохранить файл");
  }
}
