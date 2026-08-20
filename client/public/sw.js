/* Gitorg Web Push service worker — served from /sw.js (client/public). */
self.addEventListener("push", (event) => {
  let payload = {
    title: "Gitorg",
    body: "",
    url: "/notifications",
    data: {},
  };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    try {
      payload.body = event.data ? event.data.text() : "";
    } catch {
      // ignore
    }
  }

  const title = String(payload.title || "Gitorg");
  const options = {
    body: String(payload.body || ""),
    icon: "/icon-192.png",
    badge: "/favicon-32.png",
    data: {
      url: String(payload.url || "/notifications"),
      ...(payload.data && typeof payload.data === "object" ? payload.data : {}),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = String(event.notification?.data?.url || "/notifications");
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            await client.navigate(absoluteUrl);
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(absoluteUrl);
      }
    })(),
  );
});
