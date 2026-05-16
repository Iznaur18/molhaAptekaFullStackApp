import { UserModel } from '../../models/index.js';
import { buildRegexSearchOr, errorRes, successRes } from '../../utils/index.js';

const USER_PUBLIC_LIST_FIELDS =
    '_id userName userPhoneNumber email isPremiumUser isActiveUser isBlockedUser userAvatarUrl telegramPhotoUrl userLoyaltyPoints userRatingByVotes';
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
    isActiveUser,
    isBlockedUser,
    minRating,
    onlyRated,
}) => {
    const usersQuery = {};
    const searchCondition = buildRegexSearchOr(search, USER_SEARCH_FIELDS);

    if (searchCondition) Object.assign(usersQuery, searchCondition);
    if (isPremiumUser === TRUE_FLAG) usersQuery.isPremiumUser = true;
    if (isActiveUser === TRUE_FLAG) usersQuery.isActiveUser = true;
    if (isBlockedUser === TRUE_FLAG) usersQuery.isBlockedUser = true;

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

        const sort = resolveSort(req.query.sort);

        const [users, total] = await Promise.all([
            UserModel.find(usersQuery)
                .select(USER_PUBLIC_LIST_FIELDS)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            UserModel.countDocuments(usersQuery),
        ]);

        return successRes(res, { users, total, page, limit });
    } catch (error) {
        console.error('userSearchController error:', error);
        return errorRes(res, 500, error.message || 'Ошибка при получении пользователей');
    }
};
