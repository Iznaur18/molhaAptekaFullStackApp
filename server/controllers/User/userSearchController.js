import { UserModel } from '../../models/index.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';
import { getOptionalViewerFromRequest } from '../../utils/optionalViewerFromRequest.js';
import {
    applyAdminVisibilityToUsersSearchQuery,
    sanitizeUsersSearchList,
} from '../../utils/userProfileVisibility.js';
import { attachUserListCommerceStats } from '../../utils/attachUserListCommerceStats.js';

const USER_PUBLIC_LIST_FIELDS =
    '_id userName userPhoneNumber email userRole isPremiumUser isUserDataConfirmed isActiveUser isBlockedUser userAvatarUrl telegramPhotoUrl userLoyaltyPoints userRatingByVotes';
const USER_SEARCH_FIELDS = ['userName', 'userPhoneNumber', 'email'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const TRUE_FLAG = 'true';

const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT),
    );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const buildUsersQuery = ({
    search,
    isPremiumUser,
    isUserDataConfirmed,
    isActiveUser,
    isBlockedUser,
    minRating,
    onlyRated,
}) => {
    const usersQuery = {};
    const searchCondition = buildRegexSearchOr(search, USER_SEARCH_FIELDS);

    if (searchCondition) Object.assign(usersQuery, searchCondition);
    if (isPremiumUser === TRUE_FLAG) usersQuery.isPremiumUser = true;
    if (isUserDataConfirmed === TRUE_FLAG) {
        usersQuery.isUserDataConfirmed = true;
    } else if (isUserDataConfirmed === 'false') {
        usersQuery.isUserDataConfirmed = { $ne: true };
    }
    if (isActiveUser === TRUE_FLAG) {
        usersQuery.isActiveUser = true;
    } else if (isActiveUser === 'false') {
        usersQuery.isActiveUser = false;
    } else {
        usersQuery.isActiveUser = { $ne: false };
    }
    if (isBlockedUser === TRUE_FLAG) {
        usersQuery.isBlockedUser = true;
    } else {
        usersQuery.isBlockedUser = { $ne: true };
    }
    const hasMinRating = typeof minRating === 'number' && !Number.isNaN(minRating);
    if (onlyRated === TRUE_FLAG || hasMinRating) {
        usersQuery['userRatingByVotes.countVotes'] = { $gte: 1 };
    }
    if (hasMinRating) {
        usersQuery.$expr = {
            $gte: [
                {
                    $divide: [
                        '$userRatingByVotes.totalRating',
                        '$userRatingByVotes.countVotes',
                    ],
                },
                minRating,
            ],
        };
    }

    return usersQuery;
};

const resolveSort = (sortParam) => {
    if (sortParam === 'rating') {
        return {
            'userRatingByVotes.countVotes': -1,
            'userRatingByVotes.totalRating': -1,
            userName: 1,
        };
    }
    return { userName: 1 };
};

export const userSearchController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const usersQuery = buildUsersQuery(req.query);
        const viewer = await getOptionalViewerFromRequest(req);

        applyAdminVisibilityToUsersSearchQuery(usersQuery, {
            viewer,
            roleFilter: req.query.userRole,
        });

        const sort = resolveSort(req.query.sort);

        const [usersRaw, total] = await Promise.all([
            UserModel.find(usersQuery)
                .select(USER_PUBLIC_LIST_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            UserModel.countDocuments(usersQuery),
        ]);

        const usersSanitized = sanitizeUsersSearchList(usersRaw, { viewer });
        const users = await attachUserListCommerceStats(usersSanitized);

        return successRes(res, { users, total, page, limit });
    } catch (error) {
        console.error('userSearchController error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении пользователей');
    }
};
