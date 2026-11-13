import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

import { useMyFortuneWheelConfigQuery } from "../../../entities/fortune-wheel/model/useMyFortuneWheelConfigQuery.js";
import { usePutMyFortuneWheelConfigMutation } from "../../../entities/fortune-wheel/model/usePutMyFortuneWheelConfigMutation.js";
import { FORTUNE_WHEEL_ADVERTISING_UI as UI } from "../../../shared/config/appUiCopy.js";

import "./FortuneWheelAdvertisingSection.css";

const SECTORS_MIN = 2;
const SECTORS_MAX = 8;
const CHANCE_TOTAL = 100;
const DEFAULT_SECTOR = { discountPercent: 10, durationHours: 24, enabled: true };
/** Конструктор: скидки чипами; нестандартное значение добавляется своим чипом. */
const DISCOUNT_CHOICES = [5, 10, 15, 20, 25, 30];

const VIEW_SIZE = 200;
const CENTER = VIEW_SIZE / 2;
const WHEEL_RADIUS = 96;
const TEXT_RADIUS = 62;

/** Угол в градусах (0 — вверх, по часовой) → точка на окружности. */
function polarToPoint(radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  };
}

/** Путь сектора-«куска пирога» от startDeg до endDeg (по часовой от вверха). */
function sectorPath(startDeg, endDeg) {
  const start = polarToPoint(WHEEL_RADIUS, startDeg);
  const end = polarToPoint(WHEEL_RADIUS, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

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
  return Array.from(
    { length: count },
    (_, index) => base + (index === 0 ? remainder : 0),
  );
}

/**
 * Конструктор умеет только «простые» конфиги: сроки 24 часа, без
 * товаров-призов, шансы всех секций равные. Возвращает список
 * { discount } (null — секция «пусто») или null (тогда расширенный режим).
 */
function matchBuilderShape(sectors) {
  if (
    !Array.isArray(sectors) ||
    sectors.length < SECTORS_MIN ||
    sectors.length > SECTORS_MAX
  ) {
    return null;
  }
  const baseOk = sectors.every(
    (sector) =>
      !sector?.prizeProductId &&
      Math.floor(Number(sector?.durationHours)) === DEFAULT_SECTOR.durationHours,
  );
  if (!baseOk) {
    return null;
  }
  const expected = evenChances(sectors.length);
  const chancesOk = sectors.every(
    (sector, index) =>
      (Math.floor(Number(sector?.chancePercent)) || 0) === expected[index],
  );
  if (!chancesOk) {
    return null;
  }
  const shape = sectors.map((sector) => ({
    discount:
      sector?.enabled === false
        ? null
        : Math.floor(Number(sector?.discountPercent)) || DEFAULT_SECTOR.discountPercent,
  }));
  // Играбельный конфиг: хотя бы одна призовая секция.
  if (!shape.some((sector) => sector.discount !== null)) {
    return null;
  }
  return shape;
}

/**
 * Настройка «Колеса фортуны» в разделе «Реклама». По умолчанию — наглядный
 * конструктор: колесо, как у покупателя, секции кликабельны, шансы делятся
 * поровну автоматически. Полная форма (свои шансы, сроки, товар-приз) — за
 * ссылкой «Расширенная настройка».
 *
 * @param {{ isAuthorized: boolean }} props
 */
export function FortuneWheelAdvertisingSection({ isAuthorized }) {
  const configQuery = useMyFortuneWheelConfigQuery({ enabled: isAuthorized });
  const saveMutation = usePutMyFortuneWheelConfigMutation();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("builder");
  /** Конструктор: секции колеса; discount null — «пусто». */
  const [sectorsSimple, setSectorsSimple] = useState(() => [
    { discount: 10 },
    { discount: 15 },
    { discount: null },
  ]);
  const [selectedSector, setSelectedSector] = useState(null);
  /** Расширенный режим: полные черновики секций. */
  const [sectorDrafts, setSectorDrafts] = useState(() => {
    const drafts = Array.from({ length: 4 }, () => normalizeSectorDraft(null));
    evenChances(4).forEach((chance, index) => {
      drafts[index].chancePercent = String(chance);
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
    const shape = matchBuilderShape(config.sectors);
    if (shape) {
      setSectorsSimple(shape);
      setSelectedSector(null);
      setMode("builder");
      return;
    }
    const loaded = (config.sectors ?? []).map(normalizeSectorDraft);
    if (loaded.length > 0) {
      setSectorDrafts(loaded);
    }
    setMode("advanced");
  }, [configQuery.data]);

  if (!isAuthorized) {
    return null;
  }

  /* --- Конструктор --- */

  const prizesCount = sectorsSimple.filter((sector) => sector.discount !== null).length;
  const selectedIsPrize =
    selectedSector !== null && sectorsSimple[selectedSector]?.discount !== null;

  const handleSectorClick = (index) => {
    setSelectedSector(index);
  };

  const handlePaletteDiscount = (value) => {
    if (selectedSector === null) {
      return;
    }
    setSectorsSimple((current) =>
      current.map((sector, index) =>
        index === selectedSector ? { discount: value } : sector,
      ),
    );
  };

  const handlePaletteEmpty = () => {
    if (selectedSector === null || prizesCount <= 1) {
      return;
    }
    setSectorsSimple((current) =>
      current.map((sector, index) =>
        index === selectedSector ? { discount: null } : sector,
      ),
    );
  };

  const handleAddSector = () => {
    if (sectorsSimple.length >= SECTORS_MAX) {
      return;
    }
    setSectorsSimple((current) => [
      ...current,
      { discount: DEFAULT_SECTOR.discountPercent },
    ]);
    setSelectedSector(sectorsSimple.length);
  };

  const handleRemoveSector = () => {
    if (selectedSector === null || sectorsSimple.length <= SECTORS_MIN) {
      return;
    }
    const wasPrize = sectorsSimple[selectedSector]?.discount !== null;
    // Нельзя удалить последнюю призовую секцию — игра станет пустой.
    if (wasPrize && prizesCount <= 1) {
      return;
    }
    setSectorsSimple((current) =>
      current.filter((_, index) => index !== selectedSector),
    );
    setSelectedSector(null);
  };

  /* --- Расширенный режим --- */

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
      return next.map((draft, index) => ({
        ...draft,
        chancePercent: String(chances[index]),
      }));
    });
  };

  const handleSectorChange = (index, field, value) => {
    setSectorDrafts((current) =>
      current.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft,
      ),
    );
  };

  /** Конструктор → расширенный: раскладываем секции в полную форму. */
  const switchToAdvanced = () => {
    const chances = evenChances(sectorsSimple.length);
    setSectorDrafts(
      sectorsSimple.map((sector, index) =>
        normalizeSectorDraft({
          discountPercent: sector.discount ?? DEFAULT_SECTOR.discountPercent,
          chancePercent: chances[index],
          enabled: sector.discount !== null,
        }),
      ),
    );
    setMode("advanced");
  };

  /** Расширенный → конструктор: шансы сравниваются, сроки сбрасываются. */
  const switchToBuilder = () => {
    setSectorsSimple(
      sectorDrafts.map((draft) => ({
        discount: draft.enabled
          ? Math.floor(Number(draft.discountPercent)) || DEFAULT_SECTOR.discountPercent
          : null,
      })),
    );
    setSelectedSector(null);
    setMode("builder");
  };

  const buildSectorsPayload = () => {
    if (mode === "builder") {
      const chances = evenChances(sectorsSimple.length);
      return sectorsSimple.map((sector, index) => ({
        // Сервер требует скидку 1–90 даже у выключенной секции — заглушка.
        discountPercent: sector.discount ?? DEFAULT_SECTOR.discountPercent,
        durationHours: DEFAULT_SECTOR.durationHours,
        chancePercent: chances[index],
        prizeProductId: null,
        enabled: sector.discount !== null,
      }));
    }
    return sectorDrafts.map((draft) => ({
      discountPercent: Math.floor(Number(draft.discountPercent)) || 0,
      durationHours: Math.floor(Number(draft.durationHours)) || 0,
      chancePercent: Math.floor(Number(draft.chancePercent)) || 0,
      prizeProductId: draft.prizeProductId.trim() || null,
      enabled: draft.enabled,
    }));
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
        sectors: buildSectorsPayload(),
      });
      setFeedback(UI.SAVE_SUCCESS);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : UI.SAVE_FALLBACK);
    }
  };

  const config = configQuery.data;
  const paletteChoices = [
    ...DISCOUNT_CHOICES,
    ...sectorsSimple
      .map((sector) => sector.discount)
      .filter((value) => value !== null && !DISCOUNT_CHOICES.includes(value)),
  ].sort((a, b) => a - b);
  const sectorAngle = 360 / sectorsSimple.length;
  const chancePerSector = Math.round(CHANCE_TOTAL / sectorsSimple.length);

  return (
    <article className="advertising-page__card advertising-page__card_category fortune-wheel-admin">
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
              {UI.ENABLED_LABEL}
            </span>
          </label>

          {mode === "builder" ? (
            <>
              <p className="fortune-wheel-admin__builder-hint">{UI.BUILDER_HINT}</p>

              <div className="fortune-wheel-admin__wheel-stage">
                <div
                  className="fortune-wheel-admin__wheel-pointer"
                  aria-hidden="true"
                />
                <svg
                  className="fortune-wheel-admin__wheel"
                  viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
                  role="group"
                  aria-label={UI.CARD_TITLE}
                >
                  {sectorsSimple.map((sector, index) => {
                    const startDeg = index * sectorAngle;
                    const endDeg = startDeg + sectorAngle;
                    const midDeg = startDeg + sectorAngle / 2;
                    const labelPoint = polarToPoint(TEXT_RADIUS, midDeg);
                    const isPrize = sector.discount !== null;
                    return (
                      <g key={index}>
                        <path
                          d={sectorPath(startDeg, endDeg)}
                          className={[
                            "fortune-wheel-admin__wheel-sector",
                            isPrize
                              ? index % 2 === 0
                                ? "fortune-wheel-admin__wheel-sector_even"
                                : "fortune-wheel-admin__wheel-sector_odd"
                              : "fortune-wheel-admin__wheel-sector_empty",
                            selectedSector === index
                              ? "fortune-wheel-admin__wheel-sector_selected"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          role="button"
                          tabIndex={0}
                          aria-label={UI.BUILDER_SECTOR_ARIA(index, sector.discount)}
                          onClick={() => handleSectorClick(index)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              handleSectorClick(index);
                            }
                          }}
                        />
                        <text
                          x={labelPoint.x.toFixed(2)}
                          y={labelPoint.y.toFixed(2)}
                          className={[
                            "fortune-wheel-admin__wheel-label",
                            isPrize && index % 2 !== 0
                              ? "fortune-wheel-admin__wheel-label_light"
                              : "",
                            isPrize ? "" : "fortune-wheel-admin__wheel-label_empty",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          transform={`rotate(${midDeg} ${labelPoint.x.toFixed(2)} ${labelPoint.y.toFixed(2)})`}
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {isPrize ? `${sector.discount}%` : UI.BUILDER_EMPTY_CHIP}
                        </text>
                      </g>
                    );
                  })}
                  <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={30}
                    className="fortune-wheel-admin__wheel-hub"
                  />
                </svg>
              </div>

              <p className="fortune-wheel-admin__chance-info">
                {UI.BUILDER_CHANCE_INFO(chancePerSector)}
              </p>

              {selectedSector !== null ? (
                <>
                  <p className="fortune-wheel-admin__palette-label">
                    {UI.BUILDER_PALETTE_LABEL(selectedSector)}
                  </p>
                  <div className="fortune-wheel-admin__palette" role="group">
                    {paletteChoices.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={[
                          "fortune-wheel-admin__chip",
                          sectorsSimple[selectedSector]?.discount === value
                            ? "fortune-wheel-admin__chip_active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={sectorsSimple[selectedSector]?.discount === value}
                        onClick={() => handlePaletteDiscount(value)}
                      >
                        {value}%
                      </button>
                    ))}
                    <button
                      type="button"
                      className={[
                        "fortune-wheel-admin__chip",
                        "fortune-wheel-admin__chip_empty",
                        selectedIsPrize ? "" : "fortune-wheel-admin__chip_active",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={selectedIsPrize && prizesCount <= 1}
                      onClick={handlePaletteEmpty}
                    >
                      {UI.BUILDER_EMPTY_CHIP}
                    </button>
                  </div>
                  {sectorsSimple.length > SECTORS_MIN ? (
                    <button
                      type="button"
                      className="fortune-wheel-admin__remove-sector"
                      disabled={selectedIsPrize && prizesCount <= 1}
                      onClick={handleRemoveSector}
                    >
                      {UI.BUILDER_REMOVE_SECTOR}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="fortune-wheel-admin__palette-label">
                  {UI.BUILDER_SELECT_SECTOR}
                </p>
              )}

              {sectorsSimple.length < SECTORS_MAX ? (
                <button
                  type="button"
                  className="fortune-wheel-admin__add-sector"
                  onClick={handleAddSector}
                >
                  {UI.BUILDER_ADD_SECTOR}
                </button>
              ) : null}

              <p className="fortune-wheel-admin__builder-note">{UI.BUILDER_NOTE}</p>
            </>
          ) : (
            <>
              <div className="fortune-wheel-admin__count">
                <span className="fortune-wheel-admin__count-label">
                  {UI.SECTORS_COUNT_LABEL}
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
                        {UI.SECTOR_TITLE(index)}
                      </p>
                      <label
                        className="fortune-wheel-admin__toggle fortune-wheel-admin__toggle_small"
                        aria-label={UI.SECTOR_TOGGLE_ARIA(index)}
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
                          {UI.DISCOUNT_LABEL}
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
                            handleSectorChange(
                              index,
                              "discountPercent",
                              event.target.value,
                            )
                          }
                        />
                        <small className="fortune-wheel-admin__field-hint">
                          {UI.DISCOUNT_HINT}
                        </small>
                      </label>
                      <label className="fortune-wheel-admin__field">
                        <span className="fortune-wheel-admin__field-label">
                          {UI.DURATION_LABEL}
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
                            handleSectorChange(
                              index,
                              "durationHours",
                              event.target.value,
                            )
                          }
                        />
                        <small className="fortune-wheel-admin__field-hint">
                          {UI.DURATION_HINT}
                        </small>
                      </label>
                      <label className="fortune-wheel-admin__field">
                        <span className="fortune-wheel-admin__field-label">
                          {UI.CHANCE_LABEL}
                        </span>
                        <input
                          className="fortune-wheel-admin__input"
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={100}
                          value={draft.chancePercent}
                          onChange={(event) =>
                            handleSectorChange(
                              index,
                              "chancePercent",
                              event.target.value,
                            )
                          }
                        />
                        <small className="fortune-wheel-admin__field-hint">
                          {UI.CHANCE_HINT}
                        </small>
                      </label>
                      <label className="fortune-wheel-admin__field">
                        <span className="fortune-wheel-admin__field-label">
                          {UI.PRIZE_PRODUCT_LABEL}
                        </span>
                        <input
                          className="fortune-wheel-admin__input"
                          type="text"
                          inputMode="text"
                          disabled={!draft.enabled}
                          placeholder={UI.PRIZE_PRODUCT_PLACEHOLDER}
                          value={draft.prizeProductId}
                          onChange={(event) =>
                            handleSectorChange(
                              index,
                              "prizeProductId",
                              event.target.value,
                            )
                          }
                        />
                        <small className="fortune-wheel-admin__field-hint">
                          {UI.PRIZE_PRODUCT_HINT}
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
                  ? UI.CHANCE_TOTAL_OK(chanceTotal)
                  : UI.CHANCE_TOTAL_ERROR(chanceTotal)}
              </p>
            </>
          )}

          <button
            type="button"
            className="fortune-wheel-admin__mode-switch"
            onClick={mode === "builder" ? switchToAdvanced : switchToBuilder}
          >
            {mode === "builder" ? UI.MODE_ADVANCED : UI.MODE_BUILDER}
          </button>

          <p className="fortune-wheel-admin__stats">
            {UI.STATS(config.spinsTotal ?? 0, config.winsTotal ?? 0)}
          </p>

          <div className="advertising-page__actions">
            <button
              type="button"
              className="app-btn app-btn--primary"
              disabled={
                saveMutation.isPending || (mode === "advanced" && !chanceTotalOk)
              }
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
