import mongoose from "mongoose";

import { getConfiguredCatalogSearchMode } from "./isProductAtlasSearchEnabled.js";
import { resolveGitCommitSha } from "./resolveGitCommitSha.js";
import { isRateLimitRedisEnabled } from "./rateLimitRedisStore.js";
import { resolveUploadStorageMode } from "./resolveUploadStorageMode.js";

/**
 * @returns {{
 *   status: 'ok' | 'degraded';
 *   mongo: 'connected' | 'disconnected';
 *   uptimeSec: number;
 *   uploadStorage: ReturnType<typeof resolveUploadStorageMode>;
 *   gitCommit: string | null;
 *   rateLimitStore: 'redis' | 'memory';
 *   catalogSearch: ReturnType<typeof getConfiguredCatalogSearchMode>;
 * }}
 */
export function buildHealthPayload() {
  const mongoReady = mongoose.connection.readyState === 1;

  return {
    status: mongoReady ? "ok" : "degraded",
    mongo: mongoReady ? "connected" : "disconnected",
    uptimeSec: Math.floor(process.uptime()),
    uploadStorage: resolveUploadStorageMode(),
    gitCommit: resolveGitCommitSha(),
    rateLimitStore: isRateLimitRedisEnabled() ? "redis" : "memory",
    catalogSearch: getConfiguredCatalogSearchMode(),
  };
}
