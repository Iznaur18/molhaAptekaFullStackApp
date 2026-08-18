import { Suspense } from "react";

import { AppErrorBoundary } from "../../shared/ui/AppErrorBoundary/AppErrorBoundary.jsx";
import { PageChunkFallback } from "../../shared/ui/PageChunkFallback/PageChunkFallback.jsx";

/**
 * @param {{ routeKey: string; children: import('react').ReactNode }} props
 */
export function AppShellRouteSuspense({ routeKey, children }) {
  return (
    <AppErrorBoundary key={routeKey}>
      <Suspense fallback={<PageChunkFallback />}>
        {children}
      </Suspense>
    </AppErrorBoundary>
  );
}
