import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";

import {
  logoutAllLinkedAccounts,
  removeLinkedAccount,
} from "../../../entities/user/api/linkedAccountsApi.js";
import { linkedAccountsQueryKeys } from "../../../entities/user/model/linkedAccountsQueryKeys.js";
import { useLinkedAccountsQuery } from "../../../entities/user/model/useLinkedAccountsQuery.js";
import { UserPremiumAvatar } from "../../../entities/user/ui/UserPremiumAvatar.jsx";
import { UserPremiumDisplayName } from "../../../entities/user/ui/UserPremiumDisplayName.jsx";
import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import { resolveUploadedImageUrl } from "../../../shared/lib/resolveUploadedImageUrl.js";
import { ConfirmButton } from "../../../shared/ui/ConfirmButton/ConfirmButton.jsx";
import { AppIcon } from "../../../shared/ui/icon/index.js";
import { startAddAccount, switchAccountAndReload } from "../lib/accountTransition.js";

import "./AccountSwitcher.css";

const noopPrepare = async () => {};

/**
 * @param {{ name: string; avatarUrl: string | null; isPremium: boolean }} props
 */
function AccountAvatar({ name, avatarUrl, isPremium }) {
  const [failed, setFailed] = useState(false);
  if (avatarUrl && !failed) {
    return (
      <UserPremiumAvatar
        className="account-switcher__avatar"
        src={resolveUploadedImageUrl(avatarUrl)}
        isPremium={isPremium}
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      className="account-switcher__avatar account-switcher__avatar_letter"
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}

/**
 * Список аккаунтов этого браузера: переключение, добавление, «убрать» и
 * «выйти из всех». В профиле — вариант `profile`, на странице входа для
 * гостя — `login` (только сохранённые, без управления).
 *
 * @param {{
 *   variant?: "profile" | "login";
 *   onPrepareAccountChange?: () => Promise<void>;
 * }} props
 */
export function AccountSwitcher({
  variant = "profile",
  onPrepareAccountChange = noopPrepare,
}) {
  const queryClient = useQueryClient();
  const accountsQuery = useLinkedAccountsQuery();
  const [pendingUserId, setPendingUserId] = useState(
    /** @type {string | null} */ (null),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [error, setError] = useState("");

  const accounts = accountsQuery.data?.accounts ?? [];
  const maxAccounts = accountsQuery.data?.maxAccounts ?? 0;
  const activeAccount = accounts.find((account) => account.isActive) ?? null;
  const isProfile = variant === "profile";
  const isBusy = pendingUserId != null || isAdding || isLoggingOutAll;

  if (!isProfile && accounts.length === 0) {
    return null;
  }

  /** @param {() => Promise<void>} action */
  const runWithError = async (action) => {
    setError("");
    try {
      await action();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : ACCOUNT_SWITCHER_UI.ERROR_FALLBACK,
      );
      await queryClient.invalidateQueries({ queryKey: linkedAccountsQueryKeys.all });
    }
  };

  const handleAdd = () =>
    runWithError(async () => {
      setIsAdding(true);
      try {
        await startAddAccount({
          prepare: onPrepareAccountChange,
          returnToUserId: activeAccount?.userId ?? null,
        });
      } finally {
        setIsAdding(false);
      }
    });

  /** @param {{ userId: string; requiresLogin: boolean }} account */
  const handleSelect = (account) =>
    runWithError(async () => {
      setPendingUserId(account.userId);
      try {
        if (account.requiresLogin) {
          // «Войти снова» = добавочный вход; гость просто идёт на форму.
          if (activeAccount) {
            await startAddAccount({
              prepare: onPrepareAccountChange,
              returnToUserId: activeAccount.userId,
            });
          }
          return;
        }
        await switchAccountAndReload({
          userId: account.userId,
          prepare: onPrepareAccountChange,
          targetPath: isProfile ? undefined : "/me",
        });
      } finally {
        setPendingUserId(null);
      }
    });

  /** @param {{ userId: string }} account */
  const handleRemove = (account) =>
    runWithError(async () => {
      const { removedActive } = await removeLinkedAccount(account.userId);
      if (removedActive) {
        window.location.assign("/");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: linkedAccountsQueryKeys.all });
    });

  const handleLogoutAll = () =>
    runWithError(async () => {
      setIsLoggingOutAll(true);
      try {
        await onPrepareAccountChange();
        await logoutAllLinkedAccounts();
        window.location.assign("/");
      } finally {
        setIsLoggingOutAll(false);
      }
    });

  const canAdd = isProfile && activeAccount != null && accounts.length < maxAccounts;

  return (
    <section
      className={`account-switcher account-switcher_${variant}`}
      aria-label={ACCOUNT_SWITCHER_UI.LIST_ARIA}
    >
      <h2 className="account-switcher__title">
        {isProfile ? ACCOUNT_SWITCHER_UI.TITLE : ACCOUNT_SWITCHER_UI.SAVED_TITLE}
      </h2>
      <ul className="account-switcher__list" role="list">
        {accounts.map((account) => {
          const name = account.userName || "—";
          return (
            <li key={account.userId} className="account-switcher__row">
              <button
                type="button"
                className="account-switcher__account"
                disabled={
                  account.isActive || isBusy || (!isProfile && account.requiresLogin)
                }
                aria-current={account.isActive ? "true" : undefined}
                aria-label={
                  account.isActive
                    ? `${ACCOUNT_SWITCHER_UI.ACTIVE_ARIA}: ${name}`
                    : ACCOUNT_SWITCHER_UI.SWITCH_ARIA(name)
                }
                onClick={() => void handleSelect(account)}
              >
                <AccountAvatar
                  name={name}
                  avatarUrl={account.userAvatarUrl}
                  isPremium={account.isPremiumUser}
                />
                <span className="account-switcher__meta">
                  <UserPremiumDisplayName
                    name={name}
                    isPremium={account.isPremiumUser}
                    isUserDataConfirmed={account.isUserDataConfirmed}
                  />
                  {pendingUserId === account.userId ? (
                    <span className="account-switcher__hint">
                      {ACCOUNT_SWITCHER_UI.SWITCHING}
                    </span>
                  ) : account.requiresLogin ? (
                    <span className="account-switcher__hint">
                      {ACCOUNT_SWITCHER_UI.REQUIRES_LOGIN}
                    </span>
                  ) : null}
                </span>
                {account.isActive ? (
                  <AppIcon
                    icon={Check}
                    size="sm"
                    strokeWidth={2.5}
                    className="account-switcher__check"
                  />
                ) : null}
              </button>
              {isProfile && !account.isActive ? (
                <ConfirmButton
                  className="account-switcher__remove"
                  label={ACCOUNT_SWITCHER_UI.REMOVE}
                  question={ACCOUNT_SWITCHER_UI.REMOVE_CONFIRM(name)}
                  disabled={isBusy}
                  variant="popover"
                  onConfirm={() => void handleRemove(account)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      {isProfile ? (
        <div className="account-switcher__actions">
          {canAdd ? (
            <button
              type="button"
              className="account-switcher__add"
              disabled={isBusy}
              onClick={() => void handleAdd()}
            >
              <AppIcon icon={Plus} size="sm" strokeWidth={2.25} />
              {ACCOUNT_SWITCHER_UI.ADD}
            </button>
          ) : activeAccount && maxAccounts > 0 ? (
            <p className="account-switcher__hint">
              {ACCOUNT_SWITCHER_UI.LIMIT_REACHED(maxAccounts)}
            </p>
          ) : null}
          {accounts.length > 1 ? (
            <ConfirmButton
              className="account-switcher__logout-all"
              label={ACCOUNT_SWITCHER_UI.LOGOUT_ALL}
              question={ACCOUNT_SWITCHER_UI.LOGOUT_ALL_CONFIRM}
              disabled={isBusy}
              isPending={isLoggingOutAll}
              onConfirm={() => void handleLogoutAll()}
            />
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="account-switcher__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
