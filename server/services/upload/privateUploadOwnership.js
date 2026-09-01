import { AppError } from "../../errors/AppError.js";
import { PrivateUploadModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { parsePrivateUploadFilenameFromUrl } from "./privateUploadPaths.js";

/**
 * Запоминает, кто загрузил приватный файл.
 *
 * Не критично для самой загрузки: если запись не легла, файл всё равно
 * сохранён — просто сослаться на него в заявке потом не выйдет.
 *
 * @param {{ filename: string; uploaderId: string; purpose: string }} input
 */
export async function rememberPrivateUploadOwner({ filename, uploaderId, purpose }) {
  try {
    await PrivateUploadModel.create({ filename, uploaderId, purpose });
  } catch (error) {
    logServerEvent("error", {
      event: "private_upload_owner_not_saved",
      filename: String(filename),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * @param {string} userId
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
export async function isPrivateUploadOwnedBy(userId, filename) {
  if (!userId || !filename) return false;
  const row = await PrivateUploadModel.findOne({ filename })
    .select("uploaderId")
    .lean();
  return Boolean(row && String(row.uploaderId) === String(userId));
}

/**
 * Ссылка ведёт на приватный файл, загруженный кем-то другим?
 *
 * Публичные и пустые ссылки не «чужие»: там нечего защищать, и legacy-анкеты
 * с `/uploads/` должны продолжать работать.
 *
 * @param {string} userId
 * @param {string | null | undefined} url
 * @returns {Promise<boolean>}
 */
export async function isForeignPrivateUpload(userId, url) {
  const filename = parsePrivateUploadFilenameFromUrl(url);
  if (!filename) return false;
  return !(await isPrivateUploadOwnedBy(userId, filename));
}

/**
 * Проверяет, что все ссылки указывают на файлы, загруженные этим же
 * пользователем.
 *
 * @param {{ userId: string; urls: Array<string | null | undefined> }} input
 */
export async function assertPrivateUploadsOwnedBy({ userId, urls }) {
  for (const url of urls) {
    const filename = parsePrivateUploadFilenameFromUrl(url);
    if (!filename) {
      throw new AppError(400, "Загрузите файл заново");
    }
    if (!(await isPrivateUploadOwnedBy(userId, filename))) {
      throw new AppError(403, "Этот файл загружали не вы — загрузите свой");
    }
  }
}
