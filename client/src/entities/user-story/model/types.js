/**
 * @typedef {import('../../user/model/types.js').UserPublicProfile} UserStoryAuthor
 */

/**
 * @typedef {{
 *   _id: string;
 *   authorUserId: string;
 *   mediaType: 'image' | 'video';
 *   mediaUrl: string;
 *   captionText: string;
 *   publishedAt: string;
 *   expiresAt: string;
 * }} UserStoryFromApi
 */

/**
 * @typedef {{
 *   author: UserStoryAuthor & { isPremiumUser?: boolean };
 *   activeCount: number;
 *   isViewed: boolean;
 *   isOwn: boolean;
 *   latestPublishedAt: string | null;
 * }} UserStoryRingFromApi
 */

/**
 * @typedef {{
 *   rings: UserStoryRingFromApi[];
 *   canPublish: boolean;
 *   showStrip: boolean;
 * }} UserStoriesFeedFromApi
 */

/**
 * @typedef {{
 *   story: UserStoryFromApi;
 *   author: UserStoryAuthor;
 *   reportCount: number;
 *   reports: Array<{
 *     _id: string;
 *     reportText: string;
 *     createdAt: string;
 *     reporter: { _id: string; userName?: string };
 *   }>;
 * }} UserStoryReportGroup
 */

export {};
