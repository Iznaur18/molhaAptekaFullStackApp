import { PASSPORT_SELFIE_UPLOAD_PURPOSE } from "../../constants/privateUploadConstants.js";
import { buildPublicUploadUrl } from "../../services/upload/buildPublicUploadUrl.js";
import { finalizeUploadedFile } from "../../services/upload/finalizeUploadedFile.js";
import {
  buildPrivateUploadApiUrl,
  moveUploadFileToPrivateDir,
} from "../../services/upload/privateUploadPaths.js";
import {
  isObjectStorageUploadEnabled,
  persistPrivateUploadToObjectStorage,
} from "../../services/upload/objectStorageUpload.js";
import { successRes, errorRes } from "../../services/http/index.js";

/**
 * @param {import('express').Request} req
 */
function isPassportSelfieUpload(req) {
  return (
    String(req.query?.purpose ?? "").trim().toLowerCase() ===
    PASSPORT_SELFIE_UPLOAD_PURPOSE
  );
}

export async function uploadController(req, res) {
  if (!req.file) {
    return errorRes(
      res,
      400,
      "Файл не загружен или тип не разрешён (только JPEG, PNG, WebP)",
    );
  }

  const wantPrivate = isPassportSelfieUpload(req);

  if (wantPrivate) {
    const filename = isObjectStorageUploadEnabled()
      ? await persistPrivateUploadToObjectStorage(req.file)
      : await moveUploadFileToPrivateDir(await finalizeUploadedFile(req.file));

    return successRes(res, {
      url: buildPrivateUploadApiUrl(filename),
      filename,
      originalname: req.file.originalname,
      private: true,
    });
  }

  const filename = await finalizeUploadedFile(req.file);
  const url = buildPublicUploadUrl({ filename });
  return successRes(res, {
    url,
    filename,
    originalname: req.file.originalname,
  });
}
