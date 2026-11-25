import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/**
 * Окна витрины «QR-код» и «Соцсети и сайт» — паритет web `SellerQrSheet.css`
 * (каркас) и `SellerSocialLinksSheet.css` (строки).
 */
export const useSellerStorefrontSheetStyles = createThemedStyles((theme, layout) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: "100%",
    maxWidth: 416,
    maxHeight: "92%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 16,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingBottom: 12,
  },
  title: {
    flexShrink: 1,
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  close: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  body: {
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  hint: {
    fontSize: 13.6,
    lineHeight: 19,
    color: theme.colors.textMuted,
  },
  error: {
    fontSize: 13.6,
    color: theme.colors.danger,
  },
  // Карточка QR: всегда белая — её фотографируют и показывают с экрана.
  card: {
    alignItems: "center",
    gap: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17, 17, 17, 0.1)",
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cardName: {
    maxWidth: "100%",
    fontSize: 16.8,
    fontWeight: "800",
    color: "#111111",
  },
  cardCaption: {
    fontSize: 12.8,
    fontWeight: theme.typography.fontWeightSemibold,
    color: "#6b7280",
    textAlign: "center",
  },
  cardBrand: {
    fontSize: 15.2,
    fontWeight: "800",
    color: "#111111",
  },
  stats: {
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
  },
  statsTitle: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  statsValue: {
    fontSize: theme.typography.fontLg,
    fontWeight: "800",
    color: theme.colors.text,
  },
  statsNote: {
    fontSize: 12.5,
    lineHeight: theme.typography.leadingXs,
    color: theme.colors.textMuted,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    backgroundColor: theme.colors.bg,
  },
  rowAdd: {
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 19,
    color: theme.colors.text,
  },
  rowValue: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingXs,
    color: theme.colors.textMuted,
  },
  addTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
}));
