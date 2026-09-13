/**
 * Одноразовый бэкфил: превью 600 px для фото, загруженных до появления превью.
 *
 *   node scripts/backfillUploadImageThumbnails.js                          # dry-run (только отчёт)
 *   node scripts/backfillUploadImageThumbnails.js --apply                  # создать превью
 *   node scripts/backfillUploadImageThumbnails.js --apply --limit=500 --pause-ms=20
 *
 * Зачем. Лента показывала фото до 1600 px в ячейке ~200 pt, и iPhone декодировал
 * каждое целиком (до ~10 МБ памяти на картинку) — при долгой прокрутке лента
 * подвисала. Новые загрузки получают `<имя>-w600.webp` сразу; этот скрипт
 * догоняет старые. Пока превью нет, клиент показывает оригинал.
 *
 * Безопасность:
 *   - Только диск (UPLOAD_STORAGE=disk). Оригиналы не трогаем, пишем рядом.
 *   - Каталог private/ не читаем (обход без рекурсии).
 *   - Готовые превью пропускаем — скрипт можно прерывать и перезапускать.
 *   - По одному файлу и sharp.concurrency(1): VPS слабый, сайт работает.
 */
import "dotenv/config";

import sharp from "sharp";

import { isObjectStorageUploadEnabled } from "../services/upload/objectStorageUpload.js";
import { backfillUploadImageThumbnailsOnDisk } from "../services/upload/uploadImageThumbnail.js";
import { UPLOADS_DIR } from "../services/upload/uploadsDir.js";

const isApply = process.argv.includes("--apply");
const PROGRESS_EVERY = 200;

/**
 * @param {string} name
 * @param {number} fallback
 */
function readNonNegativeNumberArg(name, fallback) {
  const arg = process.argv.find((value) => value.startsWith(`--${name}=`));
  const parsed = arg ? Number(arg.slice(name.length + 3)) : Number.NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * @param {number} bytes
 */
function formatMB(bytes) {
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function main() {
  if (isObjectStorageUploadEnabled()) {
    console.error(
      "UPLOAD_STORAGE=s3: бэкфил превью умеет только диск. Новые загрузки получают превью и в S3.",
    );
    process.exitCode = 1;
    return;
  }

  sharp.concurrency(1);

  const limit = readNonNegativeNumberArg("limit", Number.POSITIVE_INFINITY);
  const pauseMs = readNonNegativeNumberArg("pause-ms", 0);
  const startedAt = Date.now();

  console.log(
    `${isApply ? "APPLY" : "DRY-RUN"}: превью для фото в ${UPLOADS_DIR}` +
      (Number.isFinite(limit) ? `, не больше ${limit}` : "") +
      (pauseMs > 0 ? `, пауза ${pauseMs} мс` : ""),
  );

  const summary = await backfillUploadImageThumbnailsOnDisk({
    apply: isApply,
    limit,
    pauseMs,
    onProgress: (current) => {
      const done = current.created + current.failed;
      if (done % PROGRESS_EVERY === 0) {
        console.log(`  … ${done} готово, ${formatMB(current.bytesWritten)} записано`);
      }
    },
  });

  console.log(
    JSON.stringify(
      {
        mode: isApply ? "apply" : "dry-run",
        candidates: summary.candidates,
        created: summary.created,
        skippedExisting: summary.skippedExisting,
        failed: summary.failed,
        written: formatMB(summary.bytesWritten),
        seconds: Math.round((Date.now() - startedAt) / 1000),
        failures: summary.failures,
      },
      null,
      2,
    ),
  );

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
