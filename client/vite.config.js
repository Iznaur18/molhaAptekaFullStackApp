import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const LOCAL_API_HOST = "127.0.0.1";
const LOCAL_API_PORT = 4444;
const LOCAL_API_ORIGIN = `http://${LOCAL_API_HOST}:${LOCAL_API_PORT}`;

/** Префиксы путей Express (порядок: /uploads раньше /upload). */
const DEV_API_PROXY_PREFIXES = [
  "/auth",
  "/cart",
  "/user",
  "/vote",
  "/order",
  "/product",
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
  plugins: [react()],
  server: {
    host: LOCAL_API_HOST,
    port: 5173,
    strictPort: true,
    open: true,
    proxy: devApiProxy,
  },
  preview: {
    host: LOCAL_API_HOST,
    port: 4173,
    strictPort: false,
    proxy: devApiProxy,
  },
});
