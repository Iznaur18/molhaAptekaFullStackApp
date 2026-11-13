import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

import { useMyLuckyBoxConfigQuery } from "../../../entities/lucky-box/model/useMyLuckyBoxConfigQuery.js";
import { usePutMyLuckyBoxConfigMutation } from "../../../entities/lucky-box/model/usePutMyLuckyBoxConfigMutation.js";
import { LUCKY_BOX_ADVERTISING_UI as UI } from "../../../shared/config/appUiCopy.js";

import "./LuckyBoxAdvertisingSection.css";

const BOXES_TOTAL = 6;
const PRIZES_MIN = 1;
const PRIZES_MAX = 4;
const DEFAULT_PRIZE = { discountPercent: 10, durationHours: 24, enabled: true };
/** Конструктор: скидки чипами; нестандартное значение добавляется своим чипом. */
const DISCOUNT_CHOICES = [5, 10, 15, 20, 25, 30];

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
 * Конструктор умеет только «простые» конфиги: все призы включены, без
 * товара-приза, срок — 24 часа. Возвращает скидки призов или null (тогда
 * открываем расширенный режим).
 */
function matchBuilderShape(prizes) {
  if (
    !Array.isArray(prizes) ||
    prizes.length < PRIZES_MIN ||
    prizes.length > PRIZES_MAX
  ) {
    return null;
  }
  const simple = prizes.every(
    (prize) =>
      prize?.enabled !== false &&
      !prize?.prizeProductId &&
      Math.floor(Number(prize?.durationHours)) === DEFAULT_PRIZE.durationHours,
  );
  if (!simple) {
    return null;
  }
  return prizes.map(
    (prize) =>
      Math.floor(Number(prize?.discountPercent)) || DEFAULT_PRIZE.discountPercent,
  );
}

/**
 * Настройка «Коробок удачи» в разделе «Реклама». По умолчанию — наглядный
 * конструктор: сетка коробок, как у покупателя, и палитра скидок. Полная
 * форма (сроки, товар-приз, выключатели призов) — за ссылкой «Расширенная
 * настройка».
 *
 * @param {{ isAuthorized: boolean }} props
 */
