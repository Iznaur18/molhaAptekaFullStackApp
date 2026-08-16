// [TEMP DIAG] Маячок ошибок для отладки белого экрана на мобильных.
// Шлёт message+stack в query-строке GET /__diagerr.gif → попадает в access.log nginx.
// Импортируется ПЕРВЫМ в main.jsx, чтобы поймать ошибки последующих модулей и рендера.
// УДАЛИТЬ после диагностики (импорт в main.jsx + этот файл).
if (typeof window !== "undefined") {
  const send = (label, msg) => {
    try {
      const img = new Image();
      img.src =
        "/__diagerr.gif?t=" +
        Date.now() +
        "&l=" +
        label +
        "&e=" +
        encodeURIComponent(String(msg).slice(0, 600));
    } catch {
      // ignore
    }
  };
  window.addEventListener("error", (e) => {
    send(
      "err",
      (e.message || "") +
        " @ " +
        (e.filename || "") +
        ":" +
        (e.lineno || "") +
        " :: " +
        ((e.error && e.error.stack) || "").slice(0, 400),
    );
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    send("rej", (r && (r.stack || r.message)) || String(r));
  });
  // подтверждение, что бандл вообще выполнился на устройстве
  send("boot", navigator.userAgent || "");
}
