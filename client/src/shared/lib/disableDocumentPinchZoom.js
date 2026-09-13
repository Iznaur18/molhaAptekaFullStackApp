const NON_PASSIVE_LISTENER = { capture: true, passive: false };

function preventGestureStart(event) {
  event.preventDefault();
}

function preventCtrlWheelZoom(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}

/**
 * Запрет масштабирования страницы.
 *
 * Щипок и двойной тап гасит CSS `touch-action: pan-x pan-y` на html/body/#root
 * (index.css), Safari дополнительно — `gesturestart`. Непассивного `touchmove`
 * на документе здесь больше нет: с ним iOS ждал JavaScript перед каждым
 * сдвигом пальца, и когда главный поток был занят (монтирование карточек
 * ленты), прокрутка подвисала (13.09.2026).
 */
export function disableDocumentPinchZoom() {
  if (typeof document === "undefined") {
    return;
  }

  document.addEventListener("gesturestart", preventGestureStart, NON_PASSIVE_LISTENER);
  document.addEventListener("wheel", preventCtrlWheelZoom, NON_PASSIVE_LISTENER);
}
