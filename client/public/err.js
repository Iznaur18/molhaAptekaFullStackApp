/* [TEMP DIAG] Классический (не-module) обработчик ошибок — выполняется ПЕРВЫМ,
   до module-скриптов, поэтому ловит и SyntaxError парсинга бандла на iOS Safari,
   и ошибки загрузки ресурсов. Шлёт в /__diagerr.gif → лог nginx. УДАЛИТЬ после отладки.

   Зависшая загрузка (12.09.2026, жалоба «белый экран, долгая крутилка» с iPhone):
   - stall      — через 10 с страница не догрузилась или #root пуст;
   - slowload   — событие load наступило позже 5 с от начала навигации;
   - abandon    — ушли/перезагрузили, не дождавшись загрузки;
   - stall-prev — stall, который не смог уйти (сеть до сервера лежала),
                  досылается при следующем удачном заходе из localStorage.
   Поля: rs — readyState, root — детей у #root, nav — фазы загрузки HTML (мс),
   pend — ресурсы из DOM, ещё не загруженные, slow — самые долгие загруженные. */
(function () {
  var STALL_AFTER_MS = 10000;
  var SLOW_LOAD_MS = 5000;
  var ABANDON_MIN_MS = 3000;
  var PENDING_KEY = "diag-load-stall-pending";
  var PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  var startedAt = Date.now();

  function send(label, msg, limit, onDelivered) {
    try {
      var url =
        "/__diagerr.gif?t=" +
        Date.now() +
        "&l=" +
        label +
        "&e=" +
        encodeURIComponent(String(msg).slice(0, limit || 600));
      if (window.fetch) {
        // fetch, а не Image: промис резолвится на любой HTTP-ответ, значит
        // сервер реально получил маячок; keepalive переживает уход со страницы.
        window
          .fetch(url, { credentials: "omit", cache: "no-store", keepalive: true })
          .then(function () {
            if (onDelivered) onDelivered();
          })
          .catch(function () {
            /* сеть до сервера недоступна — stall останется в localStorage */
          });
        return;
      }
      var img = new Image();
      img.src = url;
    } catch (_e) {
      /* маячок best-effort: если Image/encodeURIComponent упали — молчим,
         диагностика не должна ломать загрузку страницы */
    }
  }

  function sinceNavigationStart() {
    var perf = window.performance;
    return perf && perf.now ? Math.round(perf.now()) : Date.now() - startedAt;
  }

  function roundMs(value) {
    return value > 0 ? Math.round(value) : "-";
  }

  function shortName(url) {
    var name = String(url || "").replace(location.origin, "");
    return name.length > 60 ? "…" + name.slice(-59) : name;
  }

  function isAppRendered() {
    var root = document.getElementById("root");
    return !!root && root.childElementCount > 0;
  }

  function isStuck() {
    return document.readyState !== "complete" || !isAppRendered();
  }

  function describeNavigation(perf) {
    var nav = perf.getEntriesByType("navigation")[0];
    if (!nav) return "nav=-";
    return (
      "nav=dns" +
      roundMs(nav.domainLookupEnd - nav.domainLookupStart) +
      ",tcp" +
      roundMs(nav.connectEnd - nav.connectStart) +
      ",tls" +
      (nav.secureConnectionStart > 0
        ? roundMs(nav.connectEnd - nav.secureConnectionStart)
        : "-") +
      ",ttfb" +
      roundMs(nav.responseStart) +
      ",html" +
      roundMs(nav.responseEnd) +
      ",dcl" +
      roundMs(nav.domContentLoadedEventEnd) +
      ",load" +
      roundMs(nav.loadEventEnd)
    );
  }

  function describeResources(perf) {
    var entries = perf.getEntriesByType("resource");
    var loaded = {};
    for (var i = 0; i < entries.length; i++) {
      loaded[entries[i].name] = true;
    }

    // Ресурсы из DOM, по которым ещё нет записи Resource Timing — то есть
    // в полёте. Динамические import() без <link> сюда не попадают.
    var pending = [];
    var nodes = document.querySelectorAll(
      "script[src], link[rel=stylesheet], link[rel=modulepreload], img[src]",
    );
    for (var j = 0; j < nodes.length && pending.length < 8; j++) {
      var node = nodes[j];
      if (node.tagName === "IMG") {
        if (!node.complete && node.getAttribute("loading") !== "lazy") {
          pending.push(shortName(node.currentSrc || node.src));
        }
        continue;
      }
      var url = node.src || node.href;
      if (url && !loaded[url]) pending.push(shortName(url));
    }

    var slowest = entries
      .filter(function (entry) {
        return entry.name.indexOf("/__diagerr.gif") === -1;
      })
      .sort(function (a, b) {
        return b.duration - a.duration;
      })
      .slice(0, 6)
      .map(function (entry) {
        return shortName(entry.name) + ":" + Math.round(entry.duration);
      });

    return (
      "res=" +
      entries.length +
      " pend=[" +
      pending.join(",") +
      "] slow=[" +
      slowest.join(",") +
      "]"
    );
  }

  function describeLoad() {
    var root = document.getElementById("root");
    var parts = [
      "el=" + sinceNavigationStart(),
      "rs=" + document.readyState,
      "vis=" + document.visibilityState,
      "online=" + (navigator.onLine === false ? 0 : 1),
      "root=" + (root ? root.childElementCount : "none"),
    ];
    var connection = navigator.connection;
    if (connection && connection.effectiveType) {
      parts.push("net=" + connection.effectiveType);
    }
    var perf = window.performance;
    if (perf && perf.getEntriesByType) {
      parts.push(describeNavigation(perf));
      parts.push(describeResources(perf));
    }
    return parts.join(" ");
  }

  function readPendingStall() {
    try {
      var raw = localStorage.getItem(PENDING_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || Date.now() - saved.at > PENDING_MAX_AGE_MS) {
        localStorage.removeItem(PENDING_KEY);
        return null;
      }
      return saved;
    } catch (_e) {
      return null;
    }
  }

  function forgetPendingStall() {
    try {
      localStorage.removeItem(PENDING_KEY);
    } catch (_e) {
      /* приватный режим / запрет хранилища — нечего чистить */
    }
  }

  window.addEventListener(
    "error",
    function (e) {
      if (e && e.target && e.target !== window && (e.target.src || e.target.href)) {
        send(
          "res",
          (e.target.tagName || "") + " " + (e.target.src || e.target.href || ""),
        );
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
            ((e.error && e.error.stack) || "").slice(0, 350),
        );
      }
    },
    true,
  );
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    send("rej", (r && (r.stack || r.message)) || String(r));
  });
  send("boot2", navigator.userAgent);

  var previousStall = readPendingStall();
  if (previousStall) {
    send(
      "stall-prev",
      "ago=" + (Date.now() - previousStall.at) + " " + previousStall.info,
      1500,
      forgetPendingStall,
    );
  }

  setTimeout(function () {
    if (!isStuck()) return;
    var info = describeLoad();
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ at: Date.now(), info: info }));
    } catch (_e) {
      /* без хранилища просто не будет досылки */
    }
    send("stall", info, 1500, forgetPendingStall);
  }, STALL_AFTER_MS);

  window.addEventListener("load", function () {
    if (sinceNavigationStart() < SLOW_LOAD_MS) return;
    // loadEventEnd заполняется только после обработчиков load
    setTimeout(function () {
      send("slowload", describeLoad(), 1500);
    }, 0);
  });

  window.addEventListener("pagehide", function () {
    if (sinceNavigationStart() < ABANDON_MIN_MS || !isStuck()) return;
    send("abandon", describeLoad(), 1500);
  });
})();
