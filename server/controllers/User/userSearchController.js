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

const buildUsersQuery = ({ search, isPremiumUser, isActiveUser, isBlockedUser }) => {
    const usersQuery = {};
    const searchCondition = buildRegexSearchOr(search, USER_SEARCH_FIELDS);

    if (searchCondition) Object.assign(usersQuery, searchCondition);
    if (isPremiumUser === TRUE_FLAG) usersQuery.isPremiumUser = true;
    if (isActiveUser === TRUE_FLAG) usersQuery.isActiveUser = true;
    if (isBlockedUser === TRUE_FLAG) usersQuery.isBlockedUser = true;

    return usersQuery;
};

export const userSearchController = async (req, res) => {
    try {
        const { page, limit, skip } = parsePagination(req.query);
        const usersQuery = buildUsersQuery(req.query);

        const [users, total] = await Promise.all([
            UserModel.find(usersQuery)
                .select(USER_PUBLIC_LIST_FIELDS)
                .sort({ userName: 1 })
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
