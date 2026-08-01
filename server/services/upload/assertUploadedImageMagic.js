import fs from "node:fs/promises";

import { UPLOAD_IMAGE_MIME_TYPES } from "../../constants/uploadConstants.js";

/** @type {ReadonlyArray<{ mime: string; match: (buf: Buffer) => boolean }>} */
const IMAGE_MAGIC_RULES = [
  {
    mime: "image/jpeg",
    match: (buf) =>
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: "image/jpg",
    match: (buf) =>
      buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  {
    mime: "image/png",
    match: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  {
    mime: "image/webp",
    match: (buf) =>
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP",
  },
];

const ALLOWED_IMAGE_MIME = new Set(UPLOAD_IMAGE_MIME_TYPES);

/**
 * @param {Buffer} buffer
 * @returns {string | null} canonical mime from magic, or null
 */
export function detectImageMimeFromMagic(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return null;
  }
  for (const rule of IMAGE_MAGIC_RULES) {
    if (rule.match(buffer) && ALLOWED_IMAGE_MIME.has(rule.mime)) {
      return rule.mime === "image/jpg" ? "image/jpeg" : rule.mime;
    }
  }
  return null;
}

/**
 * Читает начало файла (disk path или memory buffer multer).
 *
 * @param {Pick<Express.Multer.File, "buffer" | "path">} file
 * @param {number} [byteLength=32]
 * @returns {Promise<Buffer>}
 */
export async function readUploadFileHead(file, byteLength = 32) {
  if (file?.buffer && Buffer.isBuffer(file.buffer) && file.buffer.length > 0) {
    return file.buffer.subarray(0, byteLength);
  }
  if (file?.path) {
    const handle = await fs.open(file.path, "r");
    try {
      const buf = Buffer.alloc(byteLength);
      const { bytesRead } = await handle.read(buf, 0, byteLength, 0);
      return buf.subarray(0, bytesRead);
    } finally {
      await handle.close();
    }
  }
  throw new Error("UPLOAD_FILE_UNREADABLE");
}

/**
 * Client-claimed MIME недостаточно — сверяем magic bytes.
 *
 * @param {Pick<Express.Multer.File, "buffer" | "path" | "mimetype">} file
 * @returns {Promise<string>} detected mime
 */
export async function assertUploadedImageMagic(file) {
  const head = await readUploadFileHead(file);
  const detected = detectImageMimeFromMagic(head);
  if (!detected) {
    const err = new Error("UPLOAD_IMAGE_MAGIC_MISMATCH");
    err.code = "UPLOAD_IMAGE_MAGIC_MISMATCH";
    throw err;
  }
  return detected;
}
