/**
 * @param {number[]} series
 * @param {{ width?: number; height?: number; paddingY?: number }} [opts]
 * @returns {{ linePath: string; areaPath: string } | null}
 */
export function buildSparklinePaths(series, opts = {}) {
  const width = opts.width ?? 72;
  const height = opts.height ?? 28;
  const paddingY = opts.paddingY ?? 2;

  if (!Array.isArray(series) || series.length < 2) {
    return null;
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = Math.max(1, max - min);
  const stepX = width / (series.length - 1);
  const usableH = height - paddingY * 2;

  /** @type {string[]} */
  const points = series.map((value, index) => {
    const x = index * stepX;
    const y = paddingY + usableH - ((value - min) / range) * usableH;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width.toFixed(2)},${height} L 0,${height} Z`;

  return { linePath, areaPath };
}

/**
 * @param {number} percentChange
 * @returns {string}
 */
export function formatStatsTrendPercentLabel(percentChange) {
  const n = Math.round(Number(percentChange)) || 0;
  if (n > 0) return `+${n}%`;
  if (n < 0) return `${n}%`;
  return "0%";
}
