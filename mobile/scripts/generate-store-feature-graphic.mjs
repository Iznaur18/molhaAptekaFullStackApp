import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_ROOT = path.resolve(SCRIPT_DIR, "..");
const LOGO_PATH = path.resolve(MOBILE_ROOT, "../client/public/logo-gitorg.png");
const OUT_DIR = path.resolve(MOBILE_ROOT, "store-assets/google-play");

const WIDTH = 1024;
const HEIGHT = 500;
const BRAND_BACKGROUND = "#F25623";

const textOverlaySvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <text x="400" y="210" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="#111111">
    Покупай. Просто.
  </text>
  <text x="400" y="270" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#444444">
    Каталог · Корзина · Доставка
  </text>
  <text x="400" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#666666">
    Gitorg — маркетплейс
  </text>
</svg>
`;

try {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const logoWidth = 320;
  const resizedLogo = await sharp(LOGO_PATH)
    .resize({ width: logoWidth, withoutEnlargement: true })
    .png()
    .toBuffer();
  const logoMeta = await sharp(resizedLogo).metadata();
  const logoTop = Math.round((HEIGHT - (logoMeta.height ?? 0)) / 2);

  await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: BRAND_BACKGROUND,
    },
  })
    .composite([
      { input: resizedLogo, left: 48, top: logoTop },
      { input: Buffer.from(textOverlaySvg), left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(OUT_DIR, "feature-graphic-1024x500.png"));

  console.log(`feature-graphic-1024x500.png: ${WIDTH}x${HEIGHT}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
