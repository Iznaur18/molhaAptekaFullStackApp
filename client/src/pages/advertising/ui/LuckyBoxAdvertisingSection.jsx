import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

import { useMyLuckyBoxConfigQuery } from "../../../entities/lucky-box/model/useMyLuckyBoxConfigQuery.js";
import { usePutMyLuckyBoxConfigMutation } from "../../../entities/lucky-box/model/usePutMyLuckyBoxConfigMutation.js";
import { LUCKY_BOX_ADVERTISING_UI } from "../../../shared/config/appUiCopy.js";

import "./LuckyBoxAdvertisingSection.css";

const PRIZES_MIN = 1;
const PRIZES_MAX = 4;
const DEFAULT_PRIZE = { discountPercent: 10, durationHours: 24, enabled: true };

/**
 * @param {{ discountPercent?: unknown; durationHours?: unknown; prizeProductId?: unknown; enabled?: unknown } | null | undefined} prize
 */
function normalizePrizeDraft(prize) {
  return {
    discountPercent: String(
      Math.floor(Number(prize?.discountPercent)) || DEFAULT_PRIZE.discountPercent,
    ),
    durationHours: String(
      Math.floor(Number(prize?.durationHours)) || DEFAULT_PRIZE.durationHours,
    ),
    prizeProductId:
      typeof prize?.prizeProductId === "string" ? prize.prizeProductId : "",
    enabled: prize?.enabled !== false,
  };
}

/**
 * Настройка «Коробок удачи» в разделе «Реклама»: включение игры на витрине,
 * число призов 1–4 и у каждого приза свой выключатель, скидка и срок жизни.
 *
 * @param {{ isAuthorized: boolean }} props
 */
