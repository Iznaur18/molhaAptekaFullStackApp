import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  deleteOneCSettings,
  fetchOneCLogs,
  fetchOneCSettings,
  postOneCSync,
  postOneCTest,
  putOneCSettings,
} from "../../../entities/onec/api/onecApi.js";

import { ONEC_INTEGRATION_PAGE_UI as UI } from "../model/onecIntegrationCopy.js";

import "./OneCIntegrationPage.css";

const SETTINGS_KEY = ["onec", "settings"];
const LOGS_KEY = ["onec", "logs"];

/**
 * @param {{
 *   isAuthorized?: boolean;
 *   onRequestLogin?: () => void;
 * }} props
 */
export function OneCIntegrationPage({ isAuthorized = false, onRequestLogin }) {
  const queryClient = useQueryClient();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const settingsQuery = useQuery({
    queryKey: SETTINGS_KEY,
    enabled: isAuthorized,
    queryFn: fetchOneCSettings,
  });

  const logsQuery = useQuery({
    queryKey: LOGS_KEY,
    enabled: isAuthorized,
    queryFn: () => fetchOneCLogs({ limit: 30 }),
  });

  useEffect(() => {
    if (!settingsQuery.data) return;
    setBaseUrl(settingsQuery.data.baseUrl || "");
    setEnabled(settingsQuery.data.enabled === true);
  }, [settingsQuery.data]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    await queryClient.invalidateQueries({ queryKey: LOGS_KEY });
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      putOneCSettings({
        enabled,
        baseUrl,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      }),
    onSuccess: async (result) => {
      setApiKey("");
      setFeedback(result.message || "Сохранено");
      setError("");
      await invalidate();
    },
    onError: (err) => {
      setError(err.message);
      setFeedback("");
    },
  });

  const testMutation = useMutation({
    mutationFn: postOneCTest,
    onSuccess: async (result) => {
      setFeedback(result.message || "OK");
      setError("");
      await invalidate();
    },
    onError: (err) => {
      setError(err.message);
      setFeedback("");
    },
  });

  const syncMutation = useMutation({
    mutationFn: postOneCSync,
    onSuccess: async (result) => {
      setFeedback(result.message || "Обмен выполнен");
      setError("");
      await invalidate();
    },
    onError: (err) => {
      setError(err.message);
      setFeedback("");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: deleteOneCSettings,
    onSuccess: async (result) => {
      setBaseUrl("");
      setApiKey("");
      setEnabled(false);
      setFeedback(result.message || "Отключено");
      setError("");
      await invalidate();
    },
    onError: (err) => {
      setError(err.message);
      setFeedback("");
    },
  });

  if (!isAuthorized) {
    return (
      <section className="onec-page">
        <h1 className="onec-page__title">{UI.TITLE}</h1>
        <p className="onec-page__lead">{UI.AUTH_REQUIRED}</p>
        <button type="button" className="onec-page__btn" onClick={onRequestLogin}>
          {UI.LOGIN_BUTTON}
        </button>
      </section>
    );
  }

  const settings = settingsQuery.data;
  const busy =
    saveMutation.isPending ||
    testMutation.isPending ||
    syncMutation.isPending ||
    disconnectMutation.isPending;

  return (
    <section className="onec-page">
      <header className="onec-page__header">
        <h1 className="onec-page__title">{UI.TITLE}</h1>
        <p className="onec-page__lead">{UI.LEAD}</p>
        <p className="onec-page__hint">{UI.MOCK_HINT}</p>
      </header>

      {settingsQuery.isLoading ? (
        <p className="onec-page__state">{UI.LOADING}</p>
      ) : settingsQuery.isError ? (
        <p className="onec-page__error" role="alert">
          {settingsQuery.error?.message || "Ошибка загрузки"}
        </p>
      ) : (
        <form
          className="onec-page__form"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <label className="onec-page__check">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={busy}
            />
            <span>{UI.LABEL_ENABLED}</span>
          </label>

          <label className="onec-page__field">
            <span>{UI.LABEL_BASE_URL}</span>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={UI.PLACEHOLDER_BASE_URL}
              disabled={busy}
              autoComplete="off"
            />
          </label>

          <label className="onec-page__field">
            <span>{UI.LABEL_API_KEY}</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={UI.PLACEHOLDER_API_KEY}
              disabled={busy}
              autoComplete="new-password"
            />
            {settings?.hasApiKey ? (
              <small>
                {UI.HINT_API_KEY_SET} {settings.apiKeyMasked}. {UI.HINT_LEAVE_KEY}
              </small>
            ) : null}
          </label>

          {settings ? (
            <p className="onec-page__status" role="status">
              {settings.lastSyncStatus === "success"
                ? UI.STATUS_SUCCESS
                : settings.lastSyncStatus === "error"
                  ? UI.STATUS_ERROR
                  : UI.STATUS_IDLE}
              {settings.lastSyncAt
                ? ` · ${new Date(settings.lastSyncAt).toLocaleString("ru-RU")}`
                : ""}
              {settings.lastSyncError ? ` — ${settings.lastSyncError}` : ""}
            </p>
          ) : null}

          {error ? (
            <p className="onec-page__error" role="alert">
              {error}
            </p>
          ) : null}
          {feedback ? (
            <p className="onec-page__ok" role="status">
              {feedback}
            </p>
          ) : null}

          <div className="onec-page__actions">
            <button type="submit" className="onec-page__btn" disabled={busy}>
              {saveMutation.isPending ? UI.SAVE_PENDING : UI.SAVE}
            </button>
            <button
              type="button"
              className="onec-page__btn onec-page__btn_secondary"
              disabled={busy}
              onClick={() => testMutation.mutate()}
            >
              {testMutation.isPending ? UI.TEST_PENDING : UI.TEST}
            </button>
            <button
              type="button"
              className="onec-page__btn onec-page__btn_secondary"
              disabled={busy}
              onClick={() => syncMutation.mutate()}
            >
              {syncMutation.isPending ? UI.SYNC_PENDING : UI.SYNC}
            </button>
            <button
              type="button"
              className="onec-page__btn onec-page__btn_danger"
              disabled={busy}
              onClick={() => {
                if (window.confirm(UI.DISCONNECT_CONFIRM)) {
                  disconnectMutation.mutate();
                }
              }}
            >
              {UI.DISCONNECT}
            </button>
          </div>
        </form>
      )}

      <section className="onec-page__logs">
        <h2 className="onec-page__subtitle">{UI.LOGS_TITLE}</h2>
        {logsQuery.isLoading ? (
          <p className="onec-page__state">{UI.LOADING}</p>
        ) : !logsQuery.data?.length ? (
          <p className="onec-page__state">{UI.LOGS_EMPTY}</p>
        ) : (
          <ul className="onec-page__log-list">
            {logsQuery.data.map((log) => (
              <li key={log._id} className="onec-page__log-item">
                <span
                  className={
                    log.status === "success"
                      ? "onec-page__log-badge onec-page__log-badge_ok"
                      : "onec-page__log-badge onec-page__log-badge_err"
                  }
                >
                  {log.status}
                </span>
                <span className="onec-page__log-dir">{log.direction}</span>
                <span className="onec-page__log-msg">{log.message}</span>
                <time dateTime={log.createdAt}>
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleString("ru-RU")
                    : ""}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
