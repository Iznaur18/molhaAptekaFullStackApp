const NON_PASSIVE_LISTENER = { capture: true, passive: false };

function preventMultiTouchMove(event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}

function preventGestureStart(event) {
  event.preventDefault();
}

function preventCtrlWheelZoom(event) {
  if (event.ctrlKey) {
    event.preventDefault();
  }
}

export function disableDocumentPinchZoom() {
  if (typeof document === "undefined") {
    return;
  }

  document.addEventListener("touchmove", preventMultiTouchMove, NON_PASSIVE_LISTENER);
  document.addEventListener("gesturestart", preventGestureStart, NON_PASSIVE_LISTENER);
  document.addEventListener("wheel", preventCtrlWheelZoom, NON_PASSIVE_LISTENER);
}
