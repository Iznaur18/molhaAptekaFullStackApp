import type { PassportSnapshot } from "@/entities/user-data-confirmation/lib/emptyPassportForm";

const EM_DASH = "—";

const DATE_FORMAT = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
});

export const formatPassportDate = (iso: string | undefined | null) => {
  if (iso == null || iso === "") {
    return EM_DASH;
  }
  try {
    return DATE_FORMAT.format(new Date(iso));
  } catch {
    return String(iso);
  }
};

export const formatPassportFullName = (passport: Partial<PassportSnapshot> | undefined) => {
  const parts = [passport?.lastName, passport?.firstName, passport?.middleName?.trim()].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(" ") : EM_DASH;
};
