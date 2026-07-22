const DATE_TIME_FORMAT_RU = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatIsoDateTime = (iso?: string | Date | null): string => {
  if (!iso) {
    return "—";
  }

  try {
    const date = iso instanceof Date ? iso : new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return typeof iso === "string" ? iso : "—";
    }

    return DATE_TIME_FORMAT_RU.format(date);
  } catch {
    return typeof iso === "string" ? iso : "—";
  }
};
