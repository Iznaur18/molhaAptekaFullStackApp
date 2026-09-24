import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { LinkedAccountAvatar } from "../../../features/account-switcher/ui/LinkedAccountAvatar.jsx";
import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";

/**
 * Группа «Аккаунты» в меню профиля — в том же визуальном языке, что и
 * остальные пункты: строка = nav-button, аватар на месте иконки.
 *
 * @param {{
 *   switcher: ReturnType<typeof import("../../../features/account-switcher/model/useAccountSwitcher.js").useAccountSwitcher>;
 * }} props
 */
export function ProfileSidebarAccounts({ switcher }) {
  const [confirmRemoveId, setConfirmRemoveId] = useState(
    /** @type {string | null} */ (null),
  );

  if (switcher.accounts.length === 0) {
    return null;
  }

  return (
    <div className="my-profile-page__nav-group my-profile-page__nav-group_accounts">
      <p className="my-profile-page__nav-group-label">{ACCOUNT_SWITCHER_UI.TITLE}</p>
      <ul
        className="my-profile-page__nav-list"
        role="list"
        aria-label={ACCOUNT_SWITCHER_UI.LIST_ARIA}
      >
        {switcher.accounts.map((account) => {
          const name = account.userName || "—";

          if (confirmRemoveId === account.userId) {
            return (
              <li key={account.userId} className="my-profile-page__nav-item">
                <div className="my-profile-page__logout-confirm">
                  <p className="my-profile-page__logout-question">
                    {ACCOUNT_SWITCHER_UI.REMOVE_CONFIRM(name)}
                  </p>
                  <div className="my-profile-page__logout-actions">
                    <button
                      type="button"
                      className="my-profile-page__logout-yes"
                      onClick={() => {
                        setConfirmRemoveId(null);
                        void switcher.removeAccount(account);
                      }}
                    >
                      {ACCOUNT_SWITCHER_UI.REMOVE_YES}
                    </button>
                    <button
                      type="button"
                      className="my-profile-page__logout-cancel"
                      onClick={() => setConfirmRemoveId(null)}
                    >
                      {ACCOUNT_SWITCHER_UI.REMOVE_CANCEL}
                    </button>
                  </div>
                </div>
              </li>
            );
          }

          const hint =
            switcher.pendingUserId === account.userId
              ? ACCOUNT_SWITCHER_UI.SWITCHING
              : account.requiresLogin
                ? ACCOUNT_SWITCHER_UI.REQUIRES_LOGIN
                : "";

          return (
            <li
              key={account.userId}
              className="my-profile-page__nav-item my-profile-page__account-item"
            >
              <button
                type="button"
                className={[
                  "my-profile-page__nav-button",
                  "my-profile-page__account-button",
                  account.isActive ? "my-profile-page__nav-button_active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-tone="slate"
                disabled={account.isActive || switcher.isBusy}
                aria-current={account.isActive ? "true" : undefined}
                aria-label={
                  account.isActive
                    ? `${ACCOUNT_SWITCHER_UI.ACTIVE_ARIA}: ${name}`
                    : ACCOUNT_SWITCHER_UI.SWITCH_ARIA(name)
                }
                onClick={() => void switcher.selectAccount(account)}
              >
                <span className="my-profile-page__nav-button-main">
                  <span
                    className="my-profile-page__nav-icon my-profile-page__nav-icon_avatar"
                    aria-hidden="true"
                  >
                    <LinkedAccountAvatar
                      name={name}
                      avatarUrl={account.userAvatarUrl}
                      isPremium={account.isPremiumUser}
                    />
                  </span>
                  <span className="my-profile-page__nav-button-label my-profile-page__account-label">
                    <UserPremiumDisplayName
                      name={name}
                      isPremium={account.isPremiumUser}
                      isUserDataConfirmed={account.isUserDataConfirmed}
                    />
                    {hint ? (
                      <span className="my-profile-page__account-hint">{hint}</span>
                    ) : null}
                  </span>
                </span>
                {account.isActive ? (
                  <AppIcon
                    icon={Check}
                    size="sm"
                    strokeWidth={2.5}
                    className="my-profile-page__account-check"
                  />
                ) : null}
              </button>
              {account.isActive ? null : (
                <button
                  type="button"
                  className="my-profile-page__account-remove"
                  aria-label={ACCOUNT_SWITCHER_UI.REMOVE_ARIA(name)}
                  disabled={switcher.isBusy}
                  onClick={() => setConfirmRemoveId(account.userId)}
                >
                  <AppIcon icon={X} size="sm" strokeWidth={2.25} />
                </button>
              )}
            </li>
          );
        })}

        {switcher.canAdd ? (
          <li className="my-profile-page__nav-item">
            <button
              type="button"
              className="my-profile-page__nav-button"
              data-tone="slate"
              disabled={switcher.isBusy}
              onClick={() => void switcher.addAccount()}
            >
              <span className="my-profile-page__nav-button-main">
                <span className="my-profile-page__nav-icon" aria-hidden="true">
                  <AppIcon icon={Plus} size="sm" strokeWidth={2.25} />
                </span>
                <span className="my-profile-page__nav-button-label">
                  {ACCOUNT_SWITCHER_UI.ADD}
                </span>
              </span>
            </button>
          </li>
        ) : null}
      </ul>

      {switcher.isLimitReached ? (
        <p className="my-profile-page__account-note">
          {ACCOUNT_SWITCHER_UI.LIMIT_REACHED(switcher.maxAccounts)}
        </p>
      ) : null}
      {switcher.error ? (
        <p
          className="my-profile-page__account-note my-profile-page__account-note_error"
          role="alert"
        >
          {switcher.error}
        </p>
      ) : null}
    </div>
  );
}
