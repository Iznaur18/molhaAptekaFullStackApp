import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_ROOT = path.resolve(SCRIPT_DIR, "..");
const LOGO_PATH = path.resolve(MOBILE_ROOT, "../client/public/logo-izibuy.png");
const OUT_DIR = path.resolve(MOBILE_ROOT, "assets/images");

const ICON_SIZE = 1024;
const BRAND_BACKGROUND = "#E6F4FE";
const FAVICON_SIZE = 48;

const createSquarePng = async ({
  outputName,
  size,
  logoScale,
  background,
}) => {
  const padding = Math.round(size * 0.1);
  const maxLogoWidth = Math.round((size - padding * 2) * logoScale);
  const resizedLogo = await sharp(LOGO_PATH)
    .resize({ width: maxLogoWidth, withoutEnlargement: true })
    .png()
    .toBuffer();
  const logoMeta = await sharp(resizedLogo).metadata();
  const left = Math.round((size - (logoMeta.width ?? 0)) / 2);
  const top = Math.round((size - (logoMeta.height ?? 0)) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png()
    .toFile(path.join(OUT_DIR, outputName));
};

const createMonochromeIcon = async () => {
  const padding = Math.round(ICON_SIZE * 0.18);
  const maxLogoWidth = ICON_SIZE - padding * 2;
  const resizedLogo = await sharp(LOGO_PATH)
    .resize({ width: maxLogoWidth, withoutEnlargement: true })
    .grayscale()
    .threshold(180)
    .png()
    .toBuffer();
  const logoMeta = await sharp(resizedLogo).metadata();
  const left = Math.round((ICON_SIZE - (logoMeta.width ?? 0)) / 2);
  const top = Math.round((ICON_SIZE - (logoMeta.height ?? 0)) / 2);

  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png()
    .toFile(path.join(OUT_DIR, "android-icon-monochrome.png"));
};

try {
  await createSquarePng({
    outputName: "icon.png",
    size: ICON_SIZE,
    logoScale: 0.92,
    background: BRAND_BACKGROUND,
  });
  await createSquarePng({
    outputName: "splash-icon.png",
    size: ICON_SIZE,
    logoScale: 0.72,
    background: "#ffffff",
  });
  await createSquarePng({
    outputName: "android-icon-foreground.png",
    size: ICON_SIZE,
    logoScale: 0.68,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  await sharp({
    create: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      channels: 4,
      background: BRAND_BACKGROUND,
    },
  })
    .png()
    .toFile(path.join(OUT_DIR, "android-icon-background.png"));
  await createMonochromeIcon();
  await createSquarePng({
    outputName: "favicon.png",
    size: FAVICON_SIZE,
    logoScale: 0.9,
    background: BRAND_BACKGROUND,
  });

  const iconMeta = await sharp(path.join(OUT_DIR, "icon.png")).metadata();
  console.log(`icon.png: ${iconMeta.width}x${iconMeta.height}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
