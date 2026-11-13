import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/**
 * Игры на витрине продавца («Коробки удачи», «Колесо фортуны») — паритет web
 * `SellerLuckyBoxSection.css` / `SellerFortuneWheelSection.css` (+ sheet css).
 */
export const useSellerGamesStyles = createThemedStyles((theme) => ({
  gamesRow: {
    gap: 10,
    marginTop: 4,
  },
  // Кнопка-карточка игры (градиент рисуется Svg-подложкой в компоненте).
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    minHeight: 72,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 18,
    overflow: "hidden",
  },
  togglePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  toggleGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  // Контент поверх абсолютной градиент-подложки (на web positioned-элемент
  // перекрывает статичных соседей).
  toggleContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 1,
  },
  toggleHead: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  toggleTitle: {
    fontSize: 15.2,
    fontWeight: "700",
    letterSpacing: -0.1,
    color: "#ffffff",
  },
  toggleSubtitle: {
    fontSize: 12.5,
    color: "rgba(255, 255, 255, 0.82)",
  },

  sheetSubtitle: {
    fontSize: 13.6,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },

  // Тизер для гостя.
  teaser: {
    alignItems: "flex-start",
    gap: 8,
  },
  teaserText: {
    fontSize: 13.6,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },

  // Сетка коробок: 3 колонки.
  boxesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  box: {
    flexBasis: "31.5%",
    flexGrow: 1,
    aspectRatio: 1.4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.actionSoft,
  },
  boxPickedWin: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  boxPickedEmpty: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  boxRevealedPrize: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  boxDimmed: {
    opacity: 0.45,
  },
  boxFace: {
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  boxFaceLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.onContrast,
    opacity: 0.85,
  },
  boxFaceValue: {
    fontSize: 16.8,
    fontWeight: "800",
    lineHeight: 19,
    color: theme.colors.action,
  },
  boxFaceValueWin: {
    color: theme.colors.onContrast,
  },
  boxFaceValueEmpty: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },

  // Зона подсказок/результата фиксированной высоты — как на web,
  // чтобы смена «подсказка → результат» не двигала сетку и шторку.
  feedback: {
    minHeight: 108,
    justifyContent: "center",
    gap: 8,
  },
  attempts: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  hint: {
    fontSize: 12.8,
    lineHeight: 17,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  hintError: {
    color: theme.colors.danger,
  },
  result: {
    gap: 3,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  resultWin: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  resultTitle: {
    fontSize: 15.2,
    fontWeight: "700",
    color: theme.colors.text,
  },
  resultText: {
    fontSize: 13.1,
    lineHeight: 18,
    color: theme.colors.textMuted,
  },
  timerPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.action,
  },
  timerPillText: {
    fontSize: 12.8,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },

  // Колесо фортуны.
  wheelStage: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 240,
    height: 240,
    marginTop: 10,
  },
  wheelPointer: {
    position: "absolute",
    top: -2,
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 17,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: theme.colors.ink,
  },
  wheelRotor: {
    width: 240,
    height: 240,
  },
  wheelHub: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 74,
    height: 74,
    borderWidth: 5,
    borderColor: theme.colors.surface,
    borderRadius: 37,
    backgroundColor: theme.colors.action,
  },
  wheelHubDisabled: {
    opacity: 0.65,
  },
  wheelHubLabel: {
    fontSize: 13.1,
    fontWeight: "800",
    color: theme.colors.onContrast,
    textAlign: "center",
  },
  prizesTitle: {
    fontSize: 13.6,
    fontWeight: "700",
    color: theme.colors.text,
  },
  prizesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  prizeChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  prizeChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: theme.colors.text,
  },
}));
