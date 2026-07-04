import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import ffmpegPath from "ffmpeg-static";

const FFMPEG_MAX_WIDTH_PX = 1920;
const FFMPEG_AUDIO_BITRATE = "128k";

/**
 * @returns {string}
 */
function resolveFfmpegBinaryPath() {
  const fromEnv = String(process.env.FFMPEG_PATH ?? "").trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (ffmpegPath) {
    return ffmpegPath;
  }
  throw new Error("ffmpeg не найден (установите ffmpeg-static или FFMPEG_PATH)");
}

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {{ maxDurationSec?: number | null, maxVideoBitrateMbit?: number | null }} [options]
 */
function runFfmpegTranscode(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const maxDurationSec = Number(options.maxDurationSec);
    const trimArgs =
      Number.isFinite(maxDurationSec) && maxDurationSec > 0
        ? ["-t", String(maxDurationSec)]
        : [];

    const maxVideoBitrateMbit = Number(options.maxVideoBitrateMbit);
    const bitrateArgs =
      Number.isFinite(maxVideoBitrateMbit) && maxVideoBitrateMbit > 0
        ? [
            "-maxrate",
            `${maxVideoBitrateMbit}M`,
            "-bufsize",
            `${maxVideoBitrateMbit * 2}M`,
          ]
        : [];

    const args = [
      "-y",
      "-i",
      inputPath,
      ...trimArgs,
      ...bitrateArgs,
      "-c:v",
      "libx264",
      "-profile:v",
      "main",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      FFMPEG_AUDIO_BITRATE,
      "-vf",
      `scale='min(${FFMPEG_MAX_WIDTH_PX},iw)':-2`,
      outputPath,
    ];

    const proc = spawn(resolveFfmpegBinaryPath(), args, {
      stdio: ["ignore", "ignore", "pipe"],
    });

    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `ffmpeg завершился с кодом ${code}: ${stderr.slice(-800)}`,
        ),
      );
    });
  });
}

/**
 * @param {Buffer} buffer
 * @param {string} originalName
 */
async function writeBufferToTempFile(buffer, originalName) {
  const extension = path.extname(originalName) || ".mp4";
  const tempPath = path.join(tmpdir(), `${randomUUID()}${extension}`);
  await writeFile(tempPath, buffer);
  return tempPath;
}

/**
 * @param {string} filePath
 */
async function safeUnlink(filePath) {
  if (!filePath) return;
  await unlink(filePath).catch(() => {});
}

/**
 * Конвертирует iPhone HEVC/MOV и прочие форматы в H.264 MP4 для Chrome/Firefox.
 * При `options.maxDurationSec` дополнительно обрезает видео до указанной длины,
 * при `options.maxVideoBitrateMbit` ограничивает пиковый видеобитрейт.
 *
 * @param {import('express').Multer.File} file
 * @param {{ maxDurationSec?: number | null, maxVideoBitrateMbit?: number | null }} [options]
 * @returns {Promise<Buffer>}
 */
export async function transcodeUploadVideoToH264(file, options = {}) {
  const ownsInput =
    !file.path && Buffer.isBuffer(file.buffer) && file.buffer.length > 0;
  const inputPath =
    file.path ??
    (await writeBufferToTempFile(file.buffer, file.originalname ?? "video.mp4"));
  const outputPath = path.join(tmpdir(), `${randomUUID()}.mp4`);

  try {
    await runFfmpegTranscode(inputPath, outputPath, options);
    return await readFile(outputPath);
  } finally {
    if (ownsInput) {
      await safeUnlink(inputPath);
    }
    await safeUnlink(outputPath);
  }
}
