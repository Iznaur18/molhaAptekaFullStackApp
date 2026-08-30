import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import {
  ONEC_EXCHANGE_MAX_FILES_PER_SESSION,
  ONEC_EXCHANGE_MAX_FILE_BYTES,
  ONEC_EXCHANGE_MAX_SESSION_BYTES,
} from "../../../constants/onecExchangeConstants.js";
import { AppError } from "../../../errors/AppError.js";

/**
 * Имя файла приходит от 1С параметром запроса — это внешний ввод, и в нём
 * встречаются подкаталоги (`import_files/a1/b2.jpg`). Разрешаем относительный
 * путь, но только вниз от папки сессии.
 *
 * @param {unknown} raw
 * @returns {string} нормализованное относительное имя (через `/`)
 */
export function sanitizeOneCFilename(raw) {
  const value = String(raw ?? "").trim();
  if (!value) {
    throw new AppError(400, "Не указано имя файла");
  }
  if (value.includes("\0")) {
    throw new AppError(400, "Недопустимое имя файла");
  }

  const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
  const segments = [];
  for (const segment of normalized.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      throw new AppError(400, "Недопустимое имя файла");
    }
    // Windows-хост: двоеточие в сегменте — это попытка адресовать диск/ADS.
    if (segment.includes(":")) {
      throw new AppError(400, "Недопустимое имя файла");
    }
    segments.push(segment);
  }

  if (segments.length === 0 || segments.length > 16) {
    throw new AppError(400, "Недопустимое имя файла");
  }

  return segments.join("/");
}

/**
 * @param {string} uploadDir
 * @param {string} relativeName
 * @returns {string} абсолютный путь внутри папки сессии
 */
export function resolveOneCFilePath(uploadDir, relativeName) {
  const root = path.resolve(uploadDir);
  const target = path.resolve(root, relativeName);
  const withSeparator = root.endsWith(path.sep) ? root : root + path.sep;
  if (target !== root && !target.startsWith(withSeparator)) {
    throw new AppError(400, "Недопустимое имя файла");
  }
  return target;
}

/**
 * Принять очередной кусок файла от `mode=file`.
 *
 * 1С режет большие файлы по `file_limit` и досылает куски отдельными POST'ами
 * с тем же `filename` — поэтому пишем в режиме append, а не перезаписи.
 *
 * @param {{
 *   req: import('express').Request;
 *   session: import('mongoose').HydratedDocument<any>;
 *   filename: unknown;
 * }} params
 * @returns {Promise<{ filename: string; filePath: string; bytes: number; totalBytes: number }>}
 */
export async function receiveOneCFileChunk({ req, session, filename }) {
  const relativeName = sanitizeOneCFilename(filename);
  const filePath = resolveOneCFilePath(session.uploadDir, relativeName);

  const known = session.files.find((row) => row.filename === relativeName);
  if (!known && session.files.length >= ONEC_EXCHANGE_MAX_FILES_PER_SESSION) {
    throw new AppError(413, "Слишком много файлов в одной сессии обмена");
  }

  await mkdir(path.dirname(filePath), { recursive: true });

  const alreadyOnDisk = await stat(filePath).then(
    (info) => info.size,
    () => 0,
  );

  let written = 0;
  const remainingForFile = ONEC_EXCHANGE_MAX_FILE_BYTES - alreadyOnDisk;
  const remainingForSession =
    ONEC_EXCHANGE_MAX_SESSION_BYTES - session.totalBytes;
  const budget = Math.min(remainingForFile, remainingForSession);

  if (budget <= 0) {
    throw new AppError(413, "Превышен лимит объёма обмена");
  }

  const sink = createWriteStream(filePath, { flags: "a" });
  await pipeline(
    req,
    async function* guard(source) {
      for await (const chunk of source) {
        written += chunk.length;
        if (written > budget) {
          throw new AppError(413, "Превышен лимит объёма обмена");
        }
        yield chunk;
      }
    },
    sink,
  );

  if (known) {
    known.bytes += written;
    known.imported = false;
  } else {
    session.files.push({ filename: relativeName, bytes: written, imported: false });
  }
  session.totalBytes += written;
  await session.save();

  return {
    filename: relativeName,
    filePath,
    bytes: written,
    totalBytes: session.totalBytes,
  };
}
