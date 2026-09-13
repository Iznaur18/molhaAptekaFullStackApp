// [TEMP DIAG] Замер плавности прокрутки на реальных телефонах (13.09.2026).
// В эмуляции Chrome лента ровная (60 fps, 0 долгих кадров), а на iPhone
// дёргается — меряем там, где болит. Пока идёт прокрутка, считаем интервалы
// между кадрами (rAF крутится только во время прокрутки), раз в несколько
// секунд шлём сводку в GET /__diagerr.gif?l=scroll → access.log nginx.
// УДАЛИТЬ после сравнения лент (импорт в main.jsx + этот файл + тест).

const BEACON_PATH = "/__diagerr.gif";
/** Прокрутка закончилась, если столько мс не было событий scroll. */
const SCROLL_IDLE_MS = 200;
/** Меньше кадров — сводка ни о чём. */
const MIN_FRAMES = 30;
const MIN_BEACON_INTERVAL_MS = 5000;
const MAX_BEACONS_PER_PAGE = 60;
const LONG_FRAME_MS = 34;
const VERY_LONG_FRAME_MS = 50;

/**
 * @param {number[]} intervals интервалы между кадрами, мс
 */
export function summarizeFrameIntervals(intervals) {
  if (intervals.length === 0) {
    return null;
  }
  const sorted = [...intervals].sort((a, b) => a - b);
  const pick = (quantile) =>
    sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * quantile))];
  let total = 0;
  let longFrames = 0;
  let veryLongFrames = 0;
  for (const interval of intervals) {
    total += interval;
    if (interval > LONG_FRAME_MS) longFrames += 1;
    if (interval > VERY_LONG_FRAME_MS) veryLongFrames += 1;
  }
  return {
    frames: intervals.length,
    durationMs: Math.round(total),
    p50: Math.round(pick(0.5)),
    p95: Math.round(pick(0.95)),
    max: Math.round(sorted[sorted.length - 1]),
    longFrames,
    veryLongFrames,
  };
}

function describeFeed() {
  const mode = document.querySelector(".app-shell__grid-blocks")
    ? "blocks"
    : document.querySelector(".app-shell__grid-virtual-host")
      ? "legacy"
      : "plain";
  return (
    "mode=" +
    mode +
    " cards=" +
    document.getElementsByClassName("product-card").length +
    " collapsed=" +
    document.getElementsByClassName("app-shell__grid-block--collapsed").length
  );
}

function send(message) {
  try {
    const img = new Image();
    img.src =
      BEACON_PATH +
      "?t=" +
      Date.now() +
      "&l=scroll&e=" +
      encodeURIComponent(String(message).slice(0, 600));
  } catch {
    // маячок best-effort
  }
}

export function startScrollJankProbe() {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    !window.matchMedia("(pointer: coarse)").matches
  ) {
    return;
  }

  /** @type {number[]} */
  let pending = [];
  let sessions = 0;
  let scrolledPx = 0;
  let active = false;
  let lastFrameAt = 0;
  let lastScrollAt = 0;
  let sessionStartY = 0;
  let beaconsSent = 0;
  let lastBeaconAt = 0;

  const flushIfDue = () => {
    const now = Date.now();
    if (
      pending.length < MIN_FRAMES ||
      beaconsSent >= MAX_BEACONS_PER_PAGE ||
      now - lastBeaconAt < MIN_BEACON_INTERVAL_MS
    ) {
      return;
    }
    const summary = summarizeFrameIntervals(pending);
    beaconsSent += 1;
    lastBeaconAt = now;
    send(
      "y=" +
        Math.round(window.scrollY) +
        " px=" +
        Math.round(scrolledPx) +
        " s=" +
        sessions +
        " fr=" +
        summary.frames +
        " dur=" +
        summary.durationMs +
        " p50=" +
        summary.p50 +
        " p95=" +
        summary.p95 +
        " max=" +
        summary.max +
        " j34=" +
        summary.longFrames +
        " j50=" +
        summary.veryLongFrames +
        " " +
        describeFeed() +
        " vp=" +
        window.innerWidth +
        "x" +
        window.innerHeight,
    );
    pending = [];
    sessions = 0;
    scrolledPx = 0;
  };

  const onFrame = (timestamp) => {
    if (lastFrameAt > 0) {
      pending.push(timestamp - lastFrameAt);
    }
    lastFrameAt = timestamp;
    if (performance.now() - lastScrollAt > SCROLL_IDLE_MS) {
      active = false;
      sessions += 1;
      scrolledPx += Math.abs(window.scrollY - sessionStartY);
      flushIfDue();
      return;
    }
    requestAnimationFrame(onFrame);
  };

  window.addEventListener(
    "scroll",
    () => {
      lastScrollAt = performance.now();
      if (active) {
        return;
      }
      active = true;
      lastFrameAt = 0;
      sessionStartY = window.scrollY;
      requestAnimationFrame(onFrame);
    },
    { passive: true },
  );
}
