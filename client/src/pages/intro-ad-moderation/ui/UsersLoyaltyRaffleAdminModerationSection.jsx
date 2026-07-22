import { INTRO_AD_MODERATION_SECTION_USERS_RAFFLE } from "../lib/introAdModerationSectionFilters.js";
import { buildIntroAdModerationZonePanelClass } from "../lib/introAdModerationSectionZone.js";
import { UsersLoyaltyRaffleAdminPanel } from "../../raffles-staff/ui/UsersLoyaltyRaffleAdminPanel.jsx";

export function UsersLoyaltyRaffleAdminModerationSection() {
  return (
    <section className="intro-ad-moderation-page__section">
      <div className={buildIntroAdModerationZonePanelClass(INTRO_AD_MODERATION_SECTION_USERS_RAFFLE)}>
        <UsersLoyaltyRaffleAdminPanel />
      </div>
    </section>
  );
}
