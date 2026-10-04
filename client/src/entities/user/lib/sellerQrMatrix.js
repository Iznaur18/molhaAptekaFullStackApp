import qrcode from "qrcode-generator";

/** Тихая зона вокруг кода, в модулях: меньше четырёх — сканеры начинают ошибаться. */
export const SELLER_QR_QUIET_ZONE = 4;

/**
 * Матрица QR-кода: `true` — тёмный модуль.
 *
 * Уровень коррекции M: код печатают и клеят на прилавок, часть модулей может
 * затереться, а ссылка короткая — запас по плотности есть.
 *
 * @param {string} text
 * @returns {boolean[][]}
 */
export function buildSellerQrMatrix(text) {
  const qr = qrcode(0, "M");
  qr.addData(String(text));
  qr.make();
  const size = qr.getModuleCount();
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => qr.isDark(row, col)),
  );
}

/**
 * SVG-путь тёмных модулей в координатах «1 модуль = 1 единица», со сдвигом
 * на тихую зону. Один `path` вместо сотен `rect` — легче DOM.
 *
 * @param {boolean[][]} matrix
 * @returns {string}
 */
export function buildSellerQrSvgPath(matrix) {
  const parts = [];
  matrix.forEach((row, rowIndex) => {
    row.forEach((isDark, colIndex) => {
      if (isDark) {
        parts.push(
          `M${colIndex + SELLER_QR_QUIET_ZONE} ${rowIndex + SELLER_QR_QUIET_ZONE}h1v1h-1z`,
        );
      }
    });
  });
  return parts.join("");
}
