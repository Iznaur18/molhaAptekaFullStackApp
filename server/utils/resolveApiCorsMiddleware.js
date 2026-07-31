import cors from "cors";

import { REQUEST_ID_HEADER } from "../constants/requestLogConstants.js";
import { parseFrontendOrigins } from "./resolveFrontendOrigin.js";

/**
 * @param {boolean | string | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void)} origin
 */
function corsOptionsWithRequestId(origin) {
  return {
    origin,
    credentials: true,
    exposedHeaders: [REQUEST_ID_HEADER],
  };
}

/**
 * Production: только FRONTEND_URL (fail-hard без allowlist).
 * Dev: любой origin (localhost, 127.0.0.1, LAN :5173/:4173) — иначе POST на :4444 → Network Error.
 *
 * @param {boolean} isProduction
 */
export function resolveApiCorsMiddleware(isProduction) {
  if (isProduction) {
    const allowedOrigins = parseFrontendOrigins(process.env.FRONTEND_URL);
    if (allowedOrigins.length === 0) {
      throw new Error(
        "FRONTEND_URL обязателен при NODE_ENV=production (CORS + credentials)",
      );
    }
    const origin = allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;
    return cors(corsOptionsWithRequestId(origin));
  }

  return cors(corsOptionsWithRequestId(true));
}