export function LuckyBoxAdvertisingSection({ isAuthorized }) {
  const configQuery = useMyLuckyBoxConfigQuery({ enabled: isAuthorized });
  const saveMutation = usePutMyLuckyBoxConfigMutation();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("builder");
  /** Конструктор: скидки призовых коробок; остальные коробки — пустые. */
  const [prizeDiscounts, setPrizeDiscounts] = useState(() => [10, 15]);
  const [selectedBox, setSelectedBox] = useState(null);
  /** Расширенный режим: полные черновики призов. */
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
    const discounts = matchBuilderShape(config.prizes);
    if (discounts) {
      setPrizeDiscounts(discounts);
      setSelectedBox(null);
      setMode("builder");
      return;
    }
    const loaded = (config.prizes ?? []).map(normalizePrizeDraft);
    setPrizeDrafts(
      loaded.length > 0
        ? loaded
        : [normalizePrizeDraft(null), normalizePrizeDraft(null)],
    );
    setMode("advanced");
  }, [configQuery.data]);

  if (!isAuthorized) {
    return null;
  }

  /* --- Конструктор --- */

  const handleBoxClick = (index) => {
    if (index < prizeDiscounts.length) {
      setSelectedBox(index);
      return;
    }
    if (prizeDiscounts.length >= PRIZES_MAX) {
      return;
    }
    setPrizeDiscounts((current) => [...current, DEFAULT_PRIZE.discountPercent]);
    setSelectedBox(prizeDiscounts.length);
  };

  const handlePaletteDiscount = (value) => {
    if (selectedBox === null || selectedBox >= prizeDiscounts.length) {
      return;
    }
    setPrizeDiscounts((current) =>
      current.map((discount, index) => (index === selectedBox ? value : discount)),
    );
  };

  const handlePaletteEmpty = () => {
    if (selectedBox === null || prizeDiscounts.length <= PRIZES_MIN) {
      return;
    }
    setPrizeDiscounts((current) => current.filter((_, index) => index !== selectedBox));
    setSelectedBox(null);
  };

  /* --- Расширенный режим --- */

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

  /** Конструктор → расширенный: раскладываем скидки в полную форму. */
  const switchToAdvanced = () => {
    setPrizeDrafts(
      prizeDiscounts.map((discount) =>
        normalizePrizeDraft({ discountPercent: discount }),
      ),
    );
    setMode("advanced");
  };

  /** Расширенный → конструктор: сроки и товары-призы сбрасываются. */
  const switchToBuilder = () => {
    setPrizeDiscounts(
      prizeDrafts.map(
        (draft) =>
          Math.floor(Number(draft.discountPercent)) || DEFAULT_PRIZE.discountPercent,
      ),
    );
    setSelectedBox(null);
    setMode("builder");
  };

  const buildPrizesPayload = () =>
    mode === "builder"
      ? prizeDiscounts.map((discount) => ({
          discountPercent: discount,
          durationHours: DEFAULT_PRIZE.durationHours,
          prizeProductId: null,
          enabled: true,
        }))
      : prizeDrafts.map((draft) => ({
          discountPercent: Math.floor(Number(draft.discountPercent)) || 0,
          durationHours: Math.floor(Number(draft.durationHours)) || 0,
          prizeProductId: draft.prizeProductId.trim() || null,
          enabled: draft.enabled,
        }));

  const handleSave = async () => {
    setActionError("");
    setFeedback("");
    try {
      await saveMutation.mutateAsync({
        enabled,
        prizes: buildPrizesPayload(),
      });
      setFeedback(UI.SAVE_SUCCESS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : UI.SAVE_FALLBACK);
    }
  };

  const config = configQuery.data;
  const paletteChoices = [
    ...DISCOUNT_CHOICES,
    ...prizeDiscounts.filter((value) => !DISCOUNT_CHOICES.includes(value)),
  ];
  const selectedIsPrize = selectedBox !== null && selectedBox < prizeDiscounts.length;

  return (
    <article className="advertising-page__card advertising-page__card_category lucky-box-admin">
      <div className="advertising-page__card-head">
        <h2 className="advertising-page__card-title">{UI.CARD_TITLE}</h2>
        <span className="advertising-page__card-badge">{UI.CARD_BADGE}</span>
      </div>
      <p className="advertising-page__card-lead">{UI.DESCRIPTION}</p>

      {configQuery.isPending ? (
        <p className="advertising-page__state">{UI.LOADING}</p>
      ) : null}

      {configQuery.isError ? (
        <p
          className="advertising-page__state advertising-page__state_error"
          role="alert"
        >
          {configQuery.error instanceof Error
            ? configQuery.error.message
            : UI.FETCH_FALLBACK}
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
            <span className="lucky-box-admin__toggle-label">{UI.ENABLED_LABEL}</span>
          </label>

          {mode === "builder" ? (
            <>
              <p className="lucky-box-admin__builder-hint">{UI.BUILDER_HINT}</p>

              <div className="lucky-box-admin__boxes" role="group">
                {Array.from({ length: BOXES_TOTAL }, (_, index) => {
                  const isPrize = index < prizeDiscounts.length;
                  return (
                    <button
                      key={index}
                      type="button"
                      className={[
                        "lucky-box-admin__box",
                        isPrize ? "lucky-box-admin__box_prize" : "",
                        selectedBox === index ? "lucky-box-admin__box_selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={
                        isPrize
                          ? UI.BUILDER_BOX_PRIZE_ARIA(index, prizeDiscounts[index])
                          : UI.BUILDER_BOX_EMPTY_ARIA(index)
                      }
                      onClick={() => handleBoxClick(index)}
                    >
                      <Gift className="lucky-box-admin__box-icon" aria-hidden="true" />
                      {isPrize ? (
                        <>
                          <span className="lucky-box-admin__box-label">
                            {prizeDiscounts[index]}%
                          </span>
                          <span className="lucky-box-admin__box-sub">
                            {UI.BUILDER_PRIZE_FACE_LABEL}
                          </span>
                        </>
                      ) : (
                        <span className="lucky-box-admin__box-sub">
                          {UI.BUILDER_EMPTY_FACE_LABEL}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedIsPrize ? (
                <>
                  <p className="lucky-box-admin__palette-label">
                    {UI.BUILDER_PALETTE_LABEL}
                  </p>
                  <div className="lucky-box-admin__palette" role="group">
                    {paletteChoices.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={[
                          "lucky-box-admin__chip",
                          prizeDiscounts[selectedBox] === value
                            ? "lucky-box-admin__chip_active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={prizeDiscounts[selectedBox] === value}
                        onClick={() => handlePaletteDiscount(value)}
                      >
                        {value}%
                      </button>
                    ))}
                    <button
                      type="button"
                      className="lucky-box-admin__chip lucky-box-admin__chip_empty"
                      disabled={prizeDiscounts.length <= PRIZES_MIN}
                      onClick={handlePaletteEmpty}
                    >
                      {UI.BUILDER_EMPTY_CHIP}
                    </button>
                  </div>
                </>
              ) : (
                <p className="lucky-box-admin__palette-label">
                  {UI.BUILDER_SELECT_BOX}
                </p>
              )}

              <p className="lucky-box-admin__builder-note">{UI.BUILDER_NOTE}</p>
            </>
          ) : (
            <>
              <div className="lucky-box-admin__count">
                <span className="lucky-box-admin__count-label">
                  {UI.PRIZES_COUNT_LABEL}
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
                        {UI.PRIZE_TITLE(index)}
                      </p>
                      <label
                        className="lucky-box-admin__toggle lucky-box-admin__toggle_small"
                        aria-label={UI.PRIZE_TOGGLE_ARIA(index)}
                      >
                        <input
                          type="checkbox"
                          className="lucky-box-admin__toggle-input"
                          checked={draft.enabled}
                          onChange={(event) =>
                            handlePrizeChange(index, "enabled", event.target.checked)
                          }
                        />
                        <span
                          className="lucky-box-admin__toggle-track"
                          aria-hidden="true"
                        >
                          <span className="lucky-box-admin__toggle-thumb" />
                        </span>
                      </label>
                    </div>
                    <div className="lucky-box-admin__prize-fields">
                      <label className="lucky-box-admin__field">
                        <span className="lucky-box-admin__field-label">
                          {UI.DISCOUNT_LABEL}
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
                            handlePrizeChange(
                              index,
                              "discountPercent",
                              event.target.value,
                            )
                          }
                        />
                        <small className="lucky-box-admin__field-hint">
                          {UI.DISCOUNT_HINT}
                        </small>
                      </label>
                      <label className="lucky-box-admin__field">
                        <span className="lucky-box-admin__field-label">
                          {UI.DURATION_LABEL}
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
                            handlePrizeChange(
                              index,
                              "durationHours",
                              event.target.value,
                            )
                          }
                        />
                        <small className="lucky-box-admin__field-hint">
                          {UI.DURATION_HINT}
                        </small>
                      </label>
                      <label className="lucky-box-admin__field">
                        <span className="lucky-box-admin__field-label">
                          {UI.PRIZE_PRODUCT_LABEL}
                        </span>
                        <input
                          className="lucky-box-admin__input"
                          type="text"
                          inputMode="text"
                          disabled={!draft.enabled}
                          placeholder={UI.PRIZE_PRODUCT_PLACEHOLDER}
                          value={draft.prizeProductId}
                          onChange={(event) =>
                            handlePrizeChange(
                              index,
                              "prizeProductId",
                              event.target.value,
                            )
                          }
                        />
                        <small className="lucky-box-admin__field-hint">
                          {UI.PRIZE_PRODUCT_HINT}
                        </small>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            type="button"
            className="lucky-box-admin__mode-switch"
            onClick={mode === "builder" ? switchToAdvanced : switchToBuilder}
          >
            {mode === "builder" ? UI.MODE_ADVANCED : UI.MODE_BUILDER}
          </button>

          <p className="lucky-box-admin__stats">
            {UI.STATS(config.playsTotal ?? 0, config.winsTotal ?? 0)}
          </p>

          <div className="advertising-page__actions">
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={saveMutation.isPending}
              onClick={handleSave}
            >
              {saveMutation.isPending ? UI.SAVING : UI.SAVE}
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
