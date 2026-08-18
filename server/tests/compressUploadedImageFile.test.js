import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import sharp from "sharp";

import { compressImageToWebp } from "../services/upload/compressImageBuffer.js";
import { compressUploadedImageFile } from "../services/upload/compressUploadedImageFile.js";

/**
 * «Тяжёлое» фото: большой lossless-PNG со случайным шумом, чтобы zlib не сжал
 * его в ноль — имитирует реальную выгрузку с телефона.
 */
async function makeHeavyPngBuffer(dim = 1800) {
  const pixels = Buffer.alloc(dim * dim * 3);
  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = Math.floor(Math.random() * 256);
  }
  return sharp(pixels, { raw: { width: dim, height: dim, channels: 3 } })
    .png()
    .toBuffer();
}

/** Крошечный PNG — WebP-обёртка будет не легче. */
async function makeTinyPngBuffer() {
  return sharp({
    create: {
      width: 4,
      height: 4,
      channels: 3,
      background: { r: 10, g: 20, b: 30 },
    },
  })
    .png()
    .toBuffer();
}

test("compressImageToWebp downscales to maxDim and shrinks the file", async () => {
  const input = await makeHeavyPngBuffer(1800);
  const output = await compressImageToWebp(input, { maxDim: 1600, quality: 80 });

  assert.ok(output, "ожидался сжатый буфер");
  assert.ok(output.length < input.length, "WebP должен быть легче оригинала");

  const meta = await sharp(output).metadata();
  assert.equal(meta.format, "webp");
  assert.ok(meta.width <= 1600 && meta.height <= 1600, "должно ужаться до maxDim");
});

test("compressImageToWebp never inflates: returns null or a smaller buffer", async () => {
  const tiny = await makeTinyPngBuffer();
  const output = await compressImageToWebp(tiny);
  // Гард: либо отказ (null), либо строго меньше входа — но никогда не тяжелее.
  assert.ok(
    output === null || output.length < tiny.length,
    "результат не должен быть тяжелее оригинала",
  );
});

test("compressUploadedImageFile rewrites disk file to .webp", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "izi-img-"));
  try {
    const filename = "1700000000-deadbeef.png";
    const filePath = path.join(dir, filename);
    await writeFile(filePath, await makeHeavyPngBuffer(1800));

    const file = {
      path: filePath,
      filename,
      mimetype: "image/png",
      originalname: "photo.png",
      size: (await readFile(filePath)).length,
    };

    await compressUploadedImageFile(file);

    assert.equal(file.mimetype, "image/webp");
    assert.match(file.filename, /\.webp$/);
    assert.match(file.originalname, /\.webp$/);
    assert.equal(path.basename(file.path), file.filename);

    const onDisk = await readFile(file.path);
    assert.equal(onDisk.length, file.size);
    const meta = await sharp(onDisk).metadata();
    assert.equal(meta.format, "webp");

    // Оригинальный .png удалён.
    await assert.rejects(readFile(filePath));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("compressUploadedImageFile compresses in-memory (S3) buffer", async () => {
  const original = await makeHeavyPngBuffer(1800);
  const file = {
    buffer: original,
    filename: "1700000000-cafe.png",
    mimetype: "image/png",
    originalname: "photo.png",
    size: original.length,
  };

  await compressUploadedImageFile(file);

  assert.equal(file.mimetype, "image/webp");
  assert.match(file.filename, /\.webp$/);
  assert.ok(file.buffer.length < original.length);
  assert.equal(file.size, file.buffer.length);
});

test("compressUploadedImageFile keeps original when UPLOAD_IMAGE_COMPRESS=false", async () => {
  const prev = process.env.UPLOAD_IMAGE_COMPRESS;
  process.env.UPLOAD_IMAGE_COMPRESS = "false";
  try {
    const original = await makeHeavyPngBuffer(800);
    const file = {
      buffer: original,
      filename: "1700000000-keep.png",
      mimetype: "image/png",
      originalname: "photo.png",
      size: original.length,
    };

    await compressUploadedImageFile(file);

    assert.equal(file.mimetype, "image/png");
    assert.equal(file.filename, "1700000000-keep.png");
  } finally {
    if (prev === undefined) {
      delete process.env.UPLOAD_IMAGE_COMPRESS;
    } else {
      process.env.UPLOAD_IMAGE_COMPRESS = prev;
    }
  }
});

test("compressUploadedImageFile skips non-image mimetypes", async () => {
  const buffer = Buffer.from("not an image");
  const file = {
    buffer,
    filename: "1700000000-doc.pdf",
    mimetype: "application/pdf",
    originalname: "doc.pdf",
    size: buffer.length,
  };

  const result = await compressUploadedImageFile(file);
  assert.equal(result.mimetype, "application/pdf");
  assert.equal(result.filename, "1700000000-doc.pdf");
});
