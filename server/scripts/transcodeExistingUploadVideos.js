/**
 * Одноразово: перекодировать .mov/.m4v в H.264 .mp4 в server/uploads/.
 * После — обновить productPreviewVideoUrl в Mongo вручную или перезалить видео в карточке.
 *
 *   node scripts/transcodeExistingUploadVideos.js
 *   node scripts/transcodeExistingUploadVideos.js --apply
 */
import "dotenv/config";
import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { UPLOADS_DIR } from "../services/upload/uploadsDir.js";
import { transcodeUploadVideoToH264 } from "../services/upload/transcodeUploadVideoToH264.js";

const VIDEO_EXTENSIONS = new Set([".mov", ".m4v", ".mp4", ".webm"]);
const isApply = process.argv.includes("--apply");

async function transcodeFile(filePath) {
  const buffer = await readFile(filePath);
  const filename = path.basename(filePath);
  const outputBuffer = await transcodeUploadVideoToH264({
    buffer,
    originalname: filename,
  });
  const mp4Path = filePath.replace(/\.[^.]+$/i, ".mp4");
  if (!isApply) {
    console.log(`[dry-run] ${filename} → ${path.basename(mp4Path)}`);
    return;
  }
  await writeFile(mp4Path, outputBuffer);
  if (mp4Path !== filePath) {
    await unlink(filePath).catch(() => {});
  }
  console.log(`[ok] ${filename} → ${path.basename(mp4Path)}`);
}

async function main() {
  const entries = await readdir(UPLOADS_DIR);
  const videoFiles = entries.filter((name) =>
    VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase()),
  );

  if (videoFiles.length === 0) {
    console.log("Нет видео в uploads/");
    return;
  }

  for (const name of videoFiles) {
    try {
      await transcodeFile(path.join(UPLOADS_DIR, name));
    } catch (error) {
      console.error(`[fail] ${name}:`, error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
