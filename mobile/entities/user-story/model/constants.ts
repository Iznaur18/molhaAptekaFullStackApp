export const USER_STORY_MEDIA_TYPE_IMAGE = "image" as const;
export const USER_STORY_MEDIA_TYPE_VIDEO = "video" as const;

export const USER_STORY_CAPTION_MAX_CHARS = 150;

export const USER_STORY_VIDEO_MAX_DURATION_SEC = 30;

export const USER_STORY_IMAGE_VIEW_DURATION_MS = 5000;

export const USER_STORY_REPORT_RESOLUTION_DISMISS = "dismiss";
export const USER_STORY_REPORT_RESOLUTION_HIDE = "hide";

export type UserStoryMediaType =
  | typeof USER_STORY_MEDIA_TYPE_IMAGE
  | typeof USER_STORY_MEDIA_TYPE_VIDEO;
