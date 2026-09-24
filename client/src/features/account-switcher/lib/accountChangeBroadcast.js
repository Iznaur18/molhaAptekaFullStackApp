import { clearDevAuthTokens } from "../../../shared/api/devAuthTokenStorage.js";

/**
 * Cookie сессии общие для всех вкладок: сменили аккаунт в одной — остальные
 * уже ходят в API от нового, а на экране и в локальной корзине держат
 * старый. Их синхронизация записала бы корзину одного аккаунта в другой.
 * Поэтому после смены аккаунта остальные вкладки перезагружаются.
 */

const CHANNEL_NAME = "gitorg-account-change";
/** Фолбэк для браузеров без BroadcastChannel: событие `storage` в других вкладках. */
const STORAGE_KEY = "gitorg-account-change-at";

/**
 * BroadcastChannel доставляет сообщение и другим объектам канала В ЭТОЙ ЖЕ
 * вкладке — без метки вкладка, сменившая аккаунт, перезагружалась бы сама и
 * перебивала свой переход (например, на форму входа).
 */
const TAB_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

/** Сообщить другим вкладкам, что аккаунт в браузере сменился. */
export function notifyAccountChanged() {
  try {
    if (typeof BroadcastChannel === "function") {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ tabId: TAB_ID });
      channel.close();
      return;
    }
    // Событие storage и так не приходит во вкладку, которая писала.
    localStorage.setItem(STORAGE_KEY, `${Date.now()}:${TAB_ID}`);
  } catch (error) {
    console.warn("[account-switcher] tab broadcast failed", error);
  }
}

/**
 * В Vite DEV у каждой вкладки свои Bearer-токены в sessionStorage — их надо
 * стереть, иначе после перезагрузки вкладка вернётся в прежний аккаунт.
 */
function reloadAfterForeignAccountChange() {
  clearDevAuthTokens();
  window.location.reload();
}

/**
 * Перезагружать эту вкладку, когда аккаунт сменили в другой.
 *
 * @param {() => void} [onChange]
 * @returns {() => void} отписка
 */
export function listenAccountChanges(onChange = reloadAfterForeignAccountChange) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (typeof BroadcastChannel === "function") {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.tabId !== TAB_ID) {
        onChange();
      }
    };
    return () => channel.close();
  }

  /** @param {StorageEvent} event */
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
