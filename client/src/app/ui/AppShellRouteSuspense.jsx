import { Suspense } from "react";

import { PageChunkFallback } from "../../shared/ui/PageChunkFallback/PageChunkFallback.jsx";

/**
 * @param {{ routeKey: string; children: import('react').ReactNode }} props
 */
export function AppShellRouteSuspense({ routeKey, children }) {
  return (
    <Suspense key={routeKey} fallback={<PageChunkFallback />}>
      {children}
    </Suspense>
  );
}
