/**
 * Диагностический маячок: GET `/__diagerr.gif?l=<метка>&e=<текст>` попадает в
 * access.log nginx (тот же канал, что `app/__errorBeacon.js`). Для случаев,
 * которые не воспроизводятся у нас, но случаются у пользователей.
 *
 * Персональных данных в текст не класть.
 *
 * @param {string} label короткая метка латиницей
 * @param {string} message
 */
export function sendDiagBeacon(label, message) {
  try {
    const image = new Image();
    image.src = `/__diagerr.gif?t=${Date.now()}&l=${encodeURIComponent(label)}&e=${encodeURIComponent(
      String(message).slice(0, 600),
    )}`;
  } catch (error) {
    console.warn("Diag beacon failed", error);
  }
}
