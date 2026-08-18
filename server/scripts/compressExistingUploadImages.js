/**
 * Одноразовый бэкфил: перегнать уже залитые фото в server/uploads/ в WebP
 * (даунскейл + q80, тем же ядром, что и /upload) и переписать ссылки в Mongo
 * `.png/.jpg → .webp`. Чинит вес ТЕКУЩЕГО контента (новый код жмёт только новые
 * загрузки).
 *
 *   node scripts/compressExistingUploadImages.js            # dry-run (только отчёт)
 *   node scripts/compressExistingUploadImages.js --apply    # выполнить
 *
 * Безопасность:
 *   - Трогаем только файлы, на которые есть ссылка в БД (то, что реально
 *     отдаётся на сайте). Файлы-«сироты» без ссылок не конвертируем — лишь
 *     показываем в отчёте.
 *   - Приватные PII-файлы (uploads/private/*) НЕ сканируем (readdir без рекурсии).
 *   - --apply порядок: сначала пишем .webp, потом правим БД, оригинал удаляем
 *     последним — на любом сбое старый файл ещё на месте.
 *   - Замена в БД — по подстроке имени файла, поэтому работает для всех форм
 *     URL (относительный /uploads/.., https://gitorg.ru/.., CDN).
 */
import "dotenv/config";
import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import mongoose from "mongoose";

import { compressImageToWebp } from "../services/upload/compressImageBuffer.js";
import { UPLOADS_DIR } from "../services/upload/uploadsDir.js";

const CONVERTIBLE_EXT = new Set([".jpg", ".jpeg", ".png"]);
const isApply = process.argv.includes("--apply");

/**
 * @param {string} name
 */
function toWebpName(name) {
  return name.replace(/\.[^.]+$/i, ".webp");
}

/**
 * BSON-типы (ObjectId, Date, Decimal128, Buffer) — листья, внутрь не лезем.
 * @param {unknown} value
 */
function isLeafObject(value) {
  return (
    value instanceof Date ||
    Buffer.isBuffer(value) ||
    (value != null && typeof value === "object" && "_bsontype" in value)
  );
}

/**
 * Заменяет в строке имена сконвертированных файлов на .webp-варианты.
 * @param {string} str
 * @param {Map<string, string>} renameMap  oldBasename → newBasename
 * @returns {string}
 */
function rewriteString(str, renameMap) {
  if (!str.includes("/uploads/")) {
    return str;
  }
  let next = str;
  for (const [oldName, newName] of renameMap) {
    if (next.includes(oldName)) {
      next = next.split(oldName).join(newName);
    }
  }
  return next;
}

/**
 * Рекурсивно правит строковые листья документа на месте.
 * @param {unknown} node
 * @param {Map<string, string>} renameMap
 * @returns {boolean} были ли изменения
 */
function rewriteNode(node, renameMap) {
  if (!node || typeof node !== "object" || isLeafObject(node)) {
    return false;
  }

  let changed = false;
  const keys = Array.isArray(node)
    ? node.map((_, index) => index)
    : Object.keys(node);

  for (const key of keys) {
    const value = node[key];
    if (typeof value === "string") {
      const nextValue = rewriteString(value, renameMap);
      if (nextValue !== value) {
        node[key] = nextValue;
        changed = true;
      }
    } else if (value && typeof value === "object" && !isLeafObject(value)) {
      if (rewriteNode(value, renameMap)) {
        changed = true;
      }
    }
  }

  return changed;
}

/**
 * Собирает множество basename файлов uploads, упомянутых в строке.
 * @param {string} str
 * @param {Set<string>} out
 */
function collectReferencedNames(str, out) {
  const regex = /\/uploads\/(?:private\/)?([A-Za-z0-9._-]+\.[A-Za-z0-9]+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    out.add(match[1]);
  }
}

/**
 * @param {unknown} node
 * @param {Set<string>} out
 */
function collectNodeRefs(node, out) {
  if (!node || typeof node !== "object" || isLeafObject(node)) {
    return;
  }
  const values = Array.isArray(node) ? node : Object.values(node);
  for (const value of values) {
    if (typeof value === "string") {
      if (value.includes("/uploads/")) {
        collectReferencedNames(value, out);
      }
    } else if (value && typeof value === "object" && !isLeafObject(value)) {
      collectNodeRefs(value, out);
    }
  }
}

