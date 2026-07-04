import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { transcodeUploadVideoToH264 } from "./transcodeUploadVideoToH264.js";

/**
 * @param {string} filename
 */
function toMp4Filename(filename) {
  const trimmed = String(filename ?? "").trim();
  if (trimmed === "") {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.mp4`;
  }
  return trimmed.replace(/\.[^.]+$/i, ".mp4");
}

/**
 * @param {string} filePath
 */
async function safeUnlink(filePath) {
  if (!filePath) return;
  await unlink(filePath).catch(() => {});
}

/**
 * @param {import('express').Multer.File} file
 * @param {{ maxDurationSec?: number | null }} [options]
 */
export async function prepareUploadedVideoFile(file, options = {}) {
  if (!file) {
    throw new Error("Файл не передан");
  }

  if (String(process.env.UPLOAD_VIDEO_TRANSCODE ?? "").toLowerCase() === "false") {
    return file;
  }

  const transcodedBuffer = await transcodeUploadVideoToH264(file, options);
  const nextFilename = toMp4Filename(file.filename);

  if (file.path) {
    const nextPath = path.join(path.dirname(file.path), nextFilename);
    await writeFile(nextPath, transcodedBuffer);
    if (nextPath !== file.path) {
      await safeUnlink(file.path);
    }
    file.path = nextPath;
  }

  file.buffer = transcodedBuffer;
  file.size = transcodedBuffer.length;
  file.mimetype = "video/mp4";
  file.filename = nextFilename;
  file.originalname = String(file.originalname ?? "video.mp4").replace(
    /\.[^.]+$/i,
    ".mp4",
  );

  return file;
}
