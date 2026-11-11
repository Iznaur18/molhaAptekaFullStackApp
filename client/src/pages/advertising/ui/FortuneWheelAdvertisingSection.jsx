import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

import { useMyFortuneWheelConfigQuery } from "../../../entities/fortune-wheel/model/useMyFortuneWheelConfigQuery.js";
import { usePutMyFortuneWheelConfigMutation } from "../../../entities/fortune-wheel/model/usePutMyFortuneWheelConfigMutation.js";
import { FORTUNE_WHEEL_ADVERTISING_UI } from "../../../shared/config/appUiCopy.js";

import "./FortuneWheelAdvertisingSection.css";

const SECTORS_MIN = 2;
const SECTORS_MAX = 8;
const CHANCE_TOTAL = 100;
const DEFAULT_SECTOR = { discountPercent: 10, durationHours: 24, enabled: true };

/**
 * @param {{ discountPercent?: unknown; durationHours?: unknown; chancePercent?: unknown; prizeProductId?: unknown; enabled?: unknown } | null | undefined} sector
 */
function normalizeSectorDraft(sector) {
  return {
    discountPercent: String(
      Math.floor(Number(sector?.discountPercent)) || DEFAULT_SECTOR.discountPercent,
    ),
    durationHours: String(
      Math.floor(Number(sector?.durationHours)) || DEFAULT_SECTOR.durationHours,
    ),
    chancePercent: String(Math.floor(Number(sector?.chancePercent)) || 0),
    prizeProductId:
      typeof sector?.prizeProductId === "string" ? sector.prizeProductId : "",
    enabled: sector?.enabled !== false,
  };
}

/** Ровные шансы на все секции: остаток деления уходит первой секции. */
function evenChances(count) {
  const base = Math.floor(CHANCE_TOTAL / count);
  const remainder = CHANCE_TOTAL - base * count;
  return Array.from({ length: count }, (_, index) =>
    String(base + (index === 0 ? remainder : 0)),
  );
}

/**
 * Настройка «Колеса фортуны» в разделе «Реклама»: включение игры на
 * витрине, 2–8 секций, у каждой — скидка, срок жизни приза, шанс
 * выпадения (сумма шансов — ровно 100%) и выключатель «пусто».
 *
 * @param {{ isAuthorized: boolean }} props
 */
