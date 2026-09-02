import { Component } from "react";

import { APP_RUNTIME_UI } from "../../config/appUiCopy.js";
import { isClientSentryEnabled } from "../../lib/clientSentryEnv.js";
import { reloadOnceOnStaleChunk } from "../../lib/reloadOnceOnStaleChunk.js";

import "./AppErrorBoundary.css";

/**
 * Без boundary любой throw в дереве = белый экран до полной перезагрузки вкладки.
 */
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    reloadOnceOnStaleChunk(error);

    // Падение в React сюда и упирается: граница его гасит, до window.onerror
    // оно не доходит, и в Sentry не попадало ничего — а это ровно тот случай,
    // когда пользователь видит сломанный экран.
    if (isClientSentryEnabled()) {
      void import("../../lib/sentryClient.js").then((Sentry) => {
        Sentry.captureException(error, {
          contexts: { react: { componentStack: errorInfo?.componentStack } },
        });
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div className="app-error-boundary" role="alert">
        <p className="app-error-boundary__title">{APP_RUNTIME_UI.CRASH_TITLE}</p>
        <p className="app-error-boundary__text">{APP_RUNTIME_UI.CRASH_TEXT}</p>
        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={this.handleReload}
        >
          {APP_RUNTIME_UI.CRASH_RELOAD}
        </button>
      </div>
    );
  }
}
