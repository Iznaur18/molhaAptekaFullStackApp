import { Component } from "react";

import { APP_RUNTIME_UI } from "../../config/appUiCopy.js";
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

  componentDidCatch(error) {
    reloadOnceOnStaleChunk(error);
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
