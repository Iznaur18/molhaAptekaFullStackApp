export const USER_STORY_MEDIA_TYPE_IMAGE = 'image';
export const USER_STORY_MEDIA_TYPE_VIDEO = 'video';

export const USER_STORY_MEDIA_TYPES = [
    USER_STORY_MEDIA_TYPE_IMAGE,
    USER_STORY_MEDIA_TYPE_VIDEO,
];

export const USER_STORY_STATUS_ACTIVE = 'active';
export const USER_STORY_STATUS_HIDDEN = 'hidden';
export const USER_STORY_STATUS_EXPIRED = 'expired';

export const USER_STORY_STATUSES = [
    USER_STORY_STATUS_ACTIVE,
    USER_STORY_STATUS_HIDDEN,
    USER_STORY_STATUS_EXPIRED,
];

/** Сторис активен 12 часов после публикации. */
export const USER_STORY_TTL_MS = 12 * 60 * 60 * 1000;

export const USER_STORY_CAPTION_MAX_CHARS = 150;

export const USER_STORY_VIDEO_MAX_DURATION_SEC = 10;

export const USER_STORY_REPORT_STATUS_PENDING = 'pending';
export const USER_STORY_REPORT_STATUS_DISMISSED = 'dismissed';
export const USER_STORY_REPORT_STATUS_RESOLVED = 'resolved';

export const USER_STORY_REPORT_STATUSES = [
    USER_STORY_REPORT_STATUS_PENDING,
    USER_STORY_REPORT_STATUS_DISMISSED,
    USER_STORY_REPORT_STATUS_RESOLVED,
];

export const USER_STORY_REPORT_RESOLUTION_DISMISS = 'dismiss';
export const USER_STORY_REPORT_RESOLUTION_HIDE = 'hide';

export const USER_STORY_REPORT_ALREADY_MESSAGE = 'Вы уже жаловались на этот сторис';

export const USER_STORY_RATE_LIMIT_PER_HOUR = 10;

export const IN_APP_NOTIFICATION_KIND_STORY_HIDDEN = 'user_story_hidden';
export const IN_APP_NOTIFICATION_MESSAGE_STORY_HIDDEN =
    'Ваш сторис скрыт модерацией после жалобы';

export const USER_STORY_AUTHOR_PUBLIC_SELECT =
    '_id userName userAvatarUrl userAvatarFocus isPremiumUser';