function formatMB(bytes) {
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

async function main() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI не задан в server/.env");
  }

  // 1. Файлы на диске (без рекурсии → private/ игнорируется).
  const entries = await readdir(UPLOADS_DIR, { withFileTypes: true });
  const diskImages = new Map(); // basename → { size }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!CONVERTIBLE_EXT.has(path.extname(entry.name).toLowerCase())) continue;
    const size = (await stat(path.join(UPLOADS_DIR, entry.name))).size;
    diskImages.set(entry.name, { size });
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    // 2. Все упомянутые в БД имена файлов uploads.
    const collections = await mongoose.connection.db.collections();
    const referenced = new Set();
    for (const collection of collections) {
      const cursor = collection.find({}, { readPreference: "primary" });
      for await (const doc of cursor) {
        collectNodeRefs(doc, referenced);
      }
    }

    // 3. Пересечение: конвертируемые файлы, на которые есть ссылка.
    const renameMap = new Map(); // oldBasename → newBasename
    let bytesBefore = 0;
    let bytesAfter = 0;
    const skippedNotSmaller = [];
    const missingOnDisk = [];

    for (const name of referenced) {
      if (!CONVERTIBLE_EXT.has(path.extname(name).toLowerCase())) continue;
      if (!diskImages.has(name)) {
        missingOnDisk.push(name);
        continue;
      }
      const filePath = path.join(UPLOADS_DIR, name);
      const input = await readFile(filePath);
      const output = await compressImageToWebp(input);
      if (!output) {
        skippedNotSmaller.push(name);
        continue;
      }
      renameMap.set(name, toWebpName(name));
      bytesBefore += input.length;
      bytesAfter += output.length;
    }

    // Файлы-сироты (на диске, но без ссылок в БД) — только для отчёта.
    const orphans = [...diskImages.keys()].filter((name) => !referenced.has(name));

    // 4. Отчёт.
    console.log(`Режим: ${isApply ? "APPLY" : "DRY-RUN"}`);
    console.log(`Файлов на диске (jpg/png): ${diskImages.size}`);
    console.log(`Упомянуто в БД (uploads): ${referenced.size}`);
    console.log(`К конвертации в WebP: ${renameMap.size}`);
    if (renameMap.size > 0) {
      const pct = bytesBefore > 0 ? (100 * (1 - bytesAfter / bytesBefore)).toFixed(1) : "0";
      console.log(`  вес: ${formatMB(bytesBefore)} → ${formatMB(bytesAfter)} (−${pct}%)`);
    }
    if (skippedNotSmaller.length > 0) {
      console.log(`Пропуск (WebP не легче): ${skippedNotSmaller.length}`);
    }
    if (missingOnDisk.length > 0) {
      console.log(`Ссылка в БД, но файла нет на диске: ${missingOnDisk.length}`);
      for (const name of missingOnDisk.slice(0, 10)) console.log(`  ! ${name}`);
    }
    if (orphans.length > 0) {
      console.log(`Сироты на диске (нет ссылок, не трогаем): ${orphans.length}`);
    }

    // Сколько документов в каждой коллекции будет затронуто.
    let totalDocsToUpdate = 0;
    const perCollection = [];
    if (renameMap.size > 0) {
      for (const collection of collections) {
        let count = 0;
        const cursor = collection.find({}, { readPreference: "primary" });
        for await (const doc of cursor) {
          if (rewriteNode(doc, renameMap)) {
            count += 1;
            if (isApply) {
              await collection.replaceOne({ _id: doc._id }, doc);
            }
          }
        }
        if (count > 0) {
          perCollection.push([collection.collectionName, count]);
          totalDocsToUpdate += count;
        }
      }
    }

    console.log(`\nДокументов ${isApply ? "обновлено" : "к обновлению"}: ${totalDocsToUpdate}`);
    for (const [name, count] of perCollection.sort((a, b) => b[1] - a[1])) {
      console.log(`  ${name}: ${count}`);
    }

    if (!isApply) {
      console.log("\nDry-run. Для выполнения добавьте --apply");
      return;
    }

    // 5. Пишем .webp, затем удаляем оригиналы (после успешной правки БД).
    let converted = 0;
    for (const [oldName, newName] of renameMap) {
      const oldPath = path.join(UPLOADS_DIR, oldName);
      const newPath = path.join(UPLOADS_DIR, newName);
      const output = await compressImageToWebp(await readFile(oldPath));
      if (!output) continue;
      await writeFile(newPath, output);
      if (newPath !== oldPath) {
        await unlink(oldPath).catch(() => {});
      }
      converted += 1;
    }
    console.log(`\nСконвертировано файлов: ${converted}`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
