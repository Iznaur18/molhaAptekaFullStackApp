import { useId, useState } from "react";

import { useSaveYandexExpressMutation } from "../model/yandexDeliveryConnectionQueries.js";

const UI = {
  TITLE: "Экспресс-курьер",
  HINT: "Курьер Яндекса за 1–2 часа отвезёт заказ от вашей точки продажи до двери покупателя. Покупатель оплачивает товар и доставку курьеру картой, курьера вызываете вы кнопкой в «Моих продажах».",
  TOGGLE: "Предлагать «Экспресс» покупателям",
  PHONE: "Телефон, по которому курьер вам позвонит",
  PICKUP: "Курьер заберёт заказ отсюда",
  NO_PICKUP:
    "Добавьте точку продажи с адресом на карте в разделе «Доставка и оплата» — оттуда курьер заберёт заказ.",
  SAVE: "Сохранить телефон",
  SAVE_PENDING: "Сохраняем…",
  NOT_READY: "Покупатели пока не видят «Экспресс»: включите его и укажите телефон.",
};

/**
 * Настройки «Экспресса» внутри подключения Яндекс Доставки.
 *
 * @param {{ express: { enabled: boolean; phone: string; pickupAddress: string; ready: boolean } | null | undefined }} props
 */
export function YandexExpressSettings({ express }) {
  const phoneId = useId();
  const saveMutation = useSaveYandexExpressMutation();
  const [phone, setPhone] = useState(express?.phone ?? "");
  const enabled = express?.enabled === true;
  const trimmedPhone = phone.trim();

  return (
    <div className="cdek-connection-card__form" aria-label={UI.TITLE}>
      <strong>{UI.TITLE}</strong>
      <p className="cdek-connection-card__hint">{UI.HINT}</p>

      <label className="cdek-connection-card__field" htmlFor={phoneId}>
        <span>{UI.PHONE}</span>
        <input
          id={phoneId}
          type="tel"
          value={phone}
          autoComplete="tel"
          placeholder="+7 9XX XXX-XX-XX"
          onChange={(event) => setPhone(event.target.value)}
        />
      </label>
      {trimmedPhone !== (express?.phone ?? "") ? (
        <div className="cdek-connection-card__actions">
          <button
            type="button"
            className="cdek-connection-card__submit"
            disabled={saveMutation.isPending || !trimmedPhone}
            onClick={() => saveMutation.mutate({ enabled, phone: trimmedPhone })}
          >
            {saveMutation.isPending ? UI.SAVE_PENDING : UI.SAVE}
          </button>
        </div>
      ) : null}

      <label className="cdek-connection-card__toggle">
        <input
          type="checkbox"
          role="switch"
          checked={enabled}
          disabled={saveMutation.isPending}
          onChange={(event) =>
            saveMutation.mutate({
              enabled: event.target.checked,
              ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            })
          }
        />
        <span>
          <strong>{UI.TOGGLE}</strong>
        </span>
      </label>

      <dl className="cdek-connection-card__facts">
        <div>
          <dt>{UI.PICKUP}</dt>
          <dd>{express?.pickupAddress || UI.NO_PICKUP}</dd>
        </div>
      </dl>

      {express && !express.ready ? (
        <p className="cdek-connection-card__hint">{UI.NOT_READY}</p>
      ) : null}
      {saveMutation.error ? (
        <p className="cdek-connection-card__error" role="alert">
          {saveMutation.error.message}
        </p>
      ) : null}
    </div>
  );
}
