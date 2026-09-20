import { useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { CDEK_CONNECTION_UI } from "../../../shared/config/appUiCopy.js";
import {
  useMyCdekConnectionQuery,
  useRemoveCdekConnectionMutation,
  useSaveCdekConnectionMutation,
} from "../model/cdekConnectionQueries.js";

import "./CdekConnectionCard.css";

/**
 * Подключение СДЭК в настройках продавца.
 *
 * Ключи вводит сам продавец: у каждого свой договор со СДЭК, площадка их не
 * хранит открытыми и не показывает обратно (docs/product/cdek-per-seller-v1.md).
 */
export function CdekConnectionCard() {
  const connectionQuery = useMyCdekConnectionQuery();
  const saveMutation = useSaveCdekConnectionMutation();
  const removeMutation = useRemoveCdekConnectionMutation();

  const [account, setAccount] = useState("");
  const [secure, setSecure] = useState("");
  const [environment, setEnvironment] = useState("test");

  const connection = connectionQuery.data;
  const isConnected = connection?.connected === true;
  const error = saveMutation.error ?? removeMutation.error ?? connectionQuery.error;

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate(
      { account: account.trim(), secure: secure.trim(), environment },
      {
        onSuccess: () => {
          // Секрет в поле не держим ни секунды дольше нужного.
          setAccount("");
          setSecure("");
        },
      },
    );
  };

  return (
    <section className="cdek-connection-card">
      <header className="cdek-connection-card__header">
        <h3 className="cdek-connection-card__title">{CDEK_CONNECTION_UI.TITLE}</h3>
        <span
          className={[
            "cdek-connection-card__status",
            isConnected
              ? "cdek-connection-card__status--on"
              : "cdek-connection-card__status--off",
          ].join(" ")}
        >
          {isConnected ? (
            <CircleCheck size={16} aria-hidden="true" />
          ) : (
            <CircleAlert size={16} aria-hidden="true" />
          )}
          {isConnected
            ? CDEK_CONNECTION_UI.CONNECTED
            : CDEK_CONNECTION_UI.NOT_CONNECTED}
        </span>
      </header>

      <p className="cdek-connection-card__subtitle">{CDEK_CONNECTION_UI.SUBTITLE}</p>

      {isConnected ? (
        <dl className="cdek-connection-card__facts">
          <div>
            <dt>{CDEK_CONNECTION_UI.ACCOUNT_LABEL}</dt>
            <dd>{connection.accountMasked}</dd>
          </div>
          <div>
            <dt>{CDEK_CONNECTION_UI.ENVIRONMENT_LABEL}</dt>
            <dd>
              {connection.environment === "test"
                ? CDEK_CONNECTION_UI.ENVIRONMENT_TEST
                : CDEK_CONNECTION_UI.ENVIRONMENT_PROD}
            </dd>
          </div>
          {connection.validatedAt ? (
            <div>
              <dt>{CDEK_CONNECTION_UI.CHECKED_AT}</dt>
              <dd>{new Date(connection.validatedAt).toLocaleString("ru-RU")}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <form className="cdek-connection-card__form" onSubmit={handleSubmit}>
        <label className="cdek-connection-card__field">
          <span>{CDEK_CONNECTION_UI.ACCOUNT_LABEL}</span>
          <input
            type="text"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            autoComplete="off"
            required
          />
        </label>
        <label className="cdek-connection-card__field">
          <span>{CDEK_CONNECTION_UI.SECURE_LABEL}</span>
          <input
            type="password"
            value={secure}
            onChange={(event) => setSecure(event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        <label className="cdek-connection-card__field">
          <span>{CDEK_CONNECTION_UI.ENVIRONMENT_LABEL}</span>
          <select
            value={environment}
            onChange={(event) => setEnvironment(event.target.value)}
          >
            <option value="test">{CDEK_CONNECTION_UI.ENVIRONMENT_TEST}</option>
            <option value="prod">{CDEK_CONNECTION_UI.ENVIRONMENT_PROD}</option>
          </select>
        </label>

        <p className="cdek-connection-card__hint">{CDEK_CONNECTION_UI.SECURE_HINT}</p>
        <p className="cdek-connection-card__hint">
          {CDEK_CONNECTION_UI.HOW_TO}{" "}
          <a
            href={CDEK_CONNECTION_UI.HOW_TO_LINK}
            target="_blank"
            rel="noreferrer noopener"
          >
            lk.cdek.ru
          </a>
        </p>

        {error ? (
          <p className="cdek-connection-card__error" role="alert">
            {error.message}
          </p>
        ) : null}

        <div className="cdek-connection-card__actions">
          <button
            type="submit"
            className="cdek-connection-card__submit"
            disabled={saveMutation.isPending || !account.trim() || !secure.trim()}
          >
            {saveMutation.isPending
              ? CDEK_CONNECTION_UI.SUBMIT_PENDING
              : CDEK_CONNECTION_UI.SUBMIT}
          </button>
          {isConnected ? (
            <button
              type="button"
              className="cdek-connection-card__disconnect"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending
                ? CDEK_CONNECTION_UI.DISCONNECT_PENDING
                : CDEK_CONNECTION_UI.DISCONNECT}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
