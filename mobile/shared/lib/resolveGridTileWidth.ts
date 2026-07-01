export const resolveGridTileWidth = (
  contentWidth: number,
  columns: number,
  gap: number,
): number => {
  if (!Number.isFinite(contentWidth) || contentWidth <= 0 || columns <= 0) {
    return 0;
  }

  const totalGap = gap * Math.max(0, columns - 1);
  return Math.floor((contentWidth - totalGap) / columns);
};
