import { APP_INTRO_UI } from "../../../shared/config/appUiCopy.js";
import { useAppIntro } from "../../../features/app-intro/model/AppIntroContext.jsx";

import "./SiteFooter.css";

export function SiteFooter() {
  const { replayIntro } = useAppIntro();

  return (
    <footer className="site-footer">
      <button
        type="button"
        className="site-footer__intro-link"
        onClick={replayIntro}
      >
        {APP_INTRO_UI.REPLAY_LINK}
      </button>
    </footer>
  );
}
