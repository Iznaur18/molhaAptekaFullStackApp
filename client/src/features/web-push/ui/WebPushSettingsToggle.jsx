import { useCallback, useEffect, useState } from "react";

import {
  fetchWebPushVapidPublicKey,
  registerWebPushSubscription,
  removeWebPushSubscription,
} from "../../../entities/web-push/api/webPushSubscriptionApi.js";
import { WEB_PUSH_SETTINGS_UI } from "../../../shared/config/appUiCopy.js";
import {
  ensurePushServiceWorker,
  getExistingPushSubscription,
  isWebPushSupported,
  urlBase64ToUint8Array,
} from "../lib/webPushBrowser.js";

import "./WebPushSettingsToggle.css";

/**
 * @param {{ isAuthorized: boolean }} props
 */
export function WebPushSettingsToggle({ isAuthorized }) {
  const supported = isWebPushSupported();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [permission, setPermission] = useState(
    () => (typeof Notification !== "undefined" ? Notification.permission : "default"),
  );

  const refreshState = useCallback(async () => {
    if (!supported || !isAuthorized) {
      setEnabled(false);
      return;
    }
    try {
      const registration = await ensurePushServiceWorker();
      const subscription = await getExistingPushSubscription(registration);
      setEnabled(Boolean(subscription));
      setPermission(Notification.permission);
    } catch {
      setEnabled(false);
    }
  }, [isAuthorized, supported]);

  useEffect(() => {
    void refreshState();
  }, [refreshState]);

  const handleEnable = useCallback(async () => {
    setError("");
    setBusy(true);
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      if (permissionResult !== "granted") {
        setError(WEB_PUSH_SETTINGS_UI.ERROR_PERMISSION);
        return;
      }
      const registration = await ensurePushServiceWorker();
      const publicKey = await fetchWebPushVapidPublicKey();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await registerWebPushSubscription(subscription.toJSON());
      setEnabled(true);
    } catch (enableError) {
      setError(
        enableError instanceof Error
          ? enableError.message
          : WEB_PUSH_SETTINGS_UI.ERROR_PERMISSION,
      );
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }, []);

  const handleDisable = useCallback(async () => {
    setError("");
    setBusy(true);
    try {
      const registration = await ensurePushServiceWorker();
      const subscription = await getExistingPushSubscription(registration);
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await removeWebPushSubscription(endpoint);
      }
      setEnabled(false);
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : "Не удалось отключить push",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="web-push-settings-toggle">
      <p className="web-push-settings-toggle__label">{WEB_PUSH_SETTINGS_UI.LABEL}</p>
      {!supported ? (
        <p className="web-push-settings-toggle__hint">{WEB_PUSH_SETTINGS_UI.UNSUPPORTED}</p>
      ) : (
        <>
          <div className="web-push-settings-toggle__row" role="group" aria-label={WEB_PUSH_SETTINGS_UI.LABEL}>
            <button
              type="button"
              className={[
                "web-push-settings-toggle__chip",
                enabled ? "web-push-settings-toggle__chip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={enabled}
              disabled={busy || (enabled && permission === "granted")}
              onClick={() => {
                void handleEnable();
              }}
            >
              {busy ? WEB_PUSH_SETTINGS_UI.PENDING : WEB_PUSH_SETTINGS_UI.ENABLE}
            </button>
            <button
              type="button"
              className={[
                "web-push-settings-toggle__chip",
                !enabled ? "web-push-settings-toggle__chip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={!enabled}
              disabled={busy || !enabled}
              onClick={() => {
                void handleDisable();
              }}
            >
              {WEB_PUSH_SETTINGS_UI.DISABLE}
            </button>
          </div>
          <p className="web-push-settings-toggle__hint">
            {enabled ? WEB_PUSH_SETTINGS_UI.ENABLED : WEB_PUSH_SETTINGS_UI.DISABLED}
            {" · "}
            {WEB_PUSH_SETTINGS_UI.IOS_HINT}
          </p>
          {error ? <p className="web-push-settings-toggle__error">{error}</p> : null}
        </>
      )}
    </div>
  );
}
