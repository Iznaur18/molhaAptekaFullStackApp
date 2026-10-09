/**
 * Путь узла (`pathLabelRu`) уже заканчивается его названием — дописываем
 * `labelRu`, только если в пути его нет, иначе выходит «… › Шины › Шины».
 *
 * @param {import('../model/types.js').ProductCategoryNode} node
 * @returns {string}
 */
export function buildCategoryBreadcrumbFromNode(node) {
  const path = (Array.isArray(node.pathLabelRu) ? node.pathLabelRu : []).filter(
    (part) => typeof part === "string" && part.trim() !== "",
  );
  const label = typeof node.labelRu === "string" ? node.labelRu.trim() : "";

  const parts = label && path[path.length - 1] !== label ? [...path, label] : path;

  return parts.join(" › ");
}
