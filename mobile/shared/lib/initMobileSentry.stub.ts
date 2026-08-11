import type { ComponentType } from "react";

export function isMobileSentryEnabled(): boolean {
  return false;
}

export function initMobileSentry(): boolean {
  return false;
}

export const Sentry = {
  wrap<P extends Record<string, unknown>>(
    Component: ComponentType<P>,
  ): ComponentType<P> {
    return Component;
  },
  addBreadcrumb(_breadcrumb?: unknown): void {
    // no-op without DSN
  },
};
