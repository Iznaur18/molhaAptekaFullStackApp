import { useId, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";

import { YANDEX_DELIVERY_CONNECTION_UI as UI } from "../../../shared/config/appUiCopy.js";
import {
  useMyYandexDeliveryConnectionQuery,
  useRemoveYandexDeliveryConnectionMutation,
  useSaveYandexDeliveryConnectionMutation,
  useToggleYandexDeliveryConnectionMutation,
} from "../model/yandexDeliveryConnectionQueries.js";

import { YandexDropoffPicker } from "./YandexDropoffPicker.jsx";

// Оформление общее с карточкой СДЭК: две службы стоят рядом и должны
// выглядеть одной системой.
import "../../cdek/ui/CdekConnectionCard.css";

/**
 * Подключение Яндекс Доставки в настройках продавца.
 *
 * Токен вводит сам продавец: договор с Яндексом у каждого свой, площадка
 * хранит токен зашифрованным и обратно не показывает.
 */
export function YandexDeliveryConnectionCard() {
  const tokenId = useId();
  const environmentId = useId();
  const connectionQuery = useMyYandexDeliveryConnectionQuery();
  const saveMutation = useSaveYandexDeliveryConnectionMutation();
  const removeMutation = useRemoveYandexDeliveryConnectionMutation();
  const toggleMutation = useToggleYandexDeliveryConnectionMutation();

  const [token, setToken] = useState("");
  const [environment, setEnvironment] = useState("prod");

  const connection = connectionQuery.data;
  const isConnected = connection?.connected === true;
  const isOffered = isConnected && connection?.enabled !== false;
  const error =
    saveMutation.error ??
    removeMutation.error ??
    toggleMutation.error ??
    connectionQuery.error;

  const handleSubmit = (event) => {
    event.preventDefault();
    saveMutation.mutate(
      { token: token.trim(), environment },
      // Токен в поле не держим дольше нужного.
      { onSuccess: () => setToken("") },
    );
  };

  return (
    <section className="cdek-connection-card" aria-label={UI.TITLE}>
      <header className="cdek-connection-card__header">
        <h3 className="cdek-connection-card__title">{UI.TITLE}</h3>
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
          {isConnected ? UI.CONNECTED : UI.NOT_CONNECTED}
        </span>
      </header>

      <p className="cdek-connection-card__subtitle">{UI.SUBTITLE}</p>

      {isConnected ? (
        <label className="cdek-connection-card__toggle">
          <input
            type="checkbox"
            role="switch"
            checked={isOffered}
            disabled={toggleMutation.isPending}
            onChange={(event) => toggleMutation.mutate(event.target.checked)}
          />
          <span>
            <strong>{UI.TOGGLE_LABEL}</strong>
            <small>{isOffered ? UI.TOGGLE_ON_HINT : UI.TOGGLE_OFF_HINT}</small>
          </span>
        </label>
      ) : null}

      {isConnected ? (
        <dl className="cdek-connection-card__facts">
          <div>
            <dt>{UI.TOKEN_MASKED_LABEL}</dt>
            <dd>{connection.tokenMasked}</dd>
          </div>
          <div>
            <dt>{UI.ENVIRONMENT_LABEL}</dt>
            <dd>
              {connection.environment === "test"
                ? UI.ENVIRONMENT_TEST
                : UI.ENVIRONMENT_PROD}
            </dd>
          </div>
          {connection.validatedAt ? (
            <div>
              <dt>{UI.CHECKED_AT}</dt>
              <dd>{new Date(connection.validatedAt).toLocaleString("ru-RU")}</dd>
            </div>
          ) : null}
        </dl>
      ) : (
        <ol className="cdek-connection-card__hint">
          {UI.HOW_TO_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}

      {isConnected ? (
        <YandexDropoffPicker dropoff={connection.dropoff ?? null} />
      ) : null}

      <form className="cdek-connection-card__form" onSubmit={handleSubmit}>
        <label className="cdek-connection-card__field" htmlFor={tokenId}>
          <span>{UI.TOKEN_LABEL}</span>
          <input
            id={tokenId}
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            required
          />
        </label>
        <label className="cdek-connection-card__field" htmlFor={environmentId}>
          <span>{UI.ENVIRONMENT_LABEL}</span>
          <select
            id={environmentId}
            value={environment}
            onChange={(event) => setEnvironment(event.target.value)}
          >
            <option value="prod">{UI.ENVIRONMENT_PROD}</option>
            <option value="test">{UI.ENVIRONMENT_TEST}</option>
          </select>
        </label>

        <p className="cdek-connection-card__hint">
          {isConnected ? UI.REPLACE_HINT : UI.SECURE_HINT}{" "}
          <a href={UI.HOW_TO_LINK} target="_blank" rel="noreferrer noopener">
            {UI.HOW_TO_LINK_LABEL}
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
            disabled={saveMutation.isPending || !token.trim()}
          >
            {saveMutation.isPending ? UI.SUBMIT_PENDING : UI.SUBMIT}
          </button>
          {isConnected ? (
            <button
              type="button"
              className="cdek-connection-card__disconnect"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? UI.DISCONNECT_PENDING : UI.DISCONNECT}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
