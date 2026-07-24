import "./ProfileListHero.css";

/**
 * @param {{
 *   caption: string;
 *   count: number;
 *   unit: string;
 *   info: string;
 *   tone?: "accent" | "action";
 *   icon?: import("react").ReactNode;
 * }} props
 */
export function ProfileListHero({
  caption,
  count,
  unit,
  info,
  tone = "action",
  icon = null,
}) {
  const ariaLabel = `${caption}: ${count} ${unit}`;

  return (
    <div
      className={`profile-list-hero profile-list-hero_tone_${tone}`}
      aria-label={ariaLabel}
    >
      <div className="profile-list-hero__text">
        <p className="profile-list-hero__caption">{caption}</p>
        <p className="profile-list-hero__row">
          <span className="profile-list-hero__value">{count}</span>
          <span className="profile-list-hero__unit">{unit}</span>
        </p>
        <p className="profile-list-hero__info">{info}</p>
      </div>
      {icon ? (
        <div className="profile-list-hero__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
    </div>
  );
}
