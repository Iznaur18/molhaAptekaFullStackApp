/**
 * @param {{ csv: string; filename: string }} payload
 */
export function downloadAnalyticsCsvFile(payload) {
  const blob = new Blob([payload.csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.filename || "platform-analytics.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
