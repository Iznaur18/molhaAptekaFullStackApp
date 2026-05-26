import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * LAN-доступ (вариант C): см. `client/docs/LAN-dev-access.md`
 *
 * Откат к «только этот ПК»:
 * - DEV_SERVER_HOST = "127.0.0.1"
 * - (опционально) убери "/address" из DEV_API_PROXY_PREFIXES
 */
const DEV_SERVER_HOST = true;
const LOCAL_API_PROXY_TARGET = "127.0.0.1";
const LOCAL_API_PORT = 4444;
const LOCAL_API_ORIGIN = `http://${LOCAL_API_PROXY_TARGET}:${LOCAL_API_PORT}`;

/** Префиксы путей Express (порядок: /uploads раньше /upload). */
const DEV_API_PROXY_PREFIXES = [
  "/auth",
  "/cart",
  "/user",
  "/vote",
  "/order",
  "/product",
  "/address",
  "/uploads",
  "/upload",
];

/** Не проксировать SPA-пути вроде `/user-list` (префикс API — только `/user` и `/user/...`). */
const shouldProxyToApi = (prefix, pathname) => {
  if (prefix === "/user") {
    return /^\/user(?:\/|$)/.test(pathname);
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

const devApiProxy = Object.fromEntries(
  DEV_API_PROXY_PREFIXES.map((prefix) => [
    prefix,
    {
      target: LOCAL_API_ORIGIN,
      changeOrigin: true,
      bypass(req) {
        const pathname = (req.url ?? "").split("?")[0];
        if (!shouldProxyToApi(prefix, pathname)) {
          return "/index.html";
        }
      },
    },
  ]),
);

// https://vite.dev/config/
export default defineConfig({
  appType: "spa",
  plugins: [react()],
  server: {
    host: DEV_SERVER_HOST,
    port: 5173,
    strictPort: true,
    open: true,
    proxy: devApiProxy,
  },
  preview: {
    host: DEV_SERVER_HOST,
    port: 4173,
    strictPort: false,
    proxy: devApiProxy,
  },
});
