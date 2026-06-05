import { lazy } from "react";

/**
 * @param {() => Promise<Record<string, unknown>>} importFn
 * @param {string} exportName
 */
export function lazyNamedExport(importFn, exportName) {
  return lazy(() =>
    importFn().then((module) => ({
      default: module[exportName],
    })),
  );
}
