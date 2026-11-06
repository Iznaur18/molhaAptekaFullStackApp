import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/**
 * Окна витрины «QR-код» и «Соцсети и сайт» — паритет web `SellerQrSheet.css`
 * (каркас) и `SellerSocialLinksSheet.css` (строки).
 */
export const useSellerStorefrontSheetStyles = createThemedStyles((theme) => ({
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  close: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  body: {
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
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
    fontWeight: "600",
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
    fontWeight: "700",
    color: theme.colors.text,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },
  statsNote: {
    fontSize: 12.5,
    lineHeight: 17,
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
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
    color: theme.colors.text,
  },
  rowValue: {
    fontSize: 13,
    lineHeight: 17,
    color: theme.colors.textMuted,
  },
  addTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));
