import { existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

import {
  ONEC_IMPORT_KIND_UNKNOWN,
} from "../../../constants/onecExchangeConstants.js";
import {
  classifyOneCImportFile,
  extractOneCArchive,
  isZipFile,
  listFilesRecursive,
} from "./expandOneCImportFile.js";
import { resolveOneCFilePath, sanitizeOneCFilename } from "./receiveOneCFile.js";

/**
 * Куда 1С распаковывает архив сессии. Отдельная папка на архив, иначе повторный
 * `mode=file` с тем же именем дописался бы в уже распакованный XML.
 *
 * @param {string} sessionDir
 * @param {string} archiveName
 */
function archiveExtractDir(sessionDir, archiveName) {
  const base = path
    .basename(archiveName, path.extname(archiveName))
    .replace(/[^\w.-]/g, "_");
  return resolveOneCFilePath(sessionDir, `__unzip/${base}`);
}

/** @param {string} filePath */
async function isExistingFile(filePath) {
  const info = await stat(filePath).catch(() => null);
  return Boolean(info?.isFile());
}

/**
 * Найти XML, который 1С просит импортировать.
 *
 * Ключевая тонкость протокола, которую видно только на живой 1С: при `zip=yes`
 * архив заливается под временным именем (`v8_E902_1f.zip`), а `mode=import`
 * приходит с именем файла **внутри** архива (`import0_1.xml`). Поэтому имя из
 * `mode=import` сопоставляется не с загруженными файлами, а с содержимым
 * присланных архивов.
 *
 * Возвращает и `rootDir` — от него разрешаются пути картинок `import_files/…`.
 *
 * @param {{
 *   session: { uploadDir: string; files: Array<{ filename: string }> };
 *   filename: string;
 * }} params
 * @returns {Promise<{
 *   filePath: string;
 *   filename: string;
 *   kind: string;
 *   rootDirs: string[];
 * }>}
 */
export async function resolveOneCImportTarget({ session, filename }) {
  const relativeName = sanitizeOneCFilename(filename);
  const sessionDir = session.uploadDir;

  /** Корни, в которых потом ищутся картинки: сама папка сессии + распаковки. */
  const rootDirs = [sessionDir];

  // 1. Файл прислали как есть (`zip=no` либо 1С назвала архив тем же именем).
  const direct = resolveOneCFilePath(sessionDir, relativeName);
  if (await isExistingFile(direct)) {
    if (!(await isZipFile(direct))) {
      return {
        filePath: direct,
        filename: relativeName,
        kind: classifyOneCImportFile(relativeName),
        rootDirs,
      };
    }

    // Архив под собственным именем: распаковываем и берём из него первый XML,
    // который вообще имеет смысл разбирать.
    const dir = archiveExtractDir(sessionDir, relativeName);
    await extractOneCArchive({ archivePath: direct, targetDir: dir });
    rootDirs.push(dir);

    const inner = (await listFilesRecursive(dir))
      .map((full) => ({ full, kind: classifyOneCImportFile(full) }))
      .filter((row) => row.kind !== ONEC_IMPORT_KIND_UNKNOWN)
      .sort((a, b) => a.full.localeCompare(b.full));

    if (inner.length > 0) {
      return {
        filePath: inner[0].full,
        filename: path.relative(dir, inner[0].full).replace(/\\/g, "/"),
        kind: inner[0].kind,
        rootDirs,
      };
    }
  }

  // 2. Штатный путь живой 1С: имя относится к содержимому одного из архивов.
  for (const row of session.files) {
    const archivePath = resolveOneCFilePath(sessionDir, row.filename);
    if (!(await isExistingFile(archivePath))) continue;
    if (!(await isZipFile(archivePath))) continue;

    const dir = archiveExtractDir(sessionDir, row.filename);
    // Повторная распаковка дешевле, чем хранить состояние: 1С зовёт import
    // по разу на файл, а архивы порционной выгрузки небольшие.
    await extractOneCArchive({ archivePath, targetDir: dir });
    rootDirs.push(dir);

    const candidate = resolveOneCFilePath(dir, relativeName);
    if (await isExistingFile(candidate)) {
      return {
        filePath: candidate,
        filename: relativeName,
        kind: classifyOneCImportFile(relativeName),
        rootDirs,
      };
    }

    // 1С иногда просит файл по имени без вложенных папок, а внутри архива он
    // лежит глубже — ищем по базовому имени.
    const base = path.basename(relativeName).toLowerCase();
    const found = (await listFilesRecursive(dir)).find(
      (full) => path.basename(full).toLowerCase() === base,
    );
    if (found) {
      return {
        filePath: found,
        filename: relativeName,
        kind: classifyOneCImportFile(relativeName),
        rootDirs,
      };
    }
  }

  throw new Error(
    `Файл ${relativeName} не найден ни среди присланных, ни внутри архивов сессии`,
  );
}

/**
 * Картинки `import_files/…` могут лежать в другой порции архива, чем сам
 * каталог, поэтому ищем во всех распакованных корнях сессии, а не в одном.
 *
 * @param {string[]} rootDirs
 * @returns {(relativePath: string) => string | null}
 */
export function createMultiRootImageResolver(rootDirs) {
  const roots = [...new Set(rootDirs)];

  return (relativePath) => {
    const normalized = String(relativePath ?? "")
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");
    if (!normalized || normalized.split("/").includes("..")) return null;

    for (const root of roots) {
      let resolved;
      try {
        resolved = resolveOneCFilePath(root, normalized);
      } catch {
        continue;
      }
      if (existsSync(resolved)) return resolved;
    }
    return null;
  };
}
