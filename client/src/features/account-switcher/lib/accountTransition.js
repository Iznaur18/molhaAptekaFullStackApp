import {
  registerWebPushSubscription,
  removeWebPushSubscription,
} from "../../../entities/web-push/api/webPushSubscriptionApi.js";
import {
  stashActiveAccount,
  switchLinkedAccount,
} from "../../../entities/user/api/linkedAccountsApi.js";
import { isWebPushSupported } from "../../web-push/lib/webPushBrowser.js";
import { notifyAccountChanged } from "./accountChangeBroadcast.js";

/** `/login?addAccount=1&returnTo=<userId>` — вход во второй аккаунт. */
export const ADD_ACCOUNT_QUERY_PARAM = "addAccount";
export const ADD_ACCOUNT_RETURN_TO_PARAM = "returnTo";

/**
 * Push-подписка этого браузера, если пользователь её включал. Новую не создаём.
 *
 * @returns {Promise<PushSubscription | null>}
 */
async function readBrowserPushSubscription() {
  if (!isWebPushSupported()) {
    return null;
  }
  const registration = await navigator.serviceWorker.getRegistration("/");
  return registration ? registration.pushManager.getSubscription() : null;
}

/**
 * Push приходят только активному аккаунту: перед уходом снимаем подписку
 * браузера с текущего. Звать, пока сессия текущего аккаунта ещё жива.
 * Сбой push не должен блокировать переключение.
 */
export async function detachBrowserPush() {
  try {
    const subscription = await readBrowserPushSubscription();
    if (subscription) {
      await removeWebPushSubscription(subscription.endpoint);
    }
  } catch (error) {
    console.warn("[account-switcher] push detach failed", error);
  }
}

/** Вешает подписку браузера (если есть) на аккаунт, который теперь активен. */
export async function attachBrowserPushToActiveAccount() {
  try {
    const subscription = await readBrowserPushSubscription();
    if (subscription) {
      await registerWebPushSubscription(subscription.toJSON());
    }
  } catch (error) {
    console.warn("[account-switcher] push attach failed", error);
  }
}

/**
 * Полная перезагрузка вместо SPA-навигации: у каждого аккаунта свои корзина,
 * уведомления, кэш запросов — так ничего от прошлого аккаунта не просочится.
 * Другие вкладки тоже перезагружаются (см. accountChangeBroadcast).
 *
 * @param {string} path
 */
export function reloadIntoAccount(path) {
  notifyAccountChanged();
  window.location.assign(path);
}

/**
 * @param {{
 *   userId: string;
 *   prepare: () => Promise<void>;
 *   targetPath?: string;
 *   pushAlreadyDetached?: boolean;
 * }} params
 */
export async function switchAccountAndReload({
  userId,
  prepare,
  targetPath,
  pushAlreadyDetached = false,
}) {
  await prepare();
  if (!pushAlreadyDetached) {
    await detachBrowserPush();
  }
  try {
    await switchLinkedAccount(userId);
  } catch (error) {
    // Остались в прежнем аккаунте — возвращаем ему push.
    await attachBrowserPushToActiveAccount();
    throw error;
  }
  await attachBrowserPushToActiveAccount();
  reloadIntoAccount(
    targetPath ?? `${window.location.pathname}${window.location.search}`,
  );
}

/**
 * Откладывает текущий аккаунт (без выхода) и открывает вход во второй.
 *
 * @param {{ prepare: () => Promise<void>; returnToUserId: string | null }} params
 */
export async function startAddAccount({ prepare, returnToUserId }) {
  await prepare();
  await detachBrowserPush();
  try {
    await stashActiveAccount();
  } catch (error) {
    await attachBrowserPushToActiveAccount();
    throw error;
  }
  const query = new URLSearchParams({ [ADD_ACCOUNT_QUERY_PARAM]: "1" });
  if (returnToUserId) {
    query.set(ADD_ACCOUNT_RETURN_TO_PARAM, returnToUserId);
  }
  reloadIntoAccount(`/login?${query.toString()}`);
}
