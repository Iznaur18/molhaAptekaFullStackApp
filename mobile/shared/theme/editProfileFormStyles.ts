import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/**
 * Стили экрана «Редактирование профиля». Зонирование строится на контрасте
 * фона страницы (bg) и белых карточек-секций (surface): каждая карточка — одна
 * смысловая группа полей. Цвет применяется сдержанно и семантично: единый
 * акцент в заголовках зон, приглушённые read-only поля, danger для обязательных.
 */
export const useEditProfileFormStyles = createThemedStyles((theme) => ({
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[4],
    backgroundColor: theme.colors.bg,
  },

  /** Заголовок зоны: тонкий акцент-маркер + приглушённая подпись. */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginLeft: theme.spacing[1],
    marginBottom: theme.spacing[1],
  },
  sectionAccent: {
    width: 3,
    height: 13,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.action,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: theme.colors.textSecondary,
  },

  /** Карточка-зона: белая поверхность на цветном фоне страницы. */
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  mediaCard: {
    gap: theme.spacing[4],
  },

  field: {
    gap: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textMuted,
  },
  labelRequired: {
    color: theme.colors.danger,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },

  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 9,
    fontSize: 15,
    color: theme.colors.text,
  },
  inputReadOnly: {
    color: theme.colors.textMuted,
  },
  inputMultiline: {
    minHeight: 84,
    paddingTop: 9,
    textAlignVertical: "top",
  },

  /** Адрес: короткие поля (дом/квартира) в один ряд. */
  row: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  rowCol: {
    flex: 1,
  },

  /** Сегментированный переключатель пола — на токенах темы (работает в dark). */
  segment: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.input,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentDivider: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: theme.colors.border,
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.action,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },

  /** Зона уведомлений: подпись + пояснение слева, свитч справа. */
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[3],
  },
  switchTextWrap: {
    flex: 1,
    gap: 2,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.text,
  },

  charMeter: {
    fontSize: 12,
    textAlign: "right",
    color: theme.colors.textMuted,
  },
  charMeterOver: {
    color: theme.colors.danger,
  },

  feedback: {
    fontSize: 14,
    marginTop: -theme.spacing[1],
  },
  feedbackError: {
    color: theme.colors.danger,
  },
  feedbackSuccess: {
    color: theme.colors.success,
  },

  submit: {
    marginTop: theme.spacing[1],
  },

  /** Danger-зона: та же карточка, но обведена danger — необратимое действие. */
  dangerCard: {
    borderColor: theme.colors.danger,
  },
  dangerAccent: {
    backgroundColor: theme.colors.danger,
  },
  dangerTitle: {
    color: theme.colors.danger,
  },
  dangerText: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  dangerListTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  dangerListItem: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
    paddingLeft: theme.spacing[2],
  },
  dangerGroup: {
    gap: 2,
  },
  dangerActions: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  dangerActionItem: {
    flex: 1,
  },
}));
