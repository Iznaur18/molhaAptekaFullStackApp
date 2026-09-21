import { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { YANDEX_DELIVERY_CONNECTION_UI as UI } from "../../../shared/config/appUiCopy.js";
import { fetchYandexDropoffPoints } from "../api/yandexDeliveryCredentialsApi.js";
import { useSaveYandexDropoffMutation } from "../model/yandexDeliveryConnectionQueries.js";

/**
 * Пункт Яндекса, куда продавец сдаёт посылки. Без него Яндекс не посчитает
 * ни одной доставки, поэтому покупатели Яндекс не увидят, пока пункт не выбран.
 *
 * @param {{ dropoff: { id: string; name: string; address: string } | null }} props
 */
export function YandexDropoffPicker({ dropoff }) {
  const cityId = useId();
  const pointId = useId();
  const [city, setCity] = useState("");
  const [stationId, setStationId] = useState("");
  const pointsMutation = useMutation({
    mutationFn: fetchYandexDropoffPoints,
    onSuccess: () => setStationId(""),
  });
  const saveMutation = useSaveYandexDropoffMutation();
  const points = pointsMutation.data ?? [];
  const error = pointsMutation.error ?? saveMutation.error;

  const find = () => {
    if (city.trim().length >= 2) pointsMutation.mutate(city.trim());
  };

  return (
    <div className="cdek-connection-card__form">
      <strong>{UI.DROPOFF_TITLE}</strong>
      <p className="cdek-connection-card__hint">{UI.DROPOFF_HINT}</p>
      {dropoff ? (
        <p className="cdek-connection-card__hint">
          {UI.DROPOFF_CURRENT}: {dropoff.address || dropoff.name}
        </p>
      ) : (
        <p className="cdek-connection-card__error" role="status">
          {UI.DROPOFF_MISSING}
        </p>
      )}

      <label className="cdek-connection-card__field" htmlFor={cityId}>
        <span>{UI.DROPOFF_CITY_LABEL}</span>
        <input
          id={cityId}
          type="text"
          value={city}
          placeholder={UI.DROPOFF_CITY_PLACEHOLDER}
          onChange={(event) => setCity(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              find();
            }
          }}
        />
      </label>
      <div className="cdek-connection-card__actions">
        <button
          type="button"
          className="cdek-connection-card__disconnect"
          onClick={find}
          disabled={pointsMutation.isPending || city.trim().length < 2}
        >
          {pointsMutation.isPending ? UI.DROPOFF_FIND_PENDING : UI.DROPOFF_FIND}
        </button>
      </div>

      {pointsMutation.isSuccess && points.length === 0 ? (
        <p className="cdek-connection-card__hint">{UI.DROPOFF_EMPTY}</p>
      ) : null}

      {points.length > 0 ? (
        <>
          <label className="cdek-connection-card__field" htmlFor={pointId}>
            <span>{UI.DROPOFF_POINT_LABEL}</span>
            <select
              id={pointId}
              value={stationId}
              onChange={(event) => setStationId(event.target.value)}
            >
              <option value="">—</option>
              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.address || point.name}
                </option>
              ))}
            </select>
          </label>
          <div className="cdek-connection-card__actions">
            <button
              type="button"
              className="cdek-connection-card__submit"
              onClick={() => saveMutation.mutate(stationId)}
              disabled={!stationId || saveMutation.isPending}
            >
              {saveMutation.isPending ? UI.DROPOFF_SAVE_PENDING : UI.DROPOFF_SAVE}
            </button>
          </div>
        </>
      ) : null}

      {error ? (
        <p className="cdek-connection-card__error" role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
