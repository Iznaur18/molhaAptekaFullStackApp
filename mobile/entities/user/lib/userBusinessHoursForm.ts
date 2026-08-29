import { userBusinessHoursScheduleSchema } from "@molha/api-contract";

const DEFAULT_WEEKDAYS = [0, 1, 2, 3, 4];

export const mapUserBusinessHoursFromUser = (user: Record<string, unknown>) => {
  const enabled = user.userBusinessHoursEnabled === true;
  const schedule = user.userBusinessHours as
    | { weekdays?: unknown[]; openTime?: string; closeTime?: string }
    | undefined;
  const weekdays = Array.isArray(schedule?.weekdays)
    ? schedule.weekdays
        .map((day) => Number(day))
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    : DEFAULT_WEEKDAYS;

  return {
    userBusinessHoursEnabled: enabled,
    userBusinessHoursWeekdays: weekdays.length > 0 ? weekdays : DEFAULT_WEEKDAYS,
    userBusinessHoursOpenTime:
      typeof schedule?.openTime === "string" && schedule.openTime.trim() !== ""
        ? schedule.openTime.trim()
        : "09:00",
    userBusinessHoursCloseTime:
      typeof schedule?.closeTime === "string" && schedule.closeTime.trim() !== ""
        ? schedule.closeTime.trim()
        : "18:00",
  };
};

export const buildUserBusinessHoursPatchBody = (form: {
  userBusinessHoursEnabled: boolean;
  userBusinessHoursWeekdays: number[];
  userBusinessHoursOpenTime: string;
  userBusinessHoursCloseTime: string;
}) => {
  const body: Record<string, unknown> = {
    userBusinessHoursEnabled: Boolean(form.userBusinessHoursEnabled),
  };

  if (!form.userBusinessHoursEnabled) {
    return body;
  }

  body.userBusinessHours = {
    weekdays: form.userBusinessHoursWeekdays,
    openTime: form.userBusinessHoursOpenTime,
    closeTime: form.userBusinessHoursCloseTime,
  };

  return body;
};

export const validateUserBusinessHoursForm = (form: {
  userBusinessHoursEnabled: boolean;
  userBusinessHoursWeekdays: number[];
  userBusinessHoursOpenTime: string;
  userBusinessHoursCloseTime: string;
}): string | null => {
  if (!form.userBusinessHoursEnabled) {
    return null;
  }

  const parsed = userBusinessHoursScheduleSchema.safeParse({
    weekdays: form.userBusinessHoursWeekdays,
    openTime: form.userBusinessHoursOpenTime,
    closeTime: form.userBusinessHoursCloseTime,
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Некорректные часы работы";
  }

  return null;
};
