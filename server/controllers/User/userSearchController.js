import { UserModel } from '../../models/index.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';
import { getOptionalViewerFromRequest } from '../../utils/optionalViewerFromRequest.js';
import {
    applyAdminVisibilityToUsersSearchQuery,
    sanitizeUsersSearchList,
} from '../../utils/userProfileVisibility.js';
import { attachUserListCommerceStats } from '../../utils/attachUserListCommerceStats.js';
import { attachFollowersCountToUsers } from '../../utils/userFollowHelpers.js';

const USER_SEARCH_FIELDS = ['userName', 'userPhoneNumber', 'email'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const USER_PUBLIC_LIST_PROJECTION = {
    _id: 1,
    userName: 1,
    userPhoneNumber: 1,
    email: 1,
    userRole: 1,
    isPremiumUser: 1,
    isUserDataConfirmed: 1,
    isActiveUser: 1,
    isBlockedUser: 1,
    userAvatarUrl: 1,
    userAvatarFocus: 1,
    userLoyaltyPoints: 1,
    userRatingByVotes: 1,
};

const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT),
    );
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const buildUsersQuery = ({ search }) => {
    const usersQuery = {};
    const searchCondition = buildRegexSearchOr(search, USER_SEARCH_FIELDS);

    if (searchCondition) Object.assign(usersQuery, searchCondition);
    usersQuery.isActiveUser = { $ne: false };
    usersQuery.isBlockedUser = { $ne: true };

    return usersQuery;
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

        const usersRaw = await UserModel.aggregate([
            { $match: usersQuery },
            {
                $addFields: {
                    ratingAvg: {
                        $cond: [
                            { $gt: ['$userRatingByVotes.countVotes', 0] },
                            {
                                $divide: [
                                    '$userRatingByVotes.totalRating',
                                    '$userRatingByVotes.countVotes',
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $sort: {
                    ratingAvg: -1,
                    'userRatingByVotes.countVotes': -1,
                    userName: 1,
                },
            },
            { $skip: skip },
            { $limit: limit },
            { $project: USER_PUBLIC_LIST_PROJECTION },
        ]);
        const total = await UserModel.countDocuments(usersQuery);

        const usersSanitized = sanitizeUsersSearchList(usersRaw, { viewer });
        const usersWithCommerce = await attachUserListCommerceStats(usersSanitized);
        const users = await attachFollowersCountToUsers(usersWithCommerce);

        return successRes(res, { users, total, page, limit });
    } catch (error) {
        console.error('userSearchController error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении пользователей');
    }
};
