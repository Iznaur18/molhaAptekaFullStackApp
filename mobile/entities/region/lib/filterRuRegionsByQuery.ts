import { listRuRegions } from "@molha/api-contract";

type RuRegion = ReturnType<typeof listRuRegions>[number];

/**
 * Фильтр регионов + выбранный код в начале списка.
 */
export function filterRuRegionsByQuery(
  query: string,
  regions: readonly RuRegion[] = listRuRegions(),
  selectedCode = "",
): RuRegion[] {
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
