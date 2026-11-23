/**
 * Паритет web `ConfirmButton.css` popover.
 * Native confirm сейчас через `Alert.alert` / `window.confirm`
 * (`confirmDestructiveAction`) — platform chrome; эти константы для
 * кастомного ConfirmPopover, когда заменим Alert.
 */
export const CONFIRM_POPOVER_CHROME = {
  maxWidth: 320,
  borderRadius: 14,
  paddingVertical: 16,
  paddingHorizontal: 16.8,
  gap: 12,
  actionsRadius: 10,
  scrim: "rgba(0,0,0,0.58)",
  scrimBlurPx: 4,
} as const;
