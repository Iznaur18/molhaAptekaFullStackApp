import { ChevronRight } from "lucide-react";

import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { useAccountSwitcher } from "../model/useAccountSwitcher.js";
import { LinkedAccountAvatar } from "./LinkedAccountAvatar.jsx";

import "./SavedAccountsList.css";

/**
 * Страница входа: аккаунты, сохранённые на этом устройстве, — войти в один
 * касанием, без пароля. Аккаунт, которому нужен пароль, выбрать нельзя —
 * для него и открыта форма выше.
 */
export function SavedAccountsList() {
  const switcher = useAccountSwitcher({ targetPathAfterSwitch: "/me" });
  const accounts = switcher.accounts.filter((account) => !account.isActive);

  if (accounts.length === 0) {
    return null;
  }

  return (
    <section className="saved-accounts" aria-label={ACCOUNT_SWITCHER_UI.LIST_ARIA}>
      <p className="saved-accounts__title">{ACCOUNT_SWITCHER_UI.SAVED_TITLE}</p>
      <ul className="saved-accounts__list" role="list">
        {accounts.map((account) => {
          const name = account.userName || "—";
          const isPending = switcher.pendingUserId === account.userId;
          return (
            <li key={account.userId}>
              <button
                type="button"
                className="saved-accounts__item"
                disabled={switcher.isBusy || account.requiresLogin}
                aria-label={ACCOUNT_SWITCHER_UI.SWITCH_ARIA(name)}
                onClick={() => void switcher.selectAccount(account)}
              >
                <LinkedAccountAvatar
                  className="saved-accounts__avatar"
                  name={name}
                  avatarUrl={account.userAvatarUrl}
                  isPremium={account.isPremiumUser}
                />
                <span className="saved-accounts__meta">
                  <UserPremiumDisplayName
                    name={name}
                    isPremium={account.isPremiumUser}
                    isUserDataConfirmed={account.isUserDataConfirmed}
                  />
                  {isPending || account.requiresLogin ? (
                    <span className="saved-accounts__hint">
                      {isPending
                        ? ACCOUNT_SWITCHER_UI.SWITCHING
                        : ACCOUNT_SWITCHER_UI.REQUIRES_LOGIN}
                    </span>
                  ) : null}
                </span>
                {account.requiresLogin ? null : (
                  <AppIcon
                    icon={ChevronRight}
                    size="sm"
                    strokeWidth={2.25}
                    className="saved-accounts__chevron"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {switcher.error ? (
        <p className="saved-accounts__error" role="alert">
          {switcher.error}
        </p>
      ) : null}
    </section>
  );
}
