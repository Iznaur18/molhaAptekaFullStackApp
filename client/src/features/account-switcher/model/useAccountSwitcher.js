import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  logoutAllLinkedAccounts,
  removeLinkedAccount,
} from "../../../entities/user/api/linkedAccountsApi.js";
import { linkedAccountsQueryKeys } from "../../../entities/user/model/linkedAccountsQueryKeys.js";
import { useLinkedAccountsQuery } from "../../../entities/user/model/useLinkedAccountsQuery.js";
import { ACCOUNT_SWITCHER_UI } from "../../../shared/config/appUiCopy.js";
import {
  detachBrowserPush,
  reloadIntoAccount,
  startAddAccount,
  switchAccountAndReload,
} from "../lib/accountTransition.js";

const noopPrepare = async () => {};

/**
 * Состояние и действия переключателя аккаунтов. Разметку рисует тот, кто
 * встраивает (меню профиля, страница входа) — в своём визуальном языке.
 *
 * @param {{
 *   onPrepareAccountChange?: () => Promise<void>;
 *   targetPathAfterSwitch?: string;
 * }} [params]
 */
export function useAccountSwitcher({
  onPrepareAccountChange = noopPrepare,
  targetPathAfterSwitch,
} = {}) {
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
  const isBusy = pendingUserId != null || isAdding || isLoggingOutAll;

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

  const addAccount = () =>
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
  const selectAccount = (account) =>
    runWithError(async () => {
      setPendingUserId(account.userId);
      try {
        if (account.requiresLogin) {
          // «Войти снова» = добавочный вход; у гостя форма входа уже открыта.
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
          targetPath: targetPathAfterSwitch,
        });
      } finally {
        setPendingUserId(null);
      }
    });

  /** @param {{ userId: string }} account */
  const removeAccount = (account) =>
    runWithError(async () => {
      const { removedActive } = await removeLinkedAccount(account.userId);
      if (removedActive) {
        reloadIntoAccount("/");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: linkedAccountsQueryKeys.all });
    });

  const logoutAll = () =>
    runWithError(async () => {
      setIsLoggingOutAll(true);
      try {
        await onPrepareAccountChange();
        await detachBrowserPush();
        await logoutAllLinkedAccounts();
        reloadIntoAccount("/");
      } finally {
        setIsLoggingOutAll(false);
      }
    });

  return {
    accounts,
    maxAccounts,
    activeAccount,
    pendingUserId,
    isBusy,
    isLoggingOutAll,
    error,
    canAdd: activeAccount != null && accounts.length < maxAccounts,
    isLimitReached:
      activeAccount != null && maxAccounts > 0 && accounts.length >= maxAccounts,
    addAccount,
    selectAccount,
    removeAccount,
    logoutAll,
  };
}
