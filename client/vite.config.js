/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

import { buildSpaContentSecurityPolicy } from "../server/utils/buildSpaContentSecurityPolicy.js";
import { shouldProxyProductPathToApi } from "./src/shared/lib/productDetailsPaths.js";
import { shouldServeUserProfileAsSpa } from "./src/shared/lib/userProfilePaths.js";

/**
 * LAN-доступ (вариант C): см. `client/docs/LAN-dev-access.md`
 *
 * Откат к «только этот ПК»:
 * - DEV_SERVER_HOST = "127.0.0.1"
 * - (опционально) убери "/address" из DEV_API_PROXY_PREFIXES
 */
const DEV_SERVER_HOST = true;
const DEV_CLIENT_ORIGIN = "http://127.0.0.1:5173";
const LOCAL_API_PROXY_TARGET = "127.0.0.1";
const LOCAL_API_PORT = 4444;
const LOCAL_API_ORIGIN = `http://${LOCAL_API_PROXY_TARGET}:${LOCAL_API_PORT}`;

/** Префиксы путей Express (порядок: /uploads раньше /upload). */
const DEV_API_PROXY_PREFIXES = [
  "/auth",
  "/cart",
  "/favorites",
  "/user",
  "/vote",
  "/order",
  "/product",
  "/installment",
  "/price-offers",
  "/address",
  "/app-intro",
  "/site-header-banner-campaign",
  "/site-header-banner",
  "/intro-ad",
  "/seller-personal-category",
  "/health",
  "/uploads",
  "/upload",
];

/** Не проксировать SPA-пути вроде `/user-list` (префикс API — только `/user` и `/user/...`). */
const shouldProxyToApi = (prefix, pathname) => {
  if (prefix === "/user") {
    return /^\/user(?:\/|$)/.test(pathname);
  }
  if (prefix === "/site-header-banner") {
    return /^\/site-header-banner(?:\/|$)/.test(pathname);
  }
  if (prefix === "/product") {
    return shouldProxyProductPathToApi(pathname);
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

/** В dev cookie для localhost и 127.0.0.1 разные — редирект на один origin. */
function devLocalhostRedirectPlugin() {
  return {
    name: "dev-localhost-redirect",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const host = req.headers.host ?? "";
        if (host.startsWith("localhost:5173")) {
          const target = `http://127.0.0.1:5173${req.url ?? "/"}`;
          res.writeHead(301, { Location: target });
          res.end();
          return;
        }
        next();
      });
    },
  };
}

/** В dev по HTTP браузер не сохраняет Secure-cookie с API — снимаем при прокси. */
const stripSecureFromProxySetCookie = (proxy) => {
  proxy.on("proxyRes", (proxyRes) => {
    const setCookie = proxyRes.headers["set-cookie"];
    if (!setCookie) {
      return;
    }
    proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
      cookie.replace(/;\s*Secure/gi, "").replace(/;\s*Domain=[^;]+/gi, ""),
    );
  });
};

const devApiProxy = Object.fromEntries(
  DEV_API_PROXY_PREFIXES.map((prefix) => [
    prefix,
    {
      target: LOCAL_API_ORIGIN,
      changeOrigin: true,
      cookieDomainRewrite: "",
      cookiePathRewrite: "/",
      configure: stripSecureFromProxySetCookie,
      bypass(req) {
        const pathname = (req.url ?? "").split("?")[0];
        if (prefix === "/user" && shouldServeUserProfileAsSpa(pathname, req.headers.accept)) {
          return "/index.html";
        }
        if (!shouldProxyToApi(prefix, pathname)) {
          return "/index.html";
        }
      },
    },
  ]),
);

/** CSP как в prod nginx — только preview, не dev (HMR). */
function spaCspPreviewPlugin() {
  return {
    name: "spa-csp-preview",
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0];
        if (!pathname.startsWith("/assets/")) {
          res.setHeader(
            "Content-Security-Policy",
            buildSpaContentSecurityPolicy({
              frontendOrigin: process.env.FRONTEND_URL ?? "http://127.0.0.1:4173",
            }),
          );
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  appType: "spa",
  plugins: [
    react(),
    devLocalhostRedirectPlugin(),
    spaCspPreviewPlugin(),
    process.env.ANALYZE === "true" &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        open: false,
      }),
  ].filter(Boolean),
  build: {
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }
          if (id.includes("@sentry")) {
            return "vendor-sentry";
          }
          if (id.includes("@tanstack/react-query")) {
            return "vendor-query";
          }
          if (id.includes("react-router")) {
            return "vendor-router";
          }
          if (id.includes("react-dom") || id.includes("/react/")) {
            return "vendor-react";
          }
          if (id.includes("axios")) {
            return "vendor-axios";
          }
          if (id.includes("@dnd-kit")) {
            return "vendor-dnd";
          }
          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("@molha/api-contract") || id.includes("@izibuy/")) {
            return "vendor-workspace";
          }
          return "vendor-misc";
        },
      },
    },
  },
  server: {
    host: DEV_SERVER_HOST,
    port: 5173,
    strictPort: true,
    allowedHosts: [".loca.lt", ".ngrok-free.app", ".ngrok.io"],
    open: DEV_CLIENT_ORIGIN,
    proxy: devApiProxy,
  },
  preview: {
    host: DEV_SERVER_HOST,
    port: 4173,
    strictPort: false,
    allowedHosts: [".loca.lt", ".ngrok-free.app", ".ngrok.io"],
    proxy: devApiProxy,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{js,jsx}"],
      exclude: ["src/**/*.test.{js,jsx}", "src/test/**"],
    },
  },
});
