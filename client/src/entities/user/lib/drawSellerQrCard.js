import { SELLER_QR_QUIET_ZONE } from "./sellerQrMatrix.js";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const QR_BOX = 760;
const AVATAR_SIZE = 168;
const INK = "#111111";
const MUTED = "#6b7280";
const FONT = '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif';

/**
 * Аватар для карточки. Чужой домен без CORS «пачкает» canvas, и картинку потом
 * не выгрузить — тогда карточка рисуется без аватара.
 *
 * @param {string} src
 * @returns {Promise<HTMLImageElement | null>}
 */
function loadAvatar(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @returns {string}
 */
function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

/**
 * Карточка с QR-кодом витрины — PNG для печати, сторис и визитки.
 *
 * @param {{
 *   matrix: boolean[][];
 *   sellerName: string;
 *   caption: string;
 *   brand: string;
 *   avatarUrl?: string;
 * }} params
 * @returns {Promise<Blob>}
 */
export async function drawSellerQrCard({
  matrix,
  sellerName,
  caption,
  brand,
  avatarUrl = "",
}) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas недоступен");
  }

  // Фон всегда белый, код всегда чёрный: тёмная тема сайта на печать не идёт.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const avatar = await loadAvatar(avatarUrl);
  let cursorY = 90;
  if (avatar) {
    const x = (CARD_WIDTH - AVATAR_SIZE) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(CARD_WIDTH / 2, cursorY + AVATAR_SIZE / 2, AVATAR_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    // cover: центрируем и обрезаем по меньшей стороне.
    const side = Math.min(avatar.naturalWidth, avatar.naturalHeight);
    ctx.drawImage(
      avatar,
      (avatar.naturalWidth - side) / 2,
      (avatar.naturalHeight - side) / 2,
      side,
      side,
      x,
      cursorY,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );
    ctx.restore();
    cursorY += AVATAR_SIZE + 40;
  } else {
    cursorY += 60;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.font = `800 64px ${FONT}`;
  ctx.fillText(fitText(ctx, sellerName, CARD_WIDTH - 160), CARD_WIDTH / 2, cursorY);
  cursorY += 110;

  const modules = matrix.length + SELLER_QR_QUIET_ZONE * 2;
  // Целый размер модуля: дробные края размываются и хуже читаются камерой.
  const moduleSize = Math.floor(QR_BOX / modules);
  const qrSize = moduleSize * modules;
  const qrX = Math.round((CARD_WIDTH - qrSize) / 2);
  ctx.fillStyle = INK;
  matrix.forEach((row, rowIndex) => {
    row.forEach((isDark, colIndex) => {
      if (isDark) {
        ctx.fillRect(
          qrX + (colIndex + SELLER_QR_QUIET_ZONE) * moduleSize,
          cursorY + (rowIndex + SELLER_QR_QUIET_ZONE) * moduleSize,
          moduleSize,
          moduleSize,
        );
      }
    });
  });
  cursorY += qrSize + 30;

  ctx.fillStyle = MUTED;
  ctx.font = `600 40px ${FONT}`;
  ctx.fillText(caption, CARD_WIDTH / 2, cursorY);

  ctx.fillStyle = INK;
  ctx.font = `800 52px ${FONT}`;
  ctx.fillText(brand, CARD_WIDTH / 2, CARD_HEIGHT - 120);

  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Не удалось собрать картинку"));
        }
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}
