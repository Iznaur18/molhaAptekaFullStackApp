import { Suspense } from "react";

import { AppErrorBoundary } from "../../shared/ui/AppErrorBoundary/AppErrorBoundary.jsx";

/**
 * @param {{ routeKey: string; children: import('react').ReactNode }} props
 */
export function AppShellRouteSuspense({ routeKey, children }) {
  return (
    <AppErrorBoundary key={routeKey}>
      {/* null — без окна загрузки при lazy-чанке; держим пусто до готовности */}
      <Suspense fallback={null}>{children}</Suspense>
    </AppErrorBoundary>
  );
}
