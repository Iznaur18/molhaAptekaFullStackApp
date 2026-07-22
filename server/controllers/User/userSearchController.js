import { sortUsersByPodiumCriteria } from "@izibuy/shared-lib";
import { UserModel } from "../../models/index.js";
import { successRes } from "../../services/http/index.js";
import { buildRegexSearchOr } from "../../utils/buildRegexSearchOr.js";
import { getOptionalViewerFromRequest } from "../../services/user/optionalViewerFromRequest.js";
import {
  applyAdminVisibilityToUsersSearchQuery,
  sanitizeUsersSearchList,
} from "../../services/user/userProfileVisibility.js";
import { attachUserListCommerceStats } from "../../services/user/attachUserListCommerceStats.js";
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

const fetchAllUsersForPodiumListing = async (usersQuery) =>
  UserModel.find(usersQuery, USER_SEARCH_LIST_PROJECTION).lean();

export const userSearchController = async (req, res) => {
const { page, limit, skip } = parsePagination(req.query);
    const { usersQuery, hasTextSearch } = buildUsersQuery(req.query);
    const viewer = await getOptionalViewerFromRequest(req);

    applyAdminVisibilityToUsersSearchQuery(usersQuery, {
      viewer,
      roleFilter: req.query.userRole,
    });

    const total = await UserModel.countDocuments(usersQuery);

    let usersRaw;
    if (hasTextSearch) {
      usersRaw = await fetchUsersByRatingAggregate({ usersQuery, skip, limit });
    } else {
      usersRaw = await fetchAllUsersForPodiumListing(usersQuery);
    }

    const usersSanitized = sanitizeUsersSearchList(usersRaw, { viewer });
    const usersWithCommerce = await attachUserListCommerceStats(usersSanitized);
    const usersWithFollowers = await attachFollowersCountToUsers(usersWithCommerce);

    const users = hasTextSearch
      ? usersWithFollowers
      : sortUsersByPodiumCriteria(usersWithFollowers).slice(skip, skip + limit);

    return successRes(res, { users, total, page, limit });
};
