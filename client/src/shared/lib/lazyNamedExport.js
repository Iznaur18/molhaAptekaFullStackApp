import { lazy } from "react";

import { reloadOnceOnStaleChunk } from "./reloadOnceOnStaleChunk.js";

/**
 * @param {() => Promise<{ default: import("react").ComponentType<any> }>} importFn
 */
async function importWithChunkRecovery(importFn) {
  try {
    return await importFn();
  } catch (error) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 200);
    });
    try {
      return await importFn();
    } catch (retryError) {
      reloadOnceOnStaleChunk(retryError);
      throw retryError;
    }
  }
}

/**
 * @param {() => Promise<Record<string, unknown>>} importFn
 * @param {string} exportName
 */
export function lazyNamedExport(importFn, exportName) {
  return lazy(() =>
    importWithChunkRecovery(async () => {
      const module = await importFn();
      const Comp = module[exportName];
      if (typeof Comp === "undefined") {
        throw new Error(`lazyNamedExport: missing export "${exportName}"`);
      }
      return { default: Comp };
    }),
  );
}
