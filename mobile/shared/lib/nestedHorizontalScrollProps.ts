/** Пропсы для горизонтальных лент внутри вертикального родителя (лента, модалки). */
export const nestedHorizontalScrollProps = {
  nestedScrollEnabled: true,
  directionalLockEnabled: true,
  scrollEventThrottle: 16,
  overScrollMode: "never" as const,
} as const;
