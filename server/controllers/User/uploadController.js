import { buildPublicUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../services/upload/finalizeUploadedFile.js";
import { successRes, errorRes } from "../../services/http/index.js";

export async function uploadController(req, res) {
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
}
