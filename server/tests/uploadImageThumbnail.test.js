import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";

import sharp from "sharp";

import {
  backfillUploadImageThumbnailsOnDisk,
  createPublicUploadImageThumbnail,
  createPublicUploadImageThumbnailSafe,
  deletePublicUploadImageThumbnail,
} from "../services/upload/uploadImageThumbnail.js";

/** @type {string} */
let dir;
const previousUploadStorage = process.env.UPLOAD_STORAGE;

/**
 * @param {number} width
 * @param {number} height
 */
async function makeWebp(width, height) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 120, g: 60, b: 30 } },
  })
    .webp({ quality: 80 })
    .toBuffer();
}

beforeEach(async () => {
  process.env.UPLOAD_STORAGE = "disk";
  dir = await mkdtemp(path.join(tmpdir(), "izi-thumb-"));
});

afterEach(async () => {
  if (previousUploadStorage === undefined) {
    delete process.env.UPLOAD_STORAGE;
  } else {
    process.env.UPLOAD_STORAGE = previousUploadStorage;
  }
  await rm(dir, { recursive: true, force: true });
});

test("createPublicUploadImageThumbnail: крупное фото → -w600.webp не больше 600 px", async () => {
  const name = await createPublicUploadImageThumbnail({
    filename: "1700000000-deadbeef.webp",
    buffer: await makeWebp(1600, 1200),
    uploadsDir: dir,
  });

  assert.equal(name, "1700000000-deadbeef-w600.webp");
  const meta = await sharp(await readFile(path.join(dir, name))).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 600);
  assert.equal(meta.height, 450);
});

test("createPublicUploadImageThumbnail: маленькое фото не увеличивается, но превью есть", async () => {
  const name = await createPublicUploadImageThumbnail({
    filename: "small.png",
    buffer: await makeWebp(300, 200),
    uploadsDir: dir,
  });

  assert.equal(name, "small-w600.webp");
  const meta = await sharp(await readFile(path.join(dir, name))).metadata();
  assert.equal(meta.width, 300);
  assert.equal(meta.height, 200);
});

test("createPublicUploadImageThumbnail: без буфера читает файл с диска", async () => {
  const filePath = path.join(dir, "ondisk.webp");
  await writeFile(filePath, await makeWebp(900, 900));

  const name = await createPublicUploadImageThumbnail({
    filename: "ondisk.webp",
    filePath,
    uploadsDir: dir,
  });

  assert.equal(name, "ondisk-w600.webp");
  await stat(path.join(dir, name));
});

test("createPublicUploadImageThumbnail: видео и прочее превью не получают", async () => {
  const name = await createPublicUploadImageThumbnail({
    filename: "clip.mp4",
    buffer: Buffer.from("not an image"),
    uploadsDir: dir,
  });

  assert.equal(name, null);
  assert.deepEqual(await readdir(dir), []);
});

test("createPublicUploadImageThumbnailSafe: битый файл не роняет загрузку", async () => {
  const name = await createPublicUploadImageThumbnailSafe({
    filename: "broken.webp",
    buffer: Buffer.from("definitely not a webp"),
    uploadsDir: dir,
  });

  assert.equal(name, null);
  assert.deepEqual(await readdir(dir), []);
});

test("deletePublicUploadImageThumbnail: удаляет превью и спокойно переносит его отсутствие", async () => {
  await writeFile(path.join(dir, "gone-w600.webp"), await makeWebp(10, 10));

  await deletePublicUploadImageThumbnail("gone.webp", { uploadsDir: dir });
  assert.deepEqual(await readdir(dir), []);

  await deletePublicUploadImageThumbnail("gone.webp", { uploadsDir: dir });
  await deletePublicUploadImageThumbnail("clip.mp4", { uploadsDir: dir });
});

test("backfillUploadImageThumbnailsOnDisk: dry-run считает, apply пишет, private/ не трогает", async () => {
  await writeFile(path.join(dir, "a.webp"), await makeWebp(1200, 800));
  await writeFile(
    path.join(dir, "b.jpg"),
    await sharp(await makeWebp(700, 700))
      .jpeg()
      .toBuffer(),
  );
  await writeFile(path.join(dir, "c.webp"), await makeWebp(400, 400));
  await writeFile(path.join(dir, "c-w600.webp"), await makeWebp(400, 400));
  await writeFile(path.join(dir, "notes.txt"), "not an image");
  await mkdir(path.join(dir, "private"));
  await writeFile(path.join(dir, "private", "selfie.webp"), await makeWebp(1000, 1000));

  const dryRun = await backfillUploadImageThumbnailsOnDisk({ uploadsDir: dir });
  assert.equal(dryRun.candidates, 2);
  assert.equal(dryRun.created, 0);
  assert.equal(dryRun.skippedExisting, 1);
  assert.equal((await readdir(dir)).includes("a-w600.webp"), false);

  const applied = await backfillUploadImageThumbnailsOnDisk({
    uploadsDir: dir,
    apply: true,
  });
  assert.equal(applied.created, 2);
  assert.equal(applied.failed, 0);
  const files = await readdir(dir);
  assert.ok(files.includes("a-w600.webp"));
  assert.ok(files.includes("b-w600.webp"));
  assert.deepEqual(await readdir(path.join(dir, "private")), ["selfie.webp"]);

  const rerun = await backfillUploadImageThumbnailsOnDisk({
    uploadsDir: dir,
    apply: true,
  });
  assert.equal(rerun.candidates, 0);
  assert.equal(rerun.skippedExisting, 3);
});

test("backfillUploadImageThumbnailsOnDisk: limit ограничивает число превью", async () => {
  await writeFile(path.join(dir, "a.webp"), await makeWebp(800, 800));
  await writeFile(path.join(dir, "b.webp"), await makeWebp(800, 800));
  await writeFile(path.join(dir, "c.webp"), await makeWebp(800, 800));

  const summary = await backfillUploadImageThumbnailsOnDisk({
    uploadsDir: dir,
    apply: true,
    limit: 2,
  });

  assert.equal(summary.created, 2);
  assert.equal(
    (await readdir(dir)).filter((name) => name.endsWith("-w600.webp")).length,
    2,
  );
});
