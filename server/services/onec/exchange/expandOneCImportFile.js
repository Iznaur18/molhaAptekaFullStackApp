import { open, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

import StreamZip from "node-stream-zip";

import {
  ONEC_EXCHANGE_MAX_FILES_PER_SESSION,
  ONEC_EXCHANGE_MAX_SESSION_BYTES,
  ONEC_IMPORT_KIND_CATALOG,
  ONEC_IMPORT_KIND_OFFERS,
  ONEC_IMPORT_KIND_UNKNOWN,
} from "../../../constants/onecExchangeConstants.js";
import { AppError } from "../../../errors/AppError.js";
import { resolveOneCFilePath, sanitizeOneCFilename } from "./receiveOneCFile.js";

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function isZipFile(filePath) {
  const handle = await open(filePath, "r");
  try {
    const head = Buffer.alloc(4);
    const { bytesRead } = await handle.read(head, 0, 4, 0);
    return bytesRead === 4 && head.equals(ZIP_MAGIC);
  } finally {
    await handle.close();
  }
}

/**
 * Что за файл прислала 1С.
 *
 * УТ 11 в CommerceML 2.08+ раскладывает выгрузку на четыре файла:
 * `import*.xml` (каталог), `offers*.xml`, `prices*.xml`, `rests*.xml`.
 * Последние три — один и тот же `ПакетПредложений`, просто с разным
 * наполнением, и разбираются одним парсером предложений.
 *
 * @param {string} filename
 * @returns {typeof ONEC_IMPORT_KIND_CATALOG | typeof ONEC_IMPORT_KIND_OFFERS | typeof ONEC_IMPORT_KIND_UNKNOWN}
 */
export function classifyOneCImportFile(filename) {
  const base = path.basename(String(filename ?? "")).toLowerCase();
  if (!base.endsWith(".xml")) return ONEC_IMPORT_KIND_UNKNOWN;
  if (base.startsWith("import")) return ONEC_IMPORT_KIND_CATALOG;
  if (
    base.startsWith("offers") ||
    base.startsWith("prices") ||
    base.startsWith("rests")
  ) {
    return ONEC_IMPORT_KIND_OFFERS;
  }
  return ONEC_IMPORT_KIND_UNKNOWN;
}

/**
 * Распаковать архив в подпапку сессии.
 *
 * Каждая запись проходит ту же санитизацию имени, что и `mode=file`: архив
 * пришёл извне, и `../` внутри него — классический zip-slip.
 *
 * @param {{ archivePath: string; targetDir: string }} params
 * @returns {Promise<string[]>} абсолютные пути распакованных файлов
 */
export async function extractOneCArchive({ archivePath, targetDir }) {
  await mkdir(targetDir, { recursive: true });
  const zip = new StreamZip.async({ file: archivePath });

  /** @type {string[]} */
  const extracted = [];
  try {
    const entries = await zip.entries();
    const rows = Object.values(entries);

    if (rows.length > ONEC_EXCHANGE_MAX_FILES_PER_SESSION) {
      throw new AppError(413, "В архиве обмена слишком много файлов");
    }

    let totalBytes = 0;
    for (const entry of rows) {
      if (entry.isDirectory) continue;
      totalBytes += entry.size;
      if (totalBytes > ONEC_EXCHANGE_MAX_SESSION_BYTES) {
        throw new AppError(413, "Распакованный архив обмена слишком большой");
      }
    }

    for (const entry of rows) {
      if (entry.isDirectory) continue;
      const relativeName = sanitizeOneCFilename(entry.name);
      const destination = resolveOneCFilePath(targetDir, relativeName);
      await mkdir(path.dirname(destination), { recursive: true });
      await zip.extract(entry.name, destination);
      extracted.push(destination);
    }
  } finally {
    await zip.close();
  }

  return extracted;
}

/**
 * Рекурсивный обход папки — картинки из `import_files/` лежат во вложенных
 * каталогах на два уровня.
 *
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
export async function listFilesRecursive(dir) {
  /** @type {string[]} */
  const out = [];
  /** @type {string[]} */
  const queue = [dir];

  while (queue.length > 0) {
    const current = queue.pop();
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(full);
        continue;
      }
      out.push(full);
    }
  }

  return out;
}

/**
 * Развернуть присланный `mode=import` файл в список XML для разбора.
 *
 * @param {{ filePath: string; filename: string; sessionDir: string }} params
 * @returns {Promise<{ xmlFiles: Array<{ filePath: string; filename: string; kind: string }>; rootDir: string }>}
 */
export async function expandOneCImportFile({
  filePath,
  filename,
  sessionDir,
}) {
  const info = await stat(filePath).catch(() => null);
  if (!info || !info.isFile() || info.size === 0) {
    throw new AppError(400, `Файл ${filename} не получен или пуст`);
  }

  if (!(await isZipFile(filePath))) {
    return {
      rootDir: path.dirname(filePath),
      xmlFiles: [
        {
          filePath,
          filename,
          kind: classifyOneCImportFile(filename),
        },
      ],
    };
  }

  // Распаковка живёт рядом с архивом, но в отдельной папке — иначе повторный
  // `mode=file` с тем же именем дописался бы в уже распакованный XML.
  const targetDir = resolveOneCFilePath(
    sessionDir,
    `__unzip/${path.basename(filename, path.extname(filename))}`,
  );
  const files = await extractOneCArchive({ archivePath: filePath, targetDir });

  const xmlFiles = files
    .map((extractedPath) => ({
      filePath: extractedPath,
      filename: path.relative(targetDir, extractedPath).replace(/\\/g, "/"),
      kind: classifyOneCImportFile(extractedPath),
    }))
    .filter((row) => row.kind !== ONEC_IMPORT_KIND_UNKNOWN);

  // Каталог обязан разобраться раньше предложений: цены и остатки ложатся
  // на карточки, которых до разбора `import.xml` ещё нет.
  xmlFiles.sort((a, b) =>
    a.kind === b.kind ? a.filename.localeCompare(b.filename) : a.kind === ONEC_IMPORT_KIND_CATALOG ? -1 : 1,
  );

  return { rootDir: targetDir, xmlFiles };
}
