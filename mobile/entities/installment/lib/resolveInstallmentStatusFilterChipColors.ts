const LINK_DEEP = "#4f46e5";
const SUCCESS_TEAL_BRIGHT = "#0d9488";
const SUCCESS_VIVID = "#22c55e";
const WARNING_BRIGHT = "#f59e0b";
const DANGER_ACCENT = "#dc2626";

export const resolveInstallmentStatusFilterChipActiveColors = (
  status: string,
): { backgroundColor: string; borderColor: string } => {
  if (!status) {
    return { backgroundColor: LINK_DEEP, borderColor: LINK_DEEP };
  }
  if (status === "in_progress") {
    return { backgroundColor: SUCCESS_TEAL_BRIGHT, borderColor: SUCCESS_TEAL_BRIGHT };
  }
  if (status === "completed") {
    return { backgroundColor: SUCCESS_VIVID, borderColor: SUCCESS_VIVID };
  }
  if (status === "defaulted") {
    return { backgroundColor: WARNING_BRIGHT, borderColor: WARNING_BRIGHT };
  }
  if (status === "cancelled") {
    return { backgroundColor: DANGER_ACCENT, borderColor: DANGER_ACCENT };
  }
  return { backgroundColor: LINK_DEEP, borderColor: LINK_DEEP };
};
