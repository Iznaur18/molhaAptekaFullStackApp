import { buildPublicUploadUrl } from "../../utils/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../utils/finalizeUploadedFile.js";
import { successRes, errorRes } from "../../utils/index.js";

export async function uploadController(req, res) {
  try {
    if (!req.file) {
      return errorRes(
        res,
        400,
        "Файл не загружен или тип не разрешён (только JPEG, PNG, WebP)",
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
    console.error("uploadController error:", error);
    return errorRes(res, 500, "Не удалось сохранить файл");
  }
}
