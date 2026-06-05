/**
 * @param {import('../model/types.js').ProductCategoryNode} node
 * @returns {string}
 */
export function buildCategoryBreadcrumbFromNode(node) {
  const parts = [
    ...(Array.isArray(node.pathLabelRu) ? node.pathLabelRu : []),
    node.labelRu,
  ].filter((part) => typeof part === "string" && part.trim() !== "");

  return parts.join(" › ");
}
