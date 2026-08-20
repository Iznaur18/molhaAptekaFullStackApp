import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOGO_PATH = path.join(ROOT, "client/public/logo-gitorg.png");
const OUT_PATH = path.join(ROOT, "client/public/intro/intro-poster.jpg");

const WIDTH = 1920;
const HEIGHT = 1080;
const BACKGROUND = "#0a0a0a";

try {
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });

  const logoWidth = 720;
  const resizedLogo = await sharp(LOGO_PATH)
    .resize({ width: logoWidth, withoutEnlargement: true })
    .png()
    .toBuffer();
  const logoMeta = await sharp(resizedLogo).metadata();
  const left = Math.round((WIDTH - (logoMeta.width ?? 0)) / 2);
  const top = Math.round((HEIGHT - (logoMeta.height ?? 0)) / 2);

  await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: BACKGROUND,
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .jpeg({ quality: 88 })
    .toFile(OUT_PATH);

  const meta = await sharp(OUT_PATH).metadata();
  console.log(`intro-poster.jpg: ${meta.width}x${meta.height}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
