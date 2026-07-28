import { listRuRegions } from "@molha/api-contract";

/**
 * @param {string} query
 * @param {readonly ReturnType<typeof listRuRegions>} [regions]
 * @param {string} [selectedCode] — выбранный регион поднимается в начало списка
 */
export function filterRuRegionsByQuery(
  query,
  regions = listRuRegions(),
  selectedCode = "",
) {
  const q = String(query ?? "")
    .trim()
    .toLocaleLowerCase("ru");

  const filtered = !q
    ? [...regions]
    : regions.filter((region) => {
        if (region.name.toLocaleLowerCase("ru").includes(q)) {
          return true;
        }
        return region.aliases.some((alias) =>
          alias.toLocaleLowerCase("ru").includes(q),
        );
      });

  const selected = String(selectedCode ?? "").trim();
  if (!selected) {
    return filtered;
  }

  const selectedIndex = filtered.findIndex((region) => region.code === selected);
  if (selectedIndex <= 0) {
    return filtered;
  }

  const next = filtered.slice();
  const [item] = next.splice(selectedIndex, 1);
  next.unshift(item);
  return next;
}
