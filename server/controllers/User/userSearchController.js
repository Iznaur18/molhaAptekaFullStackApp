import {
  PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
  PAYMENT_STATUS_SUCCEEDED,
} from "../../constants/yookassaConstants.js";
import { UserModel } from "../../models/index.js";
import { successRes } from "../../services/http/index.js";
import { buildRegexSearchOr } from "../../utils/buildRegexSearchOr.js";
import { getOptionalViewerFromRequest } from "../../services/user/optionalViewerFromRequest.js";
import {
  applyAdminVisibilityToUsersSearchQuery,
  sanitizeUsersSearchList,
} from "../../services/user/userProfileVisibility.js";
import { attachUserListCommerceStats } from "../../services/user/attachUserListCommerceStats.js";
import { attachUserListDonationTotals } from "../../services/user/attachUserListDonationTotals.js";
import { attachFollowersCountToUsers } from "../../services/user/userFollowHelpers.js";

const USER_SEARCH_FIELDS = ["userName"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const USER_SEARCH_LIST_PROJECTION = {
  _id: 1,
  userName: 1,
  userAvatarUrl: 1,
  userAvatarFocus: 1,
  userRole: 1,
  isPremiumUser: 1,
  isUserDataConfirmed: 1,
  isActiveUser: 1,
  isBlockedUser: 1,
  userLoyaltyPoints: 1,
  userRatingByVotes: 1,
  userAddressCity: 1,
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

  return { usersQuery, hasTextSearch: Boolean(searchCondition) };
};

/** Поиск по имени — сортировка по рейтингу в Mongo. */
const fetchUsersByRatingAggregate = async ({ usersQuery, skip, limit }) =>
  UserModel.aggregate([
    { $match: usersQuery },
    {
      $addFields: {
        ratingAvg: {
          $cond: [
            { $gt: ["$userRatingByVotes.countVotes", 0] },
            {
              $divide: [
                "$userRatingByVotes.totalRating",
                "$userRatingByVotes.countVotes",
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
        "userRatingByVotes.countVotes": -1,
        userName: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
    { $project: USER_SEARCH_LIST_PROJECTION },
  ]);

/**
 * Листинг без search: пагинация по сумме успешных донатов (lifetime).
 * totalDonatedRub дополнительно нормализуется в attachUserListDonationTotals.
 */
const fetchUsersByPodiumAggregate = async ({ usersQuery, skip, limit }) =>
  UserModel.aggregate([
    { $match: usersQuery },
    {
      $lookup: {
        from: "payments",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$userId"] },
              purpose: PAYMENT_PURPOSE_USERS_MONTHLY_DONATION,
              status: PAYMENT_STATUS_SUCCEEDED,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ["$appliedAmount", 0] } },
            },
          },
        ],
        as: "donationAgg",
      },
    },
    {
      $addFields: {
        totalDonatedRub: {
          $ifNull: [{ $arrayElemAt: ["$donationAgg.total", 0] }, 0],
        },
      },
    },
    {
      $sort: {
        totalDonatedRub: -1,
        _id: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
    { $project: USER_SEARCH_LIST_PROJECTION },
  ]);

export const userSearchController = async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { usersQuery, hasTextSearch } = buildUsersQuery(req.query);
  const viewer = await getOptionalViewerFromRequest(req);

  applyAdminVisibilityToUsersSearchQuery(usersQuery, {
    viewer,
    roleFilter: req.query.userRole,
  });

  const total = await UserModel.countDocuments(usersQuery);

  const usersRaw = hasTextSearch
    ? await fetchUsersByRatingAggregate({ usersQuery, skip, limit })
    : await fetchUsersByPodiumAggregate({ usersQuery, skip, limit });

  const usersSanitized = sanitizeUsersSearchList(usersRaw, { viewer });
  const usersWithCommerce = await attachUserListCommerceStats(usersSanitized);
  const usersWithFollowers = await attachFollowersCountToUsers(usersWithCommerce);
  const users = await attachUserListDonationTotals(usersWithFollowers);

  return successRes(res, { users, total, page, limit });
};
