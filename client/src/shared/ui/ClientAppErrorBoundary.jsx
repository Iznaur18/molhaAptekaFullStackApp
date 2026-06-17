import { Component, lazy, Suspense } from "react";

import { isClientSentryEnabled } from "../lib/clientSentryEnv.js";

const LazySentryAppErrorBoundary = lazy(() =>
  import("./SentryAppErrorBoundary.jsx").then((module) => ({
    default: module.SentryAppErrorBoundary,
  })),
);

class BasicAppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * @param {{ children: import('react').ReactNode; fallback: import('react').ReactNode }} props
 */
export function ClientAppErrorBoundary({ children, fallback }) {
  if (!isClientSentryEnabled()) {
    return <BasicAppErrorBoundary fallback={fallback}>{children}</BasicAppErrorBoundary>;
  }

  return (
    <Suspense fallback={children}>
      <LazySentryAppErrorBoundary fallback={fallback}>{children}</LazySentryAppErrorBoundary>
    </Suspense>
  );
}
