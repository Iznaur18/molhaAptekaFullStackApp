export type VoteScoreTone = "danger" | "warning" | "success";

const SCORE_TONE_DANGER_MAX = 3;
const SCORE_TONE_WARNING_MAX = 6;

export const resolveVoteScoreTone = (score: number): VoteScoreTone => {
  if (score <= SCORE_TONE_DANGER_MAX) {
    return "danger";
  }
  if (score <= SCORE_TONE_WARNING_MAX) {
    return "warning";
  }
  return "success";
};

type ThemeVoteColors = {
  danger: string;
  dangerSurface: string;
  dangerText: string;
  warning: string;
  warningSurface: string;
  warningText: string;
  success: string;
  successSurface: string;
  successText: string;
  onContrast: string;
};

export type VoteScoreChipColors = {
  background: string;
  border: string;
  text: string;
};

export const resolveVoteScoreChipColors = (
  score: number,
  selected: boolean,
  colors: ThemeVoteColors,
): VoteScoreChipColors => {
  const tone = resolveVoteScoreTone(score);

  if (tone === "danger") {
    return selected
      ? { background: colors.danger, border: colors.danger, text: colors.onContrast }
      : {
          background: colors.dangerSurface,
          border: colors.danger,
          text: colors.dangerText,
        };
  }

  if (tone === "warning") {
    return selected
      ? { background: colors.warning, border: colors.warning, text: colors.onContrast }
      : {
          background: colors.warningSurface,
          border: colors.warning,
          text: colors.warningText,
        };
  }

  return selected
    ? { background: colors.success, border: colors.success, text: colors.onContrast }
    : {
        background: colors.successSurface,
        border: colors.success,
        text: colors.successText,
      };
};
