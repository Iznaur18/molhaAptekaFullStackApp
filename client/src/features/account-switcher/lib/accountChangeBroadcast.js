/**
 * Cookie сессии общие для всех вкладок: сменили аккаунт в одной — остальные
 * уже ходят в API от нового, а на экране и в локальной корзине держат
 * старый. Их синхронизация записала бы корзину одного аккаунта в другой.
 * Поэтому после смены аккаунта остальные вкладки перезагружаются.
 */

const CHANNEL_NAME = "gitorg-account-change";
/** Фолбэк для браузеров без BroadcastChannel: событие `storage` в других вкладках. */
const STORAGE_KEY = "gitorg-account-change-at";

/** Сообщить другим вкладкам, что аккаунт в браузере сменился. */
export function notifyAccountChanged() {
  try {
    if (typeof BroadcastChannel === "function") {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage("changed");
      channel.close();
      return;
    }
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch (error) {
    console.warn("[account-switcher] tab broadcast failed", error);
  }
}

/**
 * Перезагружать эту вкладку, когда аккаунт сменили в другой.
 *
 * @param {() => void} [onChange]
 * @returns {() => void} отписка
 */
export function listenAccountChanges(onChange = () => window.location.reload()) {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (typeof BroadcastChannel === "function") {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = () => onChange();
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