export function FortuneWheelAdvertisingSection({ isAuthorized }) {
  const configQuery = useMyFortuneWheelConfigQuery({ enabled: isAuthorized });
  const saveMutation = usePutMyFortuneWheelConfigMutation();
  const [enabled, setEnabled] = useState(false);
  const [sectorDrafts, setSectorDrafts] = useState(() => {
    const drafts = Array.from({ length: 4 }, () => normalizeSectorDraft(null));
    evenChances(4).forEach((chance, index) => {
      drafts[index].chancePercent = chance;
    });
    return drafts;
  });
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const config = configQuery.data;
    if (!config) {
      return;
    }
    setEnabled(config.enabled === true);
    const loaded = (config.sectors ?? []).map(normalizeSectorDraft);
    if (loaded.length > 0) {
      setSectorDrafts(loaded);
    }
  }, [configQuery.data]);

  if (!isAuthorized) {
    return null;
  }

  const handleSectorsCountChange = (count) => {
    setSectorDrafts((current) => {
      const next =
        count <= current.length
          ? current.slice(0, count)
          : [
              ...current,
              ...Array.from({ length: count - current.length }, () =>
                normalizeSectorDraft(null),
              ),
            ];
      // При смене числа секций шансы перераспределяем поровну — иначе
      // сумма сразу разъезжается, и продавцу приходится править каждую.
      const chances = evenChances(count);
      return next.map((draft, index) => ({ ...draft, chancePercent: chances[index] }));
    });
  };

  const handleSectorChange = (index, field, value) => {
    setSectorDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft,
      ),
    );
  };

  const chanceTotal = sectorDrafts.reduce(
    (total, draft) => total + (Math.floor(Number(draft.chancePercent)) || 0),
    0,
  );
  const chanceTotalOk = chanceTotal === CHANCE_TOTAL;

  const handleSave = async () => {
    setActionError("");
    setFeedback("");
    try {
      await saveMutation.mutateAsync({
        enabled,
        sectors: sectorDrafts.map((draft) => ({
          discountPercent: Math.floor(Number(draft.discountPercent)) || 0,
          durationHours: Math.floor(Number(draft.durationHours)) || 0,
          chancePercent: Math.floor(Number(draft.chancePercent)) || 0,
          prizeProductId: draft.prizeProductId.trim() || null,
          enabled: draft.enabled,
        })),
      });
      setFeedback(FORTUNE_WHEEL_ADVERTISING_UI.SAVE_SUCCESS);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : FORTUNE_WHEEL_ADVERTISING_UI.SAVE_FALLBACK,
      );
    }
  };

  const config = configQuery.data;

  return (
    <article className="advertising-page__card advertising-page__card_category fortune-wheel-admin">
      <div className="advertising-page__card-head">
        <h2 className="advertising-page__card-title">
          {FORTUNE_WHEEL_ADVERTISING_UI.CARD_TITLE}
        </h2>
        <span className="advertising-page__card-badge">
          {FORTUNE_WHEEL_ADVERTISING_UI.CARD_BADGE}
        </span>
      </div>
      <p className="advertising-page__card-lead">
        {FORTUNE_WHEEL_ADVERTISING_UI.DESCRIPTION}
      </p>

      {configQuery.isPending ? (
        <p className="advertising-page__state">
          {FORTUNE_WHEEL_ADVERTISING_UI.LOADING}
        </p>
      ) : null}

      {configQuery.isError ? (
        <p
          className="advertising-page__state advertising-page__state_error"
          role="alert"
        >
          {configQuery.error instanceof Error
            ? configQuery.error.message
            : FORTUNE_WHEEL_ADVERTISING_UI.FETCH_FALLBACK}
        </p>
      ) : null}

      {config ? (
        <div className="fortune-wheel-admin__form">
          <label className="fortune-wheel-admin__toggle">
            <input
              type="checkbox"
              className="fortune-wheel-admin__toggle-input"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            <span className="fortune-wheel-admin__toggle-track" aria-hidden="true">
              <span className="fortune-wheel-admin__toggle-thumb" />
            </span>
            <span className="fortune-wheel-admin__toggle-label">
              {FORTUNE_WHEEL_ADVERTISING_UI.ENABLED_LABEL}
            </span>
          </label>

          <div className="fortune-wheel-admin__count">
            <span className="fortune-wheel-admin__count-label">
              {FORTUNE_WHEEL_ADVERTISING_UI.SECTORS_COUNT_LABEL}
            </span>
            <div className="fortune-wheel-admin__count-chips" role="group">
              {Array.from(
                { length: SECTORS_MAX - SECTORS_MIN + 1 },
                (_, offset) => SECTORS_MIN + offset,
              ).map((count) => (
                <button
                  key={count}
                  type="button"
                  className={[
                    "fortune-wheel-admin__count-chip",
                    sectorDrafts.length === count
                      ? "fortune-wheel-admin__count-chip_active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={sectorDrafts.length === count}
                  onClick={() => handleSectorsCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="fortune-wheel-admin__sectors">
            {sectorDrafts.map((draft, index) => (
              <div
                key={index}
                className={[
                  "fortune-wheel-admin__sector",
                  draft.enabled ? "" : "fortune-wheel-admin__sector_disabled",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="fortune-wheel-admin__sector-head">
                  <p className="fortune-wheel-admin__sector-title">
                    <Gift size={15} aria-hidden="true" />
                    {FORTUNE_WHEEL_ADVERTISING_UI.SECTOR_TITLE(index)}
                  </p>
                  <label
                    className="fortune-wheel-admin__toggle fortune-wheel-admin__toggle_small"
                    aria-label={FORTUNE_WHEEL_ADVERTISING_UI.SECTOR_TOGGLE_ARIA(index)}
                  >
                    <input
                      type="checkbox"
                      className="fortune-wheel-admin__toggle-input"
                      checked={draft.enabled}
                      onChange={(event) =>
                        handleSectorChange(index, "enabled", event.target.checked)
                      }
                    />
                    <span
                      className="fortune-wheel-admin__toggle-track"
                      aria-hidden="true"
                    >
                      <span className="fortune-wheel-admin__toggle-thumb" />
                    </span>
                  </label>
                </div>
                <div className="fortune-wheel-admin__sector-fields">
                  <label className="fortune-wheel-admin__field">
                    <span className="fortune-wheel-admin__field-label">
                      {FORTUNE_WHEEL_ADVERTISING_UI.DISCOUNT_LABEL}
                    </span>
                    <input
                      className="fortune-wheel-admin__input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={90}
                      disabled={!draft.enabled}
                      value={draft.discountPercent}
                      onChange={(event) =>
                        handleSectorChange(index, "discountPercent", event.target.value)
                      }
                    />
                    <small className="fortune-wheel-admin__field-hint">
                      {FORTUNE_WHEEL_ADVERTISING_UI.DISCOUNT_HINT}
                    </small>
                  </label>
                  <label className="fortune-wheel-admin__field">
                    <span className="fortune-wheel-admin__field-label">
                      {FORTUNE_WHEEL_ADVERTISING_UI.DURATION_LABEL}
                    </span>
                    <input
                      className="fortune-wheel-admin__input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={24}
                      disabled={!draft.enabled}
                      value={draft.durationHours}
                      onChange={(event) =>
                        handleSectorChange(index, "durationHours", event.target.value)
                      }
                    />
                    <small className="fortune-wheel-admin__field-hint">
                      {FORTUNE_WHEEL_ADVERTISING_UI.DURATION_HINT}
                    </small>
                  </label>
                  <label className="fortune-wheel-admin__field">
                    <span className="fortune-wheel-admin__field-label">
                      {FORTUNE_WHEEL_ADVERTISING_UI.CHANCE_LABEL}
                    </span>
                    <input
                      className="fortune-wheel-admin__input"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={100}
                      value={draft.chancePercent}
                      onChange={(event) =>
                        handleSectorChange(index, "chancePercent", event.target.value)
                      }
                    />
                    <small className="fortune-wheel-admin__field-hint">
                      {FORTUNE_WHEEL_ADVERTISING_UI.CHANCE_HINT}
                    </small>
                  </label>
                  <label className="fortune-wheel-admin__field">
                    <span className="fortune-wheel-admin__field-label">
                      {FORTUNE_WHEEL_ADVERTISING_UI.PRIZE_PRODUCT_LABEL}
                    </span>
                    <input
                      className="fortune-wheel-admin__input"
                      type="text"
                      inputMode="text"
                      disabled={!draft.enabled}
                      placeholder={
                        FORTUNE_WHEEL_ADVERTISING_UI.PRIZE_PRODUCT_PLACEHOLDER
                      }
                      value={draft.prizeProductId}
                      onChange={(event) =>
                        handleSectorChange(index, "prizeProductId", event.target.value)
                      }
                    />
                    <small className="fortune-wheel-admin__field-hint">
                      {FORTUNE_WHEEL_ADVERTISING_UI.PRIZE_PRODUCT_HINT}
                    </small>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <p
            className={[
              "fortune-wheel-admin__chance-total",
              chanceTotalOk ? "fortune-wheel-admin__chance-total_ok" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role={chanceTotalOk ? "status" : "alert"}
          >
            {chanceTotalOk
              ? FORTUNE_WHEEL_ADVERTISING_UI.CHANCE_TOTAL_OK(chanceTotal)
              : FORTUNE_WHEEL_ADVERTISING_UI.CHANCE_TOTAL_ERROR(chanceTotal)}
          </p>

          <p className="fortune-wheel-admin__stats">
            {FORTUNE_WHEEL_ADVERTISING_UI.STATS(
              config.spinsTotal ?? 0,
              config.winsTotal ?? 0,
            )}
          </p>

          <div className="advertising-page__actions">
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={saveMutation.isPending || !chanceTotalOk}
              onClick={handleSave}
            >
              {saveMutation.isPending
                ? FORTUNE_WHEEL_ADVERTISING_UI.SAVING
                : FORTUNE_WHEEL_ADVERTISING_UI.SAVE}
            </button>
          </div>

          {actionError ? (
            <p
              className="advertising-page__state advertising-page__state_error"
              role="alert"
            >
              {actionError}
            </p>
          ) : null}
          {feedback ? (
            <p className="advertising-page__feedback" role="status">
              {feedback}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
