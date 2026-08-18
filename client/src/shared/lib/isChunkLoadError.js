/**
 * Vite/React.lazy: после деплоя старый бандл запрашивает удалённые чанки.
 *
 * @param {unknown} error
 */
export function isChunkLoadError(error) {
  const name = String(error?.name ?? "");
  const message = String(error?.message ?? error ?? "");
  return (
    name === "ChunkLoadError" ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Loading chunk [\w.-]+ failed/i.test(message) ||
    /Unable to preload CSS/i.test(message)
  );
}
