import mongoose from "mongoose";

import {
  isMongoReadConnectionConfigured,
  isMongoReadConnectionReady,
} from "../db/mongoReadConnection.js";
import { getConfiguredCatalogSearchMode } from "./isProductAtlasSearchEnabled.js";
import { resolveGitCommitSha } from "./resolveGitCommitSha.js";
import { isRateLimitRedisEnabled } from "./rateLimitRedisStore.js";
import { resolveUploadStorageMode } from "./resolveUploadStorageMode.js";

/**
 * @returns {{
 *   status: 'ok' | 'degraded';
 *   mongo: 'connected' | 'disconnected';
 *   mongoRead: 'connected' | 'disconnected' | 'disabled';
 *   uptimeSec: number;
 *   uploadStorage: ReturnType<typeof resolveUploadStorageMode>;
 *   gitCommit: string | null;
 *   rateLimitStore: 'redis' | 'memory';
 *   catalogSearch: ReturnType<typeof getConfiguredCatalogSearchMode>;
 * }}
 */
export function buildHealthPayload() {
  const mongoReady = mongoose.connection.readyState === 1;
  const mongoRead = !isMongoReadConnectionConfigured()
    ? "disabled"
    : isMongoReadConnectionReady()
      ? "connected"
      : "disconnected";

  const status =
    mongoReady && (mongoRead === "disabled" || mongoRead === "connected")
      ? "ok"
      : "degraded";

  return {
    status,
    mongo: mongoReady ? "connected" : "disconnected",
    mongoRead,
    uptimeSec: Math.floor(process.uptime()),
    uploadStorage: resolveUploadStorageMode(),
    gitCommit: resolveGitCommitSha(),
    rateLimitStore: isRateLimitRedisEnabled() ? "redis" : "memory",
    catalogSearch: getConfiguredCatalogSearchMode(),
  };
}
