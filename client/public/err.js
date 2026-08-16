/* [TEMP DIAG] Классический (не-module) обработчик ошибок — выполняется ПЕРВЫМ,
   до module-скриптов, поэтому ловит и SyntaxError парсинга бандла на iOS Safari,
   и ошибки загрузки ресурсов. Шлёт в /__diagerr.gif → лог nginx. УДАЛИТЬ после отладки. */
(function () {
  function send(label, msg) {
    try {
      var img = new Image();
      img.src =
        "/__diagerr.gif?t=" +
        Date.now() +
        "&l=" +
        label +
        "&e=" +
        encodeURIComponent(String(msg).slice(0, 600));
    } catch (e) {}
  }
  window.addEventListener(
    "error",
    function (e) {
      if (e && e.target && e.target !== window && (e.target.src || e.target.href)) {
        send("res", (e.target.tagName || "") + " " + (e.target.src || e.target.href || ""));
      } else {
        send(
          "err",
          (e.message || "") +
            " @ " +
            (e.filename || "") +
            ":" +
            (e.lineno || "") +
            ":" +
            (e.colno || "") +
            " :: " +
            ((e.error && e.error.stack) || "").slice(0, 350)
        );
      }
    },
    true
  );
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    send("rej", (r && (r.stack || r.message)) || String(r));
  });
  send("boot2", navigator.userAgent);
})();