export function LuckyBoxAdvertisingSection({ isAuthorized }) {
  const configQuery = useMyLuckyBoxConfigQuery({ enabled: isAuthorized });
  const saveMutation = usePutMyLuckyBoxConfigMutation();
  const [enabled, setEnabled] = useState(false);
  const [prizeDrafts, setPrizeDrafts] = useState(() => [
    normalizePrizeDraft(null),
    normalizePrizeDraft(null),
  ]);
  const [actionError, setActionError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const config = configQuery.data;
    if (!config) {
      return;
    }
    setEnabled(config.enabled === true);
    const loaded = (config.prizes ?? []).map(normalizePrizeDraft);
    setPrizeDrafts(
      loaded.length > 0
        ? loaded
        : [normalizePrizeDraft(null), normalizePrizeDraft(null)],
    );
  }, [configQuery.data]);

  if (!isAuthorized) {
    return null;
  }

  const handlePrizesCountChange = (count) => {
    setPrizeDrafts((current) => {
      if (count <= current.length) {
        return current.slice(0, count);
      }
      const next = [...current];
      while (next.length < count) {
        next.push(normalizePrizeDraft(null));
      }
      return next;
    });
  };

  const handlePrizeChange = (index, field, value) => {
    setPrizeDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft,
      ),
    );
  };

  const handleSave = async () => {
    setActionError("");
    setFeedback("");
    try {
      await saveMutation.mutateAsync({
        enabled,
        prizes: prizeDrafts.map((draft) => ({
          discountPercent: Math.floor(Number(draft.discountPercent)) || 0,
          durationHours: Math.floor(Number(draft.durationHours)) || 0,
          prizeProductId: draft.prizeProductId.trim() || null,
          enabled: draft.enabled,
        })),
      });
      setFeedback(LUCKY_BOX_ADVERTISING_UI.SAVE_SUCCESS);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : LUCKY_BOX_ADVERTISING_UI.SAVE_FALLBACK,
      );
    }
  };

  const config = configQuery.data;

  return (
    <article className="advertising-page__card advertising-page__card_category lucky-box-admin">
      <div className="advertising-page__card-head">
        <h2 className="advertising-page__card-title">
          {LUCKY_BOX_ADVERTISING_UI.CARD_TITLE}
        </h2>
        <span className="advertising-page__card-badge">
          {LUCKY_BOX_ADVERTISING_UI.CARD_BADGE}
        </span>
      </div>
      <p className="advertising-page__card-lead">
        {LUCKY_BOX_ADVERTISING_UI.DESCRIPTION}
      </p>

      {configQuery.isPending ? (
        <p className="advertising-page__state">{LUCKY_BOX_ADVERTISING_UI.LOADING}</p>
      ) : null}

      {configQuery.isError ? (
        <p
          className="advertising-page__state advertising-page__state_error"
          role="alert"
        >
          {configQuery.error instanceof Error
            ? configQuery.error.message
            : LUCKY_BOX_ADVERTISING_UI.FETCH_FALLBACK}
        </p>
      ) : null}

      {config ? (
        <div className="lucky-box-admin__form">
          <label className="lucky-box-admin__toggle">
            <input
              type="checkbox"
              className="lucky-box-admin__toggle-input"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            <span className="lucky-box-admin__toggle-track" aria-hidden="true">
              <span className="lucky-box-admin__toggle-thumb" />
            </span>
            <span className="lucky-box-admin__toggle-label">
              {LUCKY_BOX_ADVERTISING_UI.ENABLED_LABEL}
            </span>
          </label>

          <div className="lucky-box-admin__count">
            <span className="lucky-box-admin__count-label">
              {LUCKY_BOX_ADVERTISING_UI.PRIZES_COUNT_LABEL}
            </span>
            <div className="lucky-box-admin__count-chips" role="group">
              {Array.from(
                { length: PRIZES_MAX - PRIZES_MIN + 1 },
                (_, offset) => PRIZES_MIN + offset,
              ).map((count) => (
                <button
                  key={count}
                  type="button"
                  className={[
                    "lucky-box-admin__count-chip",
                    prizeDrafts.length === count
                      ? "lucky-box-admin__count-chip_active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={prizeDrafts.length === count}
                  onClick={() => handlePrizesCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="lucky-box-admin__prizes">
            {prizeDrafts.map((draft, index) => (
              <div
                key={index}
                className={[
                  "lucky-box-admin__prize",
                  draft.enabled ? "" : "lucky-box-admin__prize_disabled",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="lucky-box-admin__prize-head">
                  <p className="lucky-box-admin__prize-title">
                    <Gift size={15} aria-hidden="true" />
                    {LUCKY_BOX_ADVERTISING_UI.PRIZE_TITLE(index)}
                  </p>
                  <label
                    className="lucky-box-admin__toggle lucky-box-admin__toggle_small"
                    aria-label={LUCKY_BOX_ADVERTISING_UI.PRIZE_TOGGLE_ARIA(index)}
                  >
                    <input
                      type="checkbox"
                      className="lucky-box-admin__toggle-input"
                      checked={draft.enabled}
                      onChange={(event) =>
                        handlePrizeChange(index, "enabled", event.target.checked)
                      }
                    />
                    <span className="lucky-box-admin__toggle-track" aria-hidden="true">
                      <span className="lucky-box-admin__toggle-thumb" />
                    </span>
                  </label>
                </div>
                <div className="lucky-box-admin__prize-fields">
                  <label className="lucky-box-admin__field">
                    <span className="lucky-box-admin__field-label">
                      {LUCKY_BOX_ADVERTISING_UI.DISCOUNT_LABEL}
                    </span>
                    <input
                      className="lucky-box-admin__input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={90}
                      disabled={!draft.enabled}
                      value={draft.discountPercent}
                      onChange={(event) =>
                        handlePrizeChange(index, "discountPercent", event.target.value)
                      }
                    />
                    <small className="lucky-box-admin__field-hint">
                      {LUCKY_BOX_ADVERTISING_UI.DISCOUNT_HINT}
                    </small>
                  </label>
                  <label className="lucky-box-admin__field">
                    <span className="lucky-box-admin__field-label">
                      {LUCKY_BOX_ADVERTISING_UI.DURATION_LABEL}
                    </span>
                    <input
                      className="lucky-box-admin__input"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={24}
                      disabled={!draft.enabled}
                      value={draft.durationHours}
                      onChange={(event) =>
                        handlePrizeChange(index, "durationHours", event.target.value)
                      }
                    />
                    <small className="lucky-box-admin__field-hint">
                      {LUCKY_BOX_ADVERTISING_UI.DURATION_HINT}
                    </small>
                  </label>
                  <label className="lucky-box-admin__field">
                    <span className="lucky-box-admin__field-label">
                      {LUCKY_BOX_ADVERTISING_UI.PRIZE_PRODUCT_LABEL}
                    </span>
                    <input
                      className="lucky-box-admin__input"
                      type="text"
                      inputMode="text"
                      disabled={!draft.enabled}
                      placeholder={LUCKY_BOX_ADVERTISING_UI.PRIZE_PRODUCT_PLACEHOLDER}
                      value={draft.prizeProductId}
                      onChange={(event) =>
                        handlePrizeChange(index, "prizeProductId", event.target.value)
                      }
                    />
                    <small className="lucky-box-admin__field-hint">
                      {LUCKY_BOX_ADVERTISING_UI.PRIZE_PRODUCT_HINT}
                    </small>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <p className="lucky-box-admin__stats">
            {LUCKY_BOX_ADVERTISING_UI.STATS(
              config.playsTotal ?? 0,
              config.winsTotal ?? 0,
            )}
          </p>

          <div className="advertising-page__actions">
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={saveMutation.isPending}
              onClick={handleSave}
            >
              {saveMutation.isPending
                ? LUCKY_BOX_ADVERTISING_UI.SAVING
                : LUCKY_BOX_ADVERTISING_UI.SAVE}
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
