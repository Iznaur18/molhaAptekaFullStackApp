// Генерация всех веб-иконок бренда из одного исходника.
//
//   node scripts/generate-web-icons.mjs [path/to/source.png]
//
// По умолчанию исходник — client/public/logo-torgum-source.png (1024×1024, PNG).
// Скрипт кладёт в client/public/:
//   logo-torgum.png            — логотип для шапки/шаринга (нормализованный исходник)
//   favicon-16.png / -32.png   — favicon PNG
//   favicon.ico                — ICO (16/32/48, PNG-полезная нагрузка)
//   apple-touch-icon.png (180) — iOS home screen (непрозрачный фон)
//   icon-192.png / icon-512.png — PWA (purpose "any")
//   maskable-512.png           — PWA maskable (safe-zone паддинг на фоне бренда)
//   og-image.png (1200×630)    — превью ссылки (Open Graph / Twitter)
//
// Фон для непрозрачных иконок берётся как доминирующий цвет исходника (фирменный
// оранжевый Torgum), так что скруглённые/прозрачные углы исходника заполняются им.

import { Buffer } from "node:buffer";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const PUBLIC_DIR = path.join(ROOT, "client", "public");
const SOURCE = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(PUBLIC_DIR, "logo-torgum-source.png");

const out = (name) => path.join(PUBLIC_DIR, name);

/**
 * Фирменный фон под непрозрачные иконки. Берём реальный пиксель из сплошной
 * оранжевой зоны исходника (верх-центр, над надписью), а не stats().dominant:
 * dominant квантуется в палитру и даёт цвет на несколько единиц мимо, из-за чего
 * подложка-иконка не сливается с фоном на OG-картинке.
 */
async function brandBackground() {
  const { width, height } = await sharp(SOURCE).metadata();
  const [r, g, b] = await sharp(SOURCE)
    .extract({
      left: Math.round(width * 0.5),
      top: Math.round(height * 0.15),
      width: 1,
      height: 1,
    })
    .raw()
    .toBuffer();
  return { r, g, b, alpha: 1 };
}

/** Квадрат size×size: фон + вписанный по центру логотип (scale — доля стороны). */
async function squareIcon({ size, scale, background }) {
  const inner = Math.round(size * scale);
  const logo = await sharp(SOURCE)
    .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const canvas = background
    ? sharp({ create: { width: size, height: size, channels: 4, background } })
    : sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
  return canvas.composite([{ input: logo, gravity: "center" }]).png().toBuffer();
}

/** Сборка .ico из PNG-буферов (ICO допускает PNG внутри; принимается браузерами). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(pngs.length, 4);

  const entries = [];
  const images = [];
  let offset = 6 + pngs.length * 16;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 == 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset
    offset += data.length;
    entries.push(entry);
    images.push(data);
  }
  return Buffer.concat([header, ...entries, ...images]);
}

async function main() {
  const bg = await brandBackground();
  const meta = await sharp(SOURCE).metadata();
  console.log(`source ${SOURCE} ${meta.width}×${meta.height}, brand bg rgb(${bg.r},${bg.g},${bg.b})`);

  // Логотип для шапки/OG — нормализуем исходник до 1024 (сохраняем прозрачность).
  await sharp(SOURCE)
    .resize({ width: 1024, height: 1024, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out("logo-torgum.png"));

  // favicon PNG (прозрачный фон допустим).
  for (const size of [16, 32]) {
    await sharp(await squareIcon({ size, scale: 1 })).toFile(out(`favicon-${size}.png`));
  }

  // favicon.ico из 16/32/48.
  const icoPngs = [];
  for (const size of [16, 32, 48]) {
    icoPngs.push({ size, data: await squareIcon({ size, scale: 1 }) });
  }
  const ico = buildIco(icoPngs);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(out("favicon.ico"), ico);

  // Непрозрачные иконки на фоне бренда.
  await sharp(await squareIcon({ size: 180, scale: 1, background: bg })).toFile(out("apple-touch-icon.png"));
  await sharp(await squareIcon({ size: 192, scale: 1, background: bg })).toFile(out("icon-192.png"));
  await sharp(await squareIcon({ size: 512, scale: 1, background: bg })).toFile(out("icon-512.png"));

  // Maskable: логотип в safe-zone (~80%) на фоне бренда.
  await sharp(await squareIcon({ size: 512, scale: 0.8, background: bg })).toFile(out("maskable-512.png"));

  // OG-image 1200×630: логотип по центру на фоне бренда.
  const ogLogo = await sharp(SOURCE)
    .resize({ width: 460, height: 460, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: bg } })
    .composite([{ input: ogLogo, gravity: "center" }])
    .png()
    .toFile(out("og-image.png"));

  console.log("done: logo-torgum.png, favicon-16/32.png, favicon.ico, apple-touch-icon.png, icon-192/512.png, maskable-512.png, og-image.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
