export const RAFFLE_STATUS_PENDING_STAFF = "pending_staff";
export const RAFFLE_STATUS_ACTIVE = "active";
export const RAFFLE_STATUS_COMPLETED = "completed";
export const RAFFLE_STATUS_PAUSED = "paused";
export const RAFFLE_STATUS_REJECTED = "rejected";

export const RAFFLE_STATUSES = [
  RAFFLE_STATUS_PENDING_STAFF,
  RAFFLE_STATUS_ACTIVE,
  RAFFLE_STATUS_COMPLETED,
  RAFFLE_STATUS_PAUSED,
  RAFFLE_STATUS_REJECTED,
];

export const RAFFLE_TARGET_SALES_MIN = 1;
export const RAFFLE_TARGET_SALES_MAX = 100_000;

export const RAFFLE_TITLE_MAX_LENGTH = 120;
export const RAFFLE_DESCRIPTION_MAX_LENGTH = 4000;
export const RAFFLE_INSTAGRAM_URL_MAX_LENGTH = 500;

export const RAFFLE_PRIZE_MEDIA_TYPE_IMAGE = "image";
export const RAFFLE_PRIZE_MEDIA_TYPE_VIDEO = "video";

export const RAFFLE_PRIZE_MEDIA_TYPES = [
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
];

/** Макс. одновременно active на витрине (карусель) */
export const SITE_RAFFLES_ACTIVE_VITRINE_MAX = 10;

/** Сколько недавних completed показывать после active */
export const SITE_RAFFLES_COMPLETED_VITRINE_MAX = 10;
