import http from "node:http";

import { createApp } from "../../createApp.js";

/**
 * @returns {Promise<{
 *   server: import('node:http').Server;
 *   baseUrl: string;
 *   request: (path: string, init?: RequestInit) => Promise<Response>;
 * }>}
 */
export const startHttpTestServer = async () => {
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind test HTTP server");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const request = (path, init) => fetch(`${baseUrl}${path}`, init);

  return { server, baseUrl, request };
};

export const stopHttpTestServer = async (server) => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(undefined);
    });
  });
};

/**
 * @param {Headers} headers
 */
export const getSetCookieHeader = (headers) => {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const raw = headers.get("set-cookie");
  return raw ? [raw] : [];
};

/**
 * @param {Headers} headers
 */
export const buildCookieHeader = (headers) => {
  const cookies = getSetCookieHeader(headers);
  return cookies.map((row) => row.split(";")[0]).join("; ");
};
