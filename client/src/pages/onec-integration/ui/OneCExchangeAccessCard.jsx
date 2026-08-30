import { useEffect, useState } from "react";

import { ONEC_INTEGRATION_PAGE_UI as UI } from "../model/onecIntegrationCopy.js";

/**
 * @param {{ value: string; label: string }} props
 */
function CopyableValue({ value, label }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Без разрешения на буфер обмена значение всё равно видно и выделяется.
      setCopied(false);
    }
  };

  return (
    <div className="onec-access__row">
      <span className="onec-access__label">{label}</span>
      <code className="onec-access__value">{value}</code>
      <button type="button" className="onec-access__copy" onClick={copy}>
        {copied ? UI.COPIED : UI.COPY}
      </button>
    </div>
  );
}

/**
 * Блок доступов CommerceML: адрес обмена, логин и разовый показ пароля,
 * плюс фильтры типов цен и складов из последней выгрузки.
 *
 * @param {{
 *   settings: Record<string, any>;
 *   issuedPassword: string;
 *   busy: boolean;
 *   priceTypeIds: string[];
 *   warehouseIds: string[];
 *   onGenerate: () => void;
 *   onTogglePriceType: (externalId: string) => void;
 *   onToggleWarehouse: (externalId: string) => void;
 *   isGenerating: boolean;
 * }} props
 */
export function OneCExchangeAccessCard({
  settings,
  issuedPassword,
  busy,
  priceTypeIds,
  warehouseIds,
  onGenerate,
  onTogglePriceType,
  onToggleWarehouse,
  isGenerating,
}) {
  const exchange = settings?.exchange ?? {};
  const knownPriceTypes = exchange.knownPriceTypes ?? [];
  const knownWarehouses = exchange.knownWarehouses ?? [];

  return (
    <section className="onec-access">
      <h2 className="onec-page__subtitle">{UI.ACCESS_TITLE}</h2>
      <p className="onec-page__hint">{UI.ACCESS_HINT}</p>

      <CopyableValue label={UI.LABEL_ENDPOINT} value={exchange.endpointUrl ?? ""} />

      {exchange.login ? (
        <CopyableValue label={UI.LABEL_LOGIN} value={exchange.login} />
      ) : (
        <p className="onec-page__state">{UI.NO_CREDENTIALS}</p>
      )}

      {issuedPassword ? (
        <>
          <CopyableValue label={UI.LABEL_PASSWORD} value={issuedPassword} />
          <p className="onec-page__warn" role="status">
            {UI.PASSWORD_ONCE}
          </p>
        </>
      ) : null}

      <button
        type="button"
        className="onec-page__btn onec-page__btn_secondary"
        disabled={busy}
        onClick={onGenerate}
      >
        {isGenerating
          ? UI.GENERATE_PENDING
          : exchange.hasPassword
            ? UI.REGENERATE_CREDENTIALS
            : UI.GENERATE_CREDENTIALS}
      </button>

      <h3 className="onec-page__subtitle onec-page__subtitle_small">
        {UI.FILTERS_TITLE}
      </h3>
      <p className="onec-page__hint">{UI.FILTERS_HINT}</p>

      <div className="onec-access__filters">
        <fieldset className="onec-access__filter">
          <legend>{UI.PRICE_TYPES_LABEL}</legend>
          {knownPriceTypes.length === 0 ? (
            <p className="onec-page__state">{UI.PRICE_TYPES_EMPTY}</p>
          ) : (
            knownPriceTypes.map((row) => (
              <label key={row.externalId} className="onec-page__check">
                <input
                  type="checkbox"
                  checked={priceTypeIds.includes(row.externalId)}
                  onChange={() => onTogglePriceType(row.externalId)}
                  disabled={busy}
                />
                <span>{row.name || row.externalId}</span>
              </label>
            ))
          )}
        </fieldset>

        <fieldset className="onec-access__filter">
          <legend>{UI.WAREHOUSES_LABEL}</legend>
          {knownWarehouses.length === 0 ? (
            <p className="onec-page__state">{UI.WAREHOUSES_EMPTY}</p>
          ) : (
            knownWarehouses.map((row) => (
              <label key={row.externalId} className="onec-page__check">
                <input
                  type="checkbox"
                  checked={warehouseIds.includes(row.externalId)}
                  onChange={() => onToggleWarehouse(row.externalId)}
                  disabled={busy}
                />
                <span>{row.name || row.externalId}</span>
              </label>
            ))
          )}
        </fieldset>
      </div>
    </section>
  );
}
