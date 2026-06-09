import cors from "cors";

import { REQUEST_ID_HEADER } from "../constants/requestLogConstants.js";

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
 * Production: только FRONTEND_URL.
 * Dev: любой origin (localhost, 127.0.0.1, LAN :5173/:4173) — иначе POST на :4444 → Network Error.
 *
 * @param {boolean} isProduction
 */
export function resolveApiCorsMiddleware(isProduction) {
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  if (isProduction && frontendUrl) {
    return cors(corsOptionsWithRequestId(frontendUrl));
  }

  return cors(corsOptionsWithRequestId(true));
}
